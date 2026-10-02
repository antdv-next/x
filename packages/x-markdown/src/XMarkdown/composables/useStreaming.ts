import type { Component } from "vue";

import { computed, ref, watch, type Ref } from "vue";

import type {
  FenceState,
  SectionState,
  StreamCache,
  StreamCacheTokenType,
  StreamingOption,
  TableState,
} from "../interface";

import {
  detectUnclosedComponentTags,
  hasUnclosedRawTags,
} from "../core/detectUnclosedComponentTags";
import { StreamCacheTokenType as TokenType } from "../interface";
import { resolveStreaming } from "../utils/streaming";

/**
 * When a token is about to be committed, if a non-empty string is returned,
 * only that prefix is committed and the rest of the pending content is left
 * for subsequent recognition (used for handover scenarios like list followed by `).
 * Returns null to commit the entire pending content by default.
 */
interface Recognizer {
  tokenType: StreamCacheTokenType;
  isStartOfToken: (markdown: string) => boolean;
  isStreamingValid: (markdown: string, cache: StreamCache) => boolean;
  getCommitPrefix?: (pending: string) => string | null;
}

/* ------------ Constants ------------ */
// Column-0 ATX heading line (`# ` … `###### `, or a bare `#`).
const HEADING_LINE = /^#{1,6}(?:[ \t]|$)/;
// Validates whether a token is still incomplete in the streaming context.
// Returns true if the token is syntactically incomplete; false if it is complete or invalid.
const STREAM_INCOMPLETE_REGEX = {
  image: [
    /^!\[[^\]\r\n]{0,1000}$/,
    /^!\[[^\r\n]{0,1000}\]\(*[^)\r\n]{0,1000}$/,
  ],
  link: [/^\[[^\]\r\n]{0,1000}$/, /^\[[^\r\n]{0,1000}\]\(*[^)\r\n]{0,1000}$/],
  html: [/^<\/$/, /^<\/?[a-zA-Z][a-zA-Z0-9-]{0,100}[^>\r\n]{0,1000}$/],
  commonEmphasis: [/^(\*{1,3}|_{1,3})(?!\s)(?!.*\1$)[^\r\n]{0,1000}$/],
  list: [
    /^[-+*]\s{0,3}$/,
    /^[-+*]\s{1,3}(\*{1,3}|_{1,3})(?!\s)(?!.*\1$)[^\r\n]{0,1000}$/,
  ],
  "inline-code": [/^`[^`\r\n]{0,300}$/],
} as const;

/** Header + delimiter row shape check. Cost is bounded by those two rows, not by pending. */
const isTableShapeValid = (header: string, separator: string) => {
  const trimmedHeader = header.trim();
  if (!/^\|.*\|$/.test(trimmedHeader)) return false;

  const trimmedSeparator = separator.trim();
  const columns = trimmedSeparator
    .split("|")
    .map(col => col.trim())
    .filter(Boolean);

  const separatorRegex = /^:?-+:?$/;
  return columns.every((col, index) =>
    index === columns.length - 1
      ? col === ":" || separatorRegex.test(col)
      : separatorRegex.test(col),
  );
};

/**
 * Same verdict as scanning the whole pending buffer, but read off the
 * incrementally maintained state instead — O(1) once the delimiter row is
 * terminated, which is where a long table spends all of its characters.
 */
const isTableInComplete = (table: TableState) => {
  if (table.hasBlankLine) return false;
  // Only the header row so far: still incomplete by definition.
  if (table.newlines === 0) return true;
  if (table.shape !== null) return table.shape;
  return isTableShapeValid(table.firstLine, table.secondLine);
};

const tokenRecognizerMap: Partial<Record<StreamCacheTokenType, Recognizer>> = {
  [TokenType.Link]: {
    tokenType: TokenType.Link,
    isStartOfToken: markdown => markdown.startsWith("["),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX.link.some(re => re.test(markdown)),
  },
  [TokenType.Image]: {
    tokenType: TokenType.Image,
    isStartOfToken: markdown => markdown.startsWith("!"),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX.image.some(re => re.test(markdown)),
  },
  [TokenType.Html]: {
    tokenType: TokenType.Html,
    isStartOfToken: markdown => markdown.startsWith("<"),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX.html.some(re => re.test(markdown)),
  },
  [TokenType.Emphasis]: {
    tokenType: TokenType.Emphasis,
    isStartOfToken: markdown =>
      markdown.startsWith("*") || markdown.startsWith("_"),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX.commonEmphasis.some(re => re.test(markdown)),
  },
  [TokenType.List]: {
    tokenType: TokenType.List,
    isStartOfToken: markdown => /^[-+*]/.test(markdown),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX.list.some(re => re.test(markdown)),
    // On backtick after list, commit only the prefix; treat the rest as inline code.
    getCommitPrefix: (pending: string) => {
      const listPrefix = pending.match(/^([-+*]\s{0,3})/)?.[1];
      const rest = listPrefix ? pending.slice(listPrefix.length) : "";
      return listPrefix && rest.startsWith("`") ? listPrefix : null;
    },
  },
  [TokenType.Table]: {
    tokenType: TokenType.Table,
    isStartOfToken: markdown => markdown.startsWith("|"),
    isStreamingValid: (_markdown: string, cache: StreamCache) =>
      isTableInComplete(cache.table),
  },
  [TokenType.InlineCode]: {
    tokenType: TokenType.InlineCode,
    isStartOfToken: markdown => markdown.startsWith("`"),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX["inline-code"].some(re => re.test(markdown)),
  },
};

const recognize = (
  cache: StreamCache,
  tokenType: StreamCacheTokenType,
): void => {
  const recognizer = tokenRecognizerMap[tokenType];
  if (!recognizer) return;

  const { token, pending } = cache;
  if (token === TokenType.Text && recognizer.isStartOfToken(pending)) {
    cache.token = tokenType;
    return;
  }

  if (token === tokenType && !recognizer.isStreamingValid(pending, cache)) {
    const prefix = recognizer.getCommitPrefix?.(pending);
    if (prefix) {
      cache.completeMarkdown += prefix;
      cache.pending = pending.slice(prefix.length);
      // pending was rewritten rather than appended to, so the incremental state
      // has to be rebuilt from it — a one-off cost over a single token's text.
      rebuildTableState(cache.table, cache.pending);
      cache.token = TokenType.Text;
      return;
    }
    commitCache(cache);
  }
};

const recognizeHandlers = Object.values(tokenRecognizerMap).filter(
  (recognizer): recognizer is Recognizer => Boolean(recognizer),
);

/* ------------ Utils ------------ */
const getInitialFenceState = (): FenceState => ({
  inFenced: false,
  fenceChar: "",
  fenceLen: 0,
  lineIndent: 0,
  lineFenceChar: "",
  lineFenceLen: 0,
  lineFenceRunEnded: false,
  lineTailBlank: true,
});

const getInitialTableState = (): TableState => ({
  newlines: 0,
  lastWasNewline: false,
  hasBlankLine: false,
  firstLine: "",
  secondLine: "",
  shape: null,
});

const resetTableState = (table: TableState): void => {
  table.newlines = 0;
  table.lastWasNewline = false;
  table.hasBlankLine = false;
  table.firstLine = "";
  table.secondLine = "";
  table.shape = null;
};

/** Advance the table state by one appended character. O(1). */
const feedTableState = (table: TableState, char: string): void => {
  if (char === "\n") {
    if (table.lastWasNewline) table.hasBlankLine = true;
    table.lastWasNewline = true;
    table.newlines += 1;
    // The delimiter row is terminated: its verdict can no longer change, so
    // freeze it and stop re-deriving it for every remaining character.
    if (table.newlines === 2) {
      table.shape = isTableShapeValid(table.firstLine, table.secondLine);
    }
    return;
  }
  table.lastWasNewline = false;
  if (table.newlines === 0) {
    table.firstLine += char;
  } else if (table.newlines === 1) {
    table.secondLine += char;
  }
};

/** Rebuild from scratch. Only used when pending is replaced instead of appended to. */
const rebuildTableState = (table: TableState, pending: string): void => {
  resetTableState(table);
  for (const char of pending) feedTableState(table, char);
};

const getInitialSectionState = (): SectionState => ({
  offsets: [],
  lineStart: 0,
  inHtmlBlock: false,
  noSplit: false,
  rawBlock: null,
});

const getInitialCache = (): StreamCache => ({
  pending: "",
  token: TokenType.Text,
  processedLength: 0,
  completeMarkdown: "",
  fence: getInitialFenceState(),
  table: getInitialTableState(),
  sections: getInitialSectionState(),
});

const commitCache = (cache: StreamCache): void => {
  if (cache.pending) {
    cache.completeMarkdown += cache.pending;
    cache.pending = "";
  }
  resetTableState(cache.table);
  cache.token = TokenType.Text;
};

/**
 * Incremental fenced-code-block state over the processed text, updated in O(1)
 * per character. Recomputing over the full accumulated text on every character
 * is O(N²) and freezes the page on long single-line content such as base64
 * image data URIs.
 */
const feedFenceState = (fence: FenceState, char: string): void => {
  if (char === "\n") {
    // Line completed: apply it to the fence state, then reset per-line tracking.
    if (fence.lineFenceLen >= 3) {
      if (!fence.inFenced) {
        fence.inFenced = true;
        fence.fenceChar = fence.lineFenceChar;
        fence.fenceLen = fence.lineFenceLen;
      } else if (
        fence.lineFenceChar === fence.fenceChar &&
        fence.lineFenceLen >= fence.fenceLen &&
        fence.lineTailBlank
      ) {
        // A closing fence only takes effect once its line is completed by a
        // newline; while it is still the last partial line the fence stays
        // open for potential streaming continuation.
        fence.inFenced = false;
        fence.fenceChar = "";
        fence.fenceLen = 0;
      }
    }
    fence.lineIndent = 0;
    fence.lineFenceChar = "";
    fence.lineFenceLen = 0;
    fence.lineFenceRunEnded = false;
    fence.lineTailBlank = true;
    return;
  }

  if (!fence.lineFenceRunEnded) {
    if (fence.lineFenceLen === 0 && char === " " && fence.lineIndent < 3) {
      // CommonMark allows an opening or closing fence to be indented by up to
      // three spaces; four would make the line indented code instead.
      fence.lineIndent += 1;
    } else if (fence.lineFenceLen === 0 && (char === "`" || char === "~")) {
      fence.lineFenceChar = char;
      fence.lineFenceLen = 1;
    } else if (fence.lineFenceLen > 0 && char === fence.lineFenceChar) {
      fence.lineFenceLen += 1;
    } else {
      fence.lineFenceRunEnded = true;
      fence.lineTailBlank = fence.lineTailBlank && /\s/.test(char);
    }
  } else {
    fence.lineTailBlank = fence.lineTailBlank && /\s/.test(char);
  }
};

// An opening fence takes effect as soon as it appears, even on the partial last line.
const isInCodeBlock = (fence: FenceState): boolean =>
  fence.inFenced || fence.lineFenceLen >= 3;

/* ------------ Sections ------------ */

/** Sections shorter than this are merged into the next one. */
export const DEFAULT_MIN_SECTION_CHARS = 200;

// Section boundaries are placed before column-0 ATX headings only (see
// HEADING_LINE above). CommonMark also allows a heading to be indented by
// one to three spaces; those are rare in generated text and simply not split on.
// Link reference definition or footnote definition. Either can be referenced
// from any other block of the document, so once one is seen the document is
// no longer splittable.
const DEFINITION_LINE = /^ {0,3}\[[^\]]*\]:/;
// HTML blocks of CommonMark type 1 (end only at their closing tag) and type 2
// (comments), plus the Latex plugin's block delimiters. All of them may
// contain blank lines followed by a `#` line that is *not* a heading.
const RAW_HTML_BLOCK_OPEN = /^ {0,3}<(pre|script|style|textarea)(?=[\s>]|$)/i;
const HTML_COMMENT_OPEN = /^ {0,3}<!--/;
const MATH_DOLLAR_LINE = /^(\${1,2})\s*$/;
const MATH_BRACKET_OPEN = /^\\\[/;
// Any other HTML block start (CommonMark types 3–7): a tag, closing tag,
// declaration or processing instruction at the start of a line. Such a block
// runs to the next blank line; treating every `<x` line this way is slightly
// conservative (type 7 cannot interrupt a paragraph) but never wrong.
const HTML_BLOCK_OPEN = /^ {0,3}<(?:[a-zA-Z]|\/[a-zA-Z]|!|\?)/;

const detectRawBlockOpen = (line: string): SectionState["rawBlock"] => {
  const html = line.match(RAW_HTML_BLOCK_OPEN);
  if (html) {
    const close = `</${html[1].toLowerCase()}`;
    return line.toLowerCase().includes(close) ? null : { close, exact: false };
  }
  if (HTML_COMMENT_OPEN.test(line)) {
    return line.includes("-->") ? null : { close: "-->", exact: false };
  }
  const dollar = line.match(MATH_DOLLAR_LINE);
  if (dollar) return { close: dollar[1], exact: true };
  if (MATH_BRACKET_OPEN.test(line)) {
    return line.includes("\\]") ? null : { close: "\\]", exact: false };
  }
  return null;
};

const closesRawBlock = (
  line: string,
  rawBlock: NonNullable<SectionState["rawBlock"]>,
): boolean =>
  rawBlock.exact
    ? line.trim() === rawBlock.close
    : line.toLowerCase().includes(rawBlock.close);

/**
 * Called once per completed line (right after its '\n' has been fed to the
 * fence state). Decides whether the line that just ended starts a new section.
 * O(line) per line, so O(N) over the whole stream.
 */
const trackSectionBoundary = (
  cache: StreamCache,
  text: string,
  newlineIndex: number,
  componentNames: string[],
  minSectionChars: number,
): void => {
  const state = cache.sections;
  const lineStart = state.lineStart;
  const line = text.slice(lineStart, newlineIndex);
  const blank = line.trim() === "";
  state.lineStart = newlineIndex + 1;

  if (state.noSplit) return;
  if (state.rawBlock) {
    if (closesRawBlock(line, state.rawBlock)) state.rawBlock = null;
    return;
  }
  if (state.inHtmlBlock) {
    if (blank) state.inHtmlBlock = false;
    return;
  }
  // The fence state has already consumed this line's '\n': for a body line of
  // a fence it is still open, for the opening line it has just opened, and for
  // the closing line it has just closed. Neither an opening nor a closing
  // fence line can match the patterns below, so checking after the feed is safe.
  if (cache.fence.inFenced) return;

  const rawBlock = detectRawBlockOpen(line);
  if (rawBlock) {
    state.rawBlock = rawBlock;
    return;
  }
  if (HTML_BLOCK_OPEN.test(line)) {
    state.inHtmlBlock = true;
    return;
  }
  if (DEFINITION_LINE.test(line)) {
    state.noSplit = true;
    state.offsets = [];
    return;
  }
  // An ATX heading can interrupt a paragraph, a list, a blockquote and a GFM
  // table, so outside the constructs tracked above a column-0 heading line
  // always starts a new block — no blank line before it is required.
  if (!HEADING_LINE.test(line)) return;

  const sectionStart = state.offsets.length
    ? state.offsets[state.offsets.length - 1]
    : 0;
  // A boundary at the very start of the document (or of the current section)
  // would only produce an empty section.
  if (lineStart <= sectionStart || lineStart - sectionStart < minSectionChars)
    return;
  // A custom component opened in this section and closed in a later one would
  // be reported as unclosed (and auto-closed by DOMPurify) if the section were
  // parsed on its own.
  const sectionText = text.slice(sectionStart, lineStart);
  if (
    componentNames.length > 0 &&
    detectUnclosedComponentTags(sectionText, componentNames).size > 0
  ) {
    return;
  }
  // Same veto for raw HTML containers: CommonMark ends an HTML block at a
  // blank line, but the browser keeps nesting into an unclosed <div> (or any
  // non-void element) until its closing tag — auto-closing it at the section
  // end would give the split DOM a different shape from the whole-document
  // DOM.
  if (sectionText.includes("<") && hasUnclosedRawTags(sectionText)) {
    return;
  }
  state.offsets.push(lineStart);
};

/**
 * Slice `output` at the recorded boundaries. A boundary past `limit` falls
 * inside the pending token — a heading right after a table row is held in the
 * table's pending text until the table's terminating blank line — and is left
 * for a later chunk.
 */
const buildSections = (
  cache: StreamCache,
  output: string,
  limit: number,
): string[] | null => {
  const { offsets } = cache.sections;
  if (cache.sections.noSplit || offsets.length === 0) return null;
  const sections: string[] = [];
  let start = 0;
  for (const offset of offsets) {
    if (offset > limit) break;
    sections.push(output.slice(start, offset));
    start = offset;
  }
  if (sections.length === 0) return null;
  sections.push(output.slice(start));
  return sections;
};

/* ------------ Completion of the pending token ------------ */

const EMPHASIS_MARKER = /^(\*{1,3}|_{1,3})/;
const INLINE_CODE_MARKER = /^`+/;
const LIST_PREFIX = /^([-+*]\s{0,3})([\s\S]*)$/;
const TRAILING_WHITESPACE = /\s+$/;

/**
 * Close an emphasis run that is still open. The closing delimiter has to be
 * right-flanking (not preceded by whitespace), so trailing whitespace is moved
 * after it: `**bold and ` → `**bold and** `.
 */
const completeEmphasis = (pending: string): string | undefined => {
  const marker = pending.match(EMPHASIS_MARKER)?.[0] ?? "";
  const body = pending.slice(marker.length);
  const trimmed = body.replace(TRAILING_WHITESPACE, "");
  if (!trimmed) return undefined;
  return `${marker}${trimmed}${marker}${body.slice(trimmed.length)}`;
};

/**
 * Render the pending token as finished text instead of a placeholder, for the
 * `incompleteMarkdown: 'complete'` mode. Works on the pending token only, so
 * it costs O(pending) and never touches the committed text or the cache.
 * Returns undefined to keep the token hidden, exactly like placeholder mode.
 */
const completePending = (
  token: StreamCacheTokenType,
  pending: string,
): string | undefined => {
  switch (token) {
    case TokenType.Emphasis:
      return completeEmphasis(pending);
    case TokenType.InlineCode: {
      const marker = pending.match(INLINE_CODE_MARKER)?.[0] ?? "";
      return pending.length > marker.length ? `${pending}${marker}` : undefined;
    }
    case TokenType.Link: {
      // `[text](https://x` and `[tex` both show their text; the link itself
      // appears once the token completes.
      const close = pending.indexOf("]");
      const text = close === -1 ? pending.slice(1) : pending.slice(1, close);
      return text || undefined;
    }
    case TokenType.List: {
      // `- **bo` → `- **bo**`; a bare marker stays hidden.
      const match = pending.match(LIST_PREFIX);
      if (!match) return undefined;
      const [, prefix, rest] = match;
      if (!rest) return undefined;
      const completed = EMPHASIS_MARKER.test(rest)
        ? completeEmphasis(rest)
        : rest;
      return completed ? `${prefix}${completed}` : undefined;
    }
    default:
      // image, html, table: nothing sensible can be shown before they finish.
      return undefined;
  }
};

const sanitizeForURIComponent = (input: string): string => {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);

    // 处理代理对：保留合法，跳过孤立
    if (charCode >= 0xd800 && charCode <= 0xdbff) {
      // High surrogate
      // Check for a following low surrogate to form a valid pair
      if (
        i + 1 < input.length &&
        input.charCodeAt(i + 1) >= 0xdc00 &&
        input.charCodeAt(i + 1) <= 0xdfff
      ) {
        result += input[i] + input[i + 1];
        i++; // Skip the low surrogate as it's already processed
      }
      // Lone high surrogates are otherwise skipped
    } else if (charCode < 0xdc00 || charCode > 0xdfff) {
      // Append characters that are not lone low surrogates
      result += input[i];
    }
    // Lone low surrogates are otherwise skipped
  }
  return result;
};

const safeEncodeURIComponent = (str: string): string => {
  try {
    return encodeURIComponent(str);
  } catch (error) {
    if (error instanceof URIError) {
      return encodeURIComponent(sanitizeForURIComponent(str));
    }
    return "";
  }
};

/* ------------ Main composables ------------ */

export interface StreamingResult {
  /** The markdown to parse: committed text plus the placeholder for the pending token */
  output: Ref<string>;
  /**
   * `output` split at section boundaries when `streaming.incremental` is on
   * and at least one boundary exists; `null` means render `output` as a whole.
   * Joining the sections always gives back `output`.
   */
  sections: Ref<string[] | null>;
  reset: () => void;
}

const resolveMinSectionChars = (
  incremental: StreamingOption["incremental"],
): number =>
  typeof incremental === "object" &&
  typeof incremental.minSectionChars === "number"
    ? incremental.minSectionChars
    : DEFAULT_MIN_SECTION_CHARS;

const resolveKeepSectionsOnEnd = (
  incremental: StreamingOption["incremental"],
): boolean =>
  typeof incremental === "object"
    ? incremental.keepSectionsOnEnd !== false
    : true;

/**
 * Streaming state machine plus, when `streaming.incremental` is on, the
 * section boundaries the renderer can memoise on. `useStreaming` is the
 * backwards-compatible view of this composable.
 */
export function useStreamingCore(
  content: Ref<string>,
  streaming: Ref<boolean | StreamingOption | undefined>,
  components?: Ref<Record<string, Component> | undefined>,
): StreamingResult {
  const resolvedStreaming = computed(() => resolveStreaming(streaming.value));

  // Deliberately a plain (non-reactive) object: processStreaming touches
  // every field on every character, and going through a deep reactive proxy
  // costs a get/set/trigger chain per field per char, which makes long
  // single-line content such as base64 image data URIs (~300 KB) take tens
  // of seconds on slower machines. The cache is internal only - callers see
  // `output`, `sections` and `reset`.
  let streamCache: StreamCache = getInitialCache();
  const processedContent = ref("");
  const sections = ref<string[] | null>(null);

  function handleIncompleteMarkdown(
    cache: StreamCache,
    opts?: StreamingOption,
  ): string | undefined {
    const { token, pending } = cache;
    if (token === TokenType.Text) return undefined;

    /**
     * An image tag starts with '!', if it's the only character, it's incomplete and should be stripped.
     * ！
     * ^
     */
    if (token === TokenType.Image && pending === "!") {
      return undefined;
    }

    /**
     * If a table has more than two lines (header, separator, and at least one row),
     * it's considered complete enough to not be replaced by a placeholder.
     * | column1 | column2 |\n| -- | --|\n
     *                                   ^
     */
    if (token === TokenType.Table && cache.table.newlines > 1) {
      return pending;
    }

    const componentMap = opts?.incompleteMarkdownComponentMap || {};
    // An explicit placeholder component for this token always wins over
    // completion, so existing incompleteMarkdownComponentMap setups are
    // unaffected by `incompleteMarkdown: 'complete'`.
    if (opts?.incompleteMarkdown === "complete" && !componentMap[token]) {
      return completePending(token, pending);
    }

    const componentName = componentMap[token] ?? `incomplete-${token}`;
    if (!components?.value?.[componentName]) {
      return undefined;
    }

    const encodedPending = safeEncodeURIComponent(pending);
    return `<${componentName} data-raw="${encodedPending}" />`;
  }

  /**
   * Advance the cache to `text` and return the streaming output. It is
   * idempotent: re-running it for the same `text` finds an empty chunk and
   * only re-derives the output.
   */
  function processStreaming(text: string, opts?: StreamingOption): string {
    if (!text) {
      streamCache = getInitialCache();
      return "";
    }

    const expectedPrefix = streamCache.completeMarkdown + streamCache.pending;

    // Reset cache if input doesn't continue from previous state
    if (!text.startsWith(expectedPrefix)) {
      streamCache = getInitialCache();
    }

    const cache = streamCache;
    const chunk = text.slice(cache.processedLength);
    const trackSections = !!opts?.incremental;
    const minSectionChars = resolveMinSectionChars(opts?.incremental);
    const componentNames = Object.keys(components?.value ?? {});

    // Absolute offset of `char` in `text`; advanced by the UTF-16 length of
    // each code point because the loop iterates code points.
    let offset = cache.processedLength;
    cache.processedLength += chunk.length;

    for (const char of chunk) {
      cache.pending += char;

      feedFenceState(cache.fence, char);
      feedTableState(cache.table, char);
      if (trackSections && char === "\n") {
        trackSectionBoundary(
          cache,
          text,
          offset,
          componentNames,
          minSectionChars,
        );
      }
      offset += char.length;

      if (isInCodeBlock(cache.fence)) {
        commitCache(cache);
        continue;
      }

      if (cache.token === TokenType.Text) {
        for (const handler of recognizeHandlers) {
          recognize(cache, handler.tokenType);
        }
      } else {
        const currentHandler = recognizeHandlers.find(
          handler => handler.tokenType === cache.token,
        );
        if (currentHandler) {
          recognize(cache, currentHandler.tokenType);
        }

        // After commit (e.g. list → Text), re-run all recognizers so pending (e.g. "`") becomes the new token (e.g. inline-code)
        const tokenAfterRecognize = cache.token as StreamCacheTokenType;
        if (tokenAfterRecognize === TokenType.Text) {
          for (const handler of recognizeHandlers) {
            recognize(cache, handler.tokenType);
          }
        }
      }

      if (cache.token === TokenType.Text) {
        commitCache(cache);
      }
    }

    const incompletePlaceholder = handleIncompleteMarkdown(cache, opts);
    return cache.completeMarkdown + (incompletePlaceholder || "");
  }

  function reset(): void {
    streamCache = getInitialCache();
    processedContent.value = "";
    sections.value = null;
  }

  watch(
    [
      content,
      resolvedStreaming,
      () => resolvedStreaming.value?.hasNextChunk,
      () => resolvedStreaming.value?.incremental,
      () => resolvedStreaming.value?.incompleteMarkdown,
      () => resolvedStreaming.value?.incompleteMarkdownComponentMap,
      () => components?.value,
    ],
    () => {
      const newContent = content.value;
      const opts = resolvedStreaming.value;
      const enableCache = Boolean(opts?.hasNextChunk);
      const trackSections = !!opts?.incremental;

      if (!enableCache) {
        const cache = streamCache;
        const keepSectionsOnEnd = resolveKeepSectionsOnEnd(opts?.incremental);
        const continuesStream =
          trackSections &&
          keepSectionsOnEnd &&
          cache.processedLength > 0 &&
          newContent.startsWith(cache.completeMarkdown + cache.pending);
        if (continuesStream) {
          // The stream just ended (or the caller re-rendered after it ended).
          // Keep the sections so already-mounted custom components are not
          // remounted; only the last section re-parses. The output is the raw
          // input: nothing is pending any more.
          processStreaming(newContent, opts);
          processedContent.value = newContent;
          sections.value = buildSections(cache, newContent, newContent.length);
          return;
        }
        // Non-streaming (or keepSectionsOnEnd: false): render the whole input
        // at once, exactly as a non-streaming render would.
        streamCache = getInitialCache();
        processedContent.value = newContent;
        sections.value = null;
        return;
      }

      const output = processStreaming(newContent, opts);
      processedContent.value = output;
      sections.value = trackSections
        ? buildSections(
            streamCache,
            output,
            streamCache.completeMarkdown.length,
          )
        : null;
    },
    { immediate: true },
  );

  return {
    output: processedContent,
    sections,
    reset,
  };
}

export function useStreaming(
  content: Ref<string>,
  streaming: Ref<boolean | StreamingOption | undefined>,
  components?: Ref<Record<string, Component> | undefined>,
) {
  const { output, reset } = useStreamingCore(content, streaming, components);

  return {
    processedContent: output,
    reset,
  };
}
