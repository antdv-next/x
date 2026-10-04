import type { Component } from "vue";

import { Marked } from "marked";
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
  noSplit: false,
  definitionLookahead: 0,
  rawBlock: null,
  openBlock: null,
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
// no longer splittable. Definitions may also live inside blockquotes and list
// items (`> [a]: /x`, `- [a]: /x`) and still apply document-wide, so leading
// quote/list markers are skipped before the `[label]:` test.
const DEFINITION_LINE =
  /^ {0,3}(?:(?:>[ \t]*)|(?:[-+*]|\d{1,9}[.)])[ \t]+)*\[[^\]]*\]:/;
/* ------------ Section boundaries ------------ */

/*
 * DESIGN CONTRACT — read this before "fixing" a case where no boundary is
 * placed.
 *
 * A section boundary is only allowed before a column-0 ATX heading line, and
 * only when that line really starts a new top-level block. A boundary at a
 * point the whole-document parse keeps *inside* a block renders different
 * markup from the one-shot render, which is the one invariant this feature
 * has to hold; refusing a boundary merely gives up incremental reuse.
 *
 * Which lines qualify is exactly what marked's block tokenizer decides, so we
 * ask marked (`startsNewTopLevelBlock`) instead of re-deriving its grammar.
 * Earlier revisions hand-modelled marked's list-item continuation, blockquote
 * laziness, paragraph interruption, setext eligibility and the fenced-code /
 * HTML block rules; every model was an approximation, so each round of
 * differential review found another input where model and parser disagreed,
 * and every fix added state (the whole thing grew by ~950 lines). That model
 * is gone. This tracker keeps only:
 *
 *   1. `offsets` / `lineStart` / `noSplit` — the section state itself;
 *   2. a conservative raw-block state (`<pre>`, comments, processing
 *      instructions, declarations, CDATA, `$$` / `\[` math): while one is
 *      open, no boundary is recorded. This is *not* a parse of those blocks;
 *      they are exactly the constructs whose raw text the browser and
 *      DOMPurify re-interpret (`<?php` opens a bogus comment that can swallow
 *      a following `<h1>` open tag), so keeping them inside one section is a
 *      safety rule, and erring towards "still open" only ever loses a split;
 *   3. a bounded memo of "marked says a heading here is still inside an open
 *      block", so a fenced code block full of column-0 `#` comment lines is
 *      not re-lexed once per line.
 *
 * The one document-global "must refuse" condition — a link reference /
 * footnote definition, which any other block may reference — is *not* modelled
 * as state. It is asked of the renderer's marked (its `links` map) ahead of
 * every block state, so neither the raw-block state nor a fence can hide a
 * real definition or fake one out of body text.
 *
 * The full history — every deliberate divergence from upstream, the upstream
 * bugs we fix, and the remaining limits — is recorded in
 * `memory/x-markdown-streaming-sections.md`. Read it before changing this.
 */

/** Raw HTML blocks whose end condition may span blank lines (CommonMark 1–2/3–5). */
const RAW_HTML_BLOCK_OPEN = /^ {0,3}<(pre|script|style|textarea)(?=[\s>]|$)/i;
const HTML_COMMENT_OPEN = /^ {0,3}<!--/;
const HTML_PI_OPEN = /^ {0,3}<\?/;
const HTML_DECLARATION_OPEN = /^ {0,3}<![a-zA-Z]/;
const HTML_CDATA_OPEN = /^ {0,3}<!\[CDATA\[/;
// The Latex plugin's block rule needs its closing delimiter to recognise the
// block at all, so a prefix-based check cannot see block math — it is tracked
// here instead. Without the plugin registered these lines are plain text, and
// suppressing a boundary on them is merely conservative.
const MATH_DOLLAR_LINE = /^(\${1,2})$/;
const MATH_BRACKET_OPEN = /^\\\[/;

/**
 * The close condition of a raw block opened by `line`, or null. A block that
 * already closed on its own line (`<pre>x</pre>`, `<!-- x -->`) is not open.
 */
const detectRawBlockOpen = (
  line: string,
): { close: string; exact: boolean; bodyChars?: number } | null => {
  const html = line.match(RAW_HTML_BLOCK_OPEN);
  if (html) {
    const close = `</${html[1].toLowerCase()}`;
    return line.toLowerCase().includes(close) ? null : { close, exact: false };
  }
  if (HTML_COMMENT_OPEN.test(line)) {
    return line.includes("-->") ? null : { close: "-->", exact: false };
  }
  if (HTML_PI_OPEN.test(line)) {
    return line.includes("?>") ? null : { close: "?>", exact: false };
  }
  if (HTML_CDATA_OPEN.test(line)) {
    return line.includes("]]>") ? null : { close: "]]>", exact: false };
  }
  if (HTML_DECLARATION_OPEN.test(line)) {
    return line.includes(">") ? null : { close: ">", exact: false };
  }
  const dollar = line.match(MATH_DOLLAR_LINE);
  if (dollar) return { close: dollar[1], exact: true, bodyChars: 0 };
  if (MATH_BRACKET_OPEN.test(line)) {
    return line.includes("\\]") ? null : { close: "\\]", exact: false };
  }
  return null;
};

/**
 * Whether `line` closes `rawBlock`. `$$` math (exact) closes only at a
 * column-0 run of the opening delimiter, matching the bundled Latex plugin.
 */
const closesRawBlock = (
  line: string,
  rawBlock: NonNullable<SectionState["rawBlock"]>,
): boolean =>
  rawBlock.exact
    ? line.startsWith(rawBlock.close) &&
      !line.startsWith(`${rawBlock.close}$`) &&
      /^[ \t]*$/.test(line.slice(rawBlock.close.length))
    : line.toLowerCase().includes(rawBlock.close);

/** How far a memoised "still inside an open block" verdict may be trusted. */
const OPEN_BLOCK_MEMO_CHARS = 4096;

/** The line appended to probe whether a heading starts a new top-level block. */
const PROBE_HEADING = "# x\n";

/**
 * True when `prefix` plus a column-0 ATX heading parses into strictly more
 * top-level blocks than `prefix` alone — i.e. the heading starts a new
 * top-level block instead of being swallowed by one the prefix left open.
 */
const startsNewTopLevelBlock = (
  lex: (markdown: string) => readonly unknown[],
  prefix: string,
): boolean => lex(prefix + PROBE_HEADING).length > lex(prefix).length;

/**
 * How many lines after its `[label]:` line a definition may still complete.
 * CommonMark allows the destination and the title each to start on the next
 * line, so three lines is the most one definition spans; the window is only a
 * bound on re-probing, never a correctness limit (a definition that somehow
 * needed longer would simply be missed, and a missed definition is a lost
 * split, not a wrong boundary).
 */
const DEFINITION_LOOKAHEAD = 3;

/** The token array `lex` returns also carries marked's collected `links` map. */
type LexResult = readonly unknown[] & { links?: Record<string, unknown> };

/**
 * Whether `markdown` contains at least one link reference / footnote
 * definition, per the renderer's own marked. Its `links` map collects
 * definitions from any depth (`> [a]: /x`, `- [a]: /x`) and stays empty for a
 * definition-shaped line inside fence, comment, `<pre>` or math body — which
 * is exactly the distinction the tracker must make.
 */
const hasDefinition = (
  lex: (markdown: string) => readonly unknown[],
  markdown: string,
): boolean => Object.keys((lex(markdown) as LexResult).links ?? {}).length > 0;

/**
 * The only document-global "must refuse" rule: a link reference / footnote
 * definition can be referenced from any section, so once the document contains
 * one no boundary may be recorded and the offsets already recorded are
 * discarded. Asked of the renderer's marked (`hasDefinition`), never read off
 * the line's position, so a raw block that consumes the line can hide neither
 * a real definition nor a definition-shaped line that is really body text. The
 * call site in `trackSectionBoundary` runs this before every block state for
 * exactly that reason.
 *
 * `complete` marks a line terminated by `\n`; only those arm or advance the
 * lookahead window, so the stream's trailing partial line can be checked
 * without disturbing it (a definition with no closing newline still counts —
 * marked parses it at end of input).
 */
const trackDefinition = (
  state: SectionState,
  text: string,
  lineStart: number,
  lineEnd: number,
  complete: boolean,
  lex: (markdown: string) => readonly unknown[],
): void => {
  if (state.noSplit) return;
  const raw = text.slice(lineStart, lineEnd);
  const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
  const blank = line.trim() === "";
  const definitionShaped = DEFINITION_LINE.test(line);
  const watch = definitionShaped || state.definitionLookahead > 0;
  if (complete) {
    // A definition never spans a blank line, so a blank ends the window; a
    // definition-shaped line (re)arms it and any other watched line spends one
    // step of it.
    state.definitionLookahead = blank
      ? 0
      : definitionShaped
        ? DEFINITION_LOOKAHEAD
        : Math.max(0, state.definitionLookahead - 1);
  }
  if (watch && hasDefinition(lex, text.slice(0, lineEnd))) {
    state.noSplit = true;
    state.offsets = [];
    state.openBlock = null;
    state.definitionLookahead = 0;
  }
};

/** The slice of a marked block token this file walks; everything else is opaque. */
interface BlockToken {
  type?: string;
  text?: string;
  tokens?: readonly unknown[];
  items?: readonly { tokens?: readonly unknown[] }[];
}

/**
 * Total length of the content of every code token (fenced or indented), at any
 * depth. Used only to compare the document before and after appending one line:
 * a code token that grows did not exist for that content before, so the line
 * became code body rather than a new block.
 */
const codeContentLength = (tokens: readonly unknown[]): number => {
  let total = 0;
  for (const raw of tokens) {
    const token = raw as BlockToken;
    if (token.type === "code") total += token.text?.length ?? 0;
    if (token.tokens) total += codeContentLength(token.tokens);
    if (token.items) {
      for (const item of token.items) {
        if (item.tokens) total += codeContentLength(item.tokens);
      }
    }
  }
  return total;
};

/**
 * Whether `line` (ending just past `lineEnd`) is code body per the renderer's
 * own marked. A raw-opener-shaped line that is inside a code token must not
 * open a raw block; see the call site. Appending the line can only grow code
 * content by becoming the body of an already-open fence - none of the raw
 * openers (column-0 `$`/`$$`/`\[`, up to three leading spaces before `<`) is
 * itself a fence line, so a growth here is never a new fence.
 */
const lineIsCodeContent = (
  lex: (markdown: string) => readonly unknown[],
  text: string,
  lineStart: number,
  lineEnd: number,
): boolean =>
  codeContentLength(lex(text.slice(0, lineEnd))) >
  codeContentLength(lex(text.slice(0, lineStart)));

/** Fallback lexer for callers that do not hand over the renderer's own. */
const fallbackLexer = (() => {
  const marked = new Marked({ gfm: true });
  return (markdown: string): readonly unknown[] => marked.lexer(markdown);
})();

/**
 * Called once per completed line, right after the fence state has consumed it.
 * Decides whether the line that just ended starts a new section. O(1) for
 * every non-candidate line; the marked check costs O(section) and only runs
 * for a candidate heading that passed every cheap guard.
 */
const trackSectionBoundary = (
  cache: StreamCache,
  text: string,
  newlineIndex: number,
  componentNames: string[],
  minSectionChars: number,
  record: boolean,
  lex: (markdown: string) => readonly unknown[],
): void => {
  const state = cache.sections;
  const lineStart = state.lineStart;
  // Strip one trailing CR so the heading test works for CRLF documents;
  // `lineStart` offsets are unaffected since '\r' is never a line's first char.
  const raw = text.slice(lineStart, newlineIndex);
  const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
  const blank = line.trim() === "";
  state.lineStart = newlineIndex + 1;
  // A blank line ends an HTML block the memo may have been anchoring, so it
  // drops the memo. Only refusals are ever memoised, so a dropped memo costs
  // one extra lex while a stale memo could cost a split.
  if (blank) state.openBlock = null;

  // The document-global must-refuse rule, decided before every block state
  // below so a raw block that consumes the line cannot hide it.
  trackDefinition(state, text, lineStart, newlineIndex + 1, true, lex);
  if (state.noSplit) return;
  // Inside a raw block that may span blank lines and contain heading-looking
  // lines. See the design note above: this is a safety rule, not a parse.
  if (state.rawBlock) {
    if (state.rawBlock.exact && (state.rawBlock.bodyChars ?? 0) < 2) {
      // `$$` math needs a non-empty body before its closing run can count, so
      // the line right after the opener (or after only blank lines) is body.
      state.rawBlock.bodyChars =
        (state.rawBlock.bodyChars ?? 0) + line.length + 1;
      return;
    }
    if (closesRawBlock(line, state.rawBlock)) state.rawBlock = null;
    return;
  }
  const rawBlock = detectRawBlockOpen(line);
  if (rawBlock) {
    // A line only looks like a raw opener because it is body text of a code
    // block that the char-level fence scanner cannot see (a fence indented
    // inside a list item, say). Opening a raw block there would be sticky:
    // its closer is ordinary code text that usually never appears again, so
    // every later heading would be suppressed. Ask the renderer's marked
    // whether the line is code, never the scanner - a mis-detected fence
    // would hide a real `$$` block that a prefix lex cannot see.
    if (lineIsCodeContent(lex, text, lineStart, newlineIndex + 1)) return;
    state.rawBlock = rawBlock;
    return;
  }
  // Only a column-0 ATX heading can ever start a section.
  if (!HEADING_LINE.test(line)) return;
  // With `incremental` off the state above still advances (so switching it on
  // mid-stream sees correct definitions and raw blocks) but no boundary is
  // recorded.
  if (!record) return;

  const sectionStart = state.offsets.length
    ? state.offsets[state.offsets.length - 1]
    : 0;
  // A boundary at the very start of the document (or of the current section)
  // would only produce an empty section.
  if (lineStart <= sectionStart || lineStart - sectionStart < minSectionChars) {
    return;
  }
  const sectionText = text.slice(sectionStart, lineStart);
  // A custom component opened in this section and closed in a later one would
  // be reported as unclosed (and auto-closed by DOMPurify) if the section were
  // parsed on its own.
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
  // The authoritative check. A refusal is memoised (see the design note); the
  // memo is anchored where the verdict was computed, expires after
  // `OPEN_BLOCK_MEMO_CHARS`, and is dropped when the fence scanner's verdict
  // changes, so a fence that just closed is never left memoised as open.
  const fenceOpen = cache.fence.inFenced;
  const memo = state.openBlock;
  if (
    memo !== null &&
    memo.sectionStart === sectionStart &&
    memo.fenceOpen === fenceOpen &&
    lineStart - memo.end < OPEN_BLOCK_MEMO_CHARS
  ) {
    return;
  }
  if (!startsNewTopLevelBlock(lex, sectionText)) {
    state.openBlock = { sectionStart, end: lineStart, fenceOpen };
    return;
  }
  state.openBlock = null;
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
      // `[tex` shows `tex`; once `]` has arrived, everything after it is the
      // in-progress destination / reference (`[docs] (https://x`), which the
      // recognizer keeps pending until it becomes a link or the line ends.
      // Only the label is shown meanwhile — text that had been committed as
      // Text can never come back here, so nothing the reader saw disappears.
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
  /**
   * Lexer used to decide section boundaries. Callers should pass the same
   * marked instance the renderer uses (so `config.extensions`, e.g. the Latex
   * plugin's `$$` rule, are honoured); it defaults to a plain GFM lexer.
   */
  lex: (markdown: string) => readonly unknown[] = fallbackLexer,
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
      // Section state advances even with `incremental` off — it is cheap
      // (O(line) per line) and keeps definitions, raw blocks and line starts
      // correct when incremental is switched on mid-stream; only recording
      // boundaries is gated.
      if (char === "\n") {
        trackSectionBoundary(
          cache,
          text,
          offset,
          componentNames,
          minSectionChars,
          trackSections,
          lex,
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

    // A stream may stop on a line that never got its '\n'. A definition there
    // still has to drop the boundaries recorded before it (marked parses it at
    // end of input), so run the same check for the trailing partial line —
    // without the completion side effects, since there is no later line to
    // carry a lookahead.
    if (cache.sections.lineStart < text.length) {
      trackDefinition(
        cache.sections,
        text,
        cache.sections.lineStart,
        text.length,
        false,
        lex,
      );
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
      // Scalar getters only: watching the resolvedStreaming object itself
      // would re-run the O(N) pipeline on every parent re-render that passes
      // an inline `:streaming="{ ... }"` literal, because the literal is a
      // fresh object each time. The getters below cover every field the
      // callback reads; the two record identities (component map, components)
      // are documented as "keep a stable reference".
      () => resolvedStreaming.value?.hasNextChunk,
      () => !!resolvedStreaming.value?.incremental,
      () => resolveMinSectionChars(resolvedStreaming.value?.incremental),
      () => resolveKeepSectionsOnEnd(resolvedStreaming.value?.incremental),
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
        // `keepSectionsOnEnd: false` asks for a from-scratch render once the
        // stream ends; only then is a continuing stream's cache dropped.
        const dropsCache =
          trackSections && !resolveKeepSectionsOnEnd(opts?.incremental);
        const continuesStream =
          !dropsCache &&
          cache.processedLength > 0 &&
          newContent.startsWith(cache.completeMarkdown + cache.pending);
        if (continuesStream) {
          // The stream just ended or paused (or the caller re-rendered after
          // it did). Keep the cache — sections stay mounted and a later
          // resume feeds only the new text instead of re-scanning everything;
          // the output is the raw input: nothing is pending any more.
          processStreaming(newContent, opts);
          processedContent.value = newContent;
          sections.value = trackSections
            ? buildSections(cache, newContent, newContent.length)
            : null;
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
