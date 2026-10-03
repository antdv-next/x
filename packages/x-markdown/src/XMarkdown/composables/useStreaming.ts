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
  fenceCi: null,
  lastVerdict: null,
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
  blockedOpener: null,
  listStack: [],
  paragraphOpen: false,
  paragraphEligible: true,
  bqLazy: false,
  bqFence: null,
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
    fence.lastVerdict = null;
    if (fence.lineFenceLen >= 3) {
      if (!fence.inFenced) {
        fence.inFenced = true;
        fence.fenceChar = fence.lineFenceChar;
        fence.fenceLen = fence.lineFenceLen;
        fence.lastVerdict = "opened";
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
        fence.lastVerdict = "closed";
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
// Line classification for the list-container model: every construct that
// starts a new block (and therefore closes the containers it dedents out of,
// since none of them can be a lazy paragraph continuation). End anchors use
// `[ \t]*\r?$` / `[\s\S]*` so CRLF line endings still match (`.` excludes \r).
const ATX_LINE = /^ {0,3}#{1,6}(?:[ \t]|$)/;
// marked's setext rule allows trailing spaces only (no tabs).
const SETEXT_LINE = /^ {0,3}(?:=+|-+) *\r?$/;
const THEMATIC_BREAK_LINE =
  /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})\r?$/;
const BLOCKQUOTE_LINE = /^ {0,3}>/;
// marked's blockquote lazy-continuation exclusions: a bullet or a `1.`/`1)`
// marker followed by a literal space ends the quote (any other marker shape
// joins it).
const BQ_LAZY_LIST = /^ {0,3}(?:[*+-]|1[.)]) /;
// A list marker with its indent and kind captured, followed by a whitespace
// delimiter or the end of the line. The text after the marker (delimiter +
// content) is sliced off by the caller.
const LIST_MARKER = /^( {0,3})(?:([-+*])|(\d{1,9})([.)]))(?=[ \t]|$)/;
// Begin-tests for a dedenting line met with a list item open (marked's item
// continuation): such a line ends the item *before* it starts. Each is read
// from the line's own indent — a dedent is always within the item's 0–3
// window. The fence test checks the run only: marked's fencesBegin ignores
// the info string, so a `` ``` a`b `` line still ends the item (and is then
// re-read as paragraph text at the outer level).
const FENCE_BEGIN = /^(?:`{3,}|~{3,})/;
// marked's hrBegin: space-separated markers only (no tabs), end-anchored.
const HR_BEGIN = /^(?:(?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})$/;
// marked's htmlBegin: an opening tag letter with a `>` somewhere on the line,
// or a comment opener. Closing tags do not end an item through this rule.
const HTML_BEGIN = /^<(?:[a-zA-Z][\s\S]*>|!--)/;
// A fence line the way feedFenceState sees it: up to three leading spaces,
// then a `` ` ``/`~` run of three or more. Re-derived per completed line
// because the char-level scanner resets its per-line fields at the newline.
const FENCE_LINE = /^( {0,3})(`{3,}|~{3,})([\s\S]*)$/;
// HTML blocks of CommonMark type 1 (end only at their closing tag) and type 2
// (comments), plus the Latex plugin's block delimiters. All of them may
// contain blank lines followed by a `#` line that is *not* a heading.
const RAW_HTML_BLOCK_OPEN = /^ {0,3}<(pre|script|style|textarea)(?=[\s>]|$)/i;
const HTML_COMMENT_OPEN = /^ {0,3}<!--/;
// Type 3 (processing instruction, ends at `?>`), type 4 (declaration such as
// `<!DOCTYPE html`, ends at the first `>`) and type 5 (CDATA, ends at `]]>`).
// Unlike types 6–7 these do NOT end at a blank line, so they need the raw
// block treatment just like type 1 and comments. Unlike types 1–2 they cannot
// interrupt a paragraph.
const HTML_PI_OPEN = /^ {0,3}<\?/;
const HTML_DECLARATION_OPEN = /^ {0,3}<![a-zA-Z]/;
const HTML_CDATA_OPEN = /^ {0,3}<!\[CDATA\[/;
// The katex plugin's block math opener: the dollar run alone on its line (the
// plugin's rule needs a newline immediately after the run, so not even
// trailing whitespace is allowed).
const MATH_DOLLAR_LINE = /^(\${1,2})$/;
const MATH_BRACKET_OPEN = /^\\\[/;
// HTML blocks of CommonMark types 6–7: a tag at the start of a line. Type 6
// (the block-level tag list below, including marked's `meta`/`search`/`link`
// additions and excluding the type-1 raw tags) interrupts a paragraph and
// does not require its `>` on the line (the line break itself delimits the
// tag); type 7 (any other tag) requires the `>` and a paragraph-free start.
// A line that is only a closing `</pre|script|style|textarea>` matches none
// of marked's HTML rules and is plain paragraph text.
const HTML_TAG_OPEN = /^ {0,3}<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/;
const HTML_BLOCK_TAG6 =
  /^(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)$/i;
const RAW4_CLOSE_LINE = /^ {0,3}<\/(?:pre|script|style|textarea)(?=[\s>]|$)/i;
// A gfm table delimiter row (`- `, `---`, `| - | :-: |`, …) — the shape
// marked's table rule needs right after a header line. marked's paragraph
// rule stops before any line that heads such a pair, which retroactively
// lets a held-back "cannot interrupt a paragraph" opener start its block.
const DELIMITER_ROW = /^ {0,3}(?:\| *)?:?-+:? *(?:\| *:?-+:? *)*\|?[ \t]*$/;

const detectRawBlockOpen = (
  line: string,
  math = true,
): SectionState["rawBlock"] => {
  const html = line.match(RAW_HTML_BLOCK_OPEN);
  if (html) {
    // The end condition is the closing tag with its `>`: `</prefix>` or
    // `</pre ` must not end a <pre> block (CommonMark type 1 requires the
    // literal `</pre>`, case-insensitive).
    const close = `</${html[1].toLowerCase()}>`;
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
  if (!math) return null;
  const dollar = line.match(MATH_DOLLAR_LINE);
  if (dollar) return { close: dollar[1], exact: true, bodyChars: 0 };
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
    ? // Block math (`$$`): the plugin closes on the opening run alone at
      // column 0 (`\n\1` in its rule), optionally followed by whitespace — an
      // indented or longer run keeps the block open.
      line.startsWith(rawBlock.close) &&
      !line.startsWith(`${rawBlock.close}$`) &&
      /^[ \t]*$/.test(line.slice(rawBlock.close.length))
    : line.toLowerCase().includes(rawBlock.close);

/** Leading spaces of a line (tabs are not counted, mirroring feedFenceState). */
const countIndent = (line: string): number =>
  line.match(/^ */)?.[0].length ?? 0;

/** marked expands tabs to four spaces before measuring a line's content. */
const expandTabs = (line: string): string => line.replace(/\t/g, "    ");

/**
 * marked's lazy-continuation veto for the previous content slice of a list
 * item: with the slice tab-expanded and cut at the item's content indent, the
 * next dedenting line ends the item when the slice is indented code (first
 * non-space character at column 4+ — a tab counts as a non-space character
 * before expansion) or begins a fence, heading or thematic break within the
 * item's 0–3 begin window.
 */
const sliceVeto = (slice: string, ci: number): boolean => {
  if (slice.search(/[^ ]/) >= 4) return true;
  const spaces = countIndent(slice);
  if (spaces > Math.min(3, ci - 1)) return false;
  const body = slice.slice(spaces);
  return body.startsWith("#") || FENCE_BEGIN.test(body) || HR_BEGIN.test(body);
};

/**
 * marked's setext-heading content pattern, tested at a line's own container
 * level: a heading's content run cannot start with — and cannot continue
 * across — a bullet marker followed by a space, an indented-code line (four
 * spaces or a leading tab), a fence, a blockquote, a heading or a line that
 * is a single HTML tag. A paragraph run containing such a line never becomes
 * a setext heading: the underline-shaped line after it is plain text.
 */
const SETEXT_INELIGIBLE = new RegExp(
  "^(?:" +
    "(?:[*+-]|\\d{1,9}[.)]) |" + // bullet or ordered marker + literal space
    " {4}| {0,3}\\t|" + // indented code
    " {0,3}(?:`{3,}|~{3,})|" + // fence
    " {0,3}>|" + // blockquote
    " {0,3}#{1,6}|" + // heading
    " {0,3}<[^\n>]+>$" + // tag-only HTML line
    ")",
);
const setextEligible = (line: string): boolean => !SETEXT_INELIGIBLE.test(line);

interface FenceLine {
  indent: number;
  char: string;
  len: number;
  tailBlank: boolean;
  /**
   * A backtick fence whose info string contains a backtick is not a fence at
   * all (CommonMark), so the line is paragraph text. Tilde fences have no
   * such restriction.
   */
  infoBacktick: boolean;
}

/** Re-derive the fence verdict of a completed line from its text. */
const scanFenceLine = (line: string): FenceLine | null => {
  const match = line.match(FENCE_LINE);
  if (!match) return null;
  const [, indent, run, tail] = match;
  return {
    indent: indent.length,
    char: run[0],
    len: run.length,
    tailBlank: /^\s*$/.test(tail),
    infoBacktick: run[0] === "`" && tail.includes("`"),
  };
};

/**
 * Called once per completed line (right after its '\n' has been fed to the
 * fence state). Two jobs:
 *
 * 1. Keep the scanner's block context in sync with the block parser. The
 *    char-level fence scanner reads lines in isolation, but the parser binds
 *    every line of a list item to the item's content indent, so constructs
 *    living inside list items (fences indented 1–3 spaces, raw/HTML blocks)
 *    can end earlier than the scanner thinks — and a dedenting "closing"
 *    fence line then *opens* a new fence that swallows later headings. The
 *    list-container stack (`listStack`/`paragraphOpen`) re-implements
 *    marked's item-continuation algorithm (begin-tests, blank/veto lazy
 *    rules, sibling markers) so contained blocks end exactly when the parser
 *    ends them, phantom fence verdicts inside raw / HTML blocks are undone,
 *    and a fence opened at indent 0–3 records the content indent of its
 *    containing item (`fenceCi`).
 * 2. Decide whether the line that just ended starts a new section.
 *
 * O(line) per line, so O(N) over the whole stream.
 */
const trackSectionBoundary = (
  cache: StreamCache,
  text: string,
  newlineIndex: number,
  componentNames: string[],
  minSectionChars: number,
  record: boolean,
): void => {
  const state = cache.sections;
  const fence = cache.fence;
  const lineStart = state.lineStart;
  // Strip one trailing CR so the strict-`$` line classifiers (ATX, setext,
  // thematic break, list marker, fence) work for CRLF documents; `lineStart`
  // offsets are unaffected since the '\r' is never the first char of a line.
  const raw = text.slice(lineStart, newlineIndex);
  const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
  const blank = line.trim() === "";
  state.lineStart = newlineIndex + 1;
  // A held-back opener lives exactly one line: only the delimiter row that
  // turns its line into a table header (handled in the classification below)
  // may activate it; every other line — including a blank one — discards it.
  const blocked = state.blockedOpener;
  state.blockedOpener = null;

  const stack = state.listStack;
  const topCi = (): number => stack[stack.length - 1].ci;
  // Close every container whose content indent exceeds `indent`. Used only
  // for lines that cannot be lazy paragraph continuations: block starts and
  // container exits.
  const popBelow = (indent: number): void => {
    while (stack.length && indent < stack[stack.length - 1].ci) stack.pop();
  };
  const indent = countIndent(line);
  const fenceLine = scanFenceLine(line);
  const verdict = fence.lastVerdict;
  fence.lastVerdict = null;
  const clearFence = (): void => {
    fence.inFenced = false;
    fence.fenceChar = "";
    fence.fenceLen = 0;
    fence.fenceCi = null;
  };

  // --- 1. Item continuation, mirroring marked's list-item loop. The open
  // containers are walked from the outermost inward, the way marked's nested
  // list lexers each run their own continuation on the line as that level
  // sees it: a line content to a level is re-sliced at its content indent for
  // the next one, while a line dedenting below a level ends the item there
  // *before* the line when it begins a construct (fence run, `#`, html with a
  // `>`, list marker, thematic break) or when the item is blank-tailed / its
  // previous content slice vetoes a lazy continuation. The ending item takes
  // every container and leaf block inside it down, and the line is re-read at
  // the outer level. Any other dedenting line joins the item as raw text — a
  // lazy paragraph line, or the body of the item's open fence / raw / HTML
  // block — and reaches the next level unchanged. ---
  let exiting = false;
  if (stack.length) {
    if (blank) {
      // A blank line is consumed as item content at every nesting level and
      // leaves every open item blank-tailed: the next line that dedents below
      // an item ends it. It also ends a type 6–7 HTML block (fences and type
      // 1–5 raw blocks span blanks). Exception: an item whose first line was
      // blank dies right here — marked consumes the blank and closes the item
      // before its content loop ever runs (`R && blankLine.test(h)`), so the
      // container is dropped instead of blank-tailed. Such an item is always
      // innermost (any content line would have cleared the flag).
      const top = stack[stack.length - 1];
      if (top.empty) stack.pop();
      for (const entry of stack) {
        entry.blank = true;
        entry.lineVeto = false;
      }
      state.inHtmlBlock = false;
      state.bqFence = null;
      return;
    }
    let lazy = false;
    // The current level's view of the line: `offset` is where the view starts
    // (content lines are re-sliced level by level, lazy lines stay raw) and
    // `levelIndent` its leading indent. `offset + levelIndent == indent`.
    let offset = 0;
    let levelIndent = indent;
    for (let k = 0; k < stack.length; k++) {
      const entry = stack[k];
      const relCi = entry.ci - (k > 0 ? stack[k - 1].ci : 0);
      if (levelIndent >= relCi) {
        // Item content at this level: refresh the lazy-veto flag from the
        // slice this level records (`g = A.slice(f)` in marked), then descend.
        entry.lineVeto = sliceVeto(
          expandTabs(line).slice(offset + relCi),
          relCi,
        );
        entry.empty = false;
        levelIndent -= relCi;
        offset += relCi;
        continue;
      }
      const levelLine = line.slice(offset);
      const beginLine = line.slice(indent);
      const isMarker = LIST_MARKER.test(levelLine);
      const isHr = HR_BEGIN.test(beginLine);
      if (
        !isMarker &&
        beginLine[0] !== "#" &&
        !FENCE_BEGIN.test(beginLine) &&
        !HTML_BEGIN.test(beginLine) &&
        !isHr &&
        !entry.blank &&
        !entry.lineVeto
      ) {
        // Lazy continuation at this level: refresh the veto flag from the raw
        // view's slice and keep the line raw for the next level.
        entry.lineVeto = sliceVeto(
          expandTabs(line).slice(offset + relCi),
          relCi,
        );
        entry.empty = false;
        lazy = true;
        continue;
      }
      if (fence.fenceCi != null) clearFence();
      state.rawBlock = null;
      state.inHtmlBlock = false;
      state.bqFence = null;
      // The item's inner paragraph died with it; the re-read line starts
      // fresh (a `2. x` marker may open a list here even though the item's
      // paragraph just ended).
      state.paragraphOpen = false;
      // A list marker keeps the container stack: a same-kind marker at the
      // list's column is a sibling item of the still-open list, resolved in
      // the classification below, which also drops the dead containers that
      // were nested inside the ended one. A marker-shaped line that is itself
      // a thematic break (`- - -`) ends the list for good: marked's block
      // lexer reads it as an hr, never as an item.
      if (!isMarker || isHr) popBelow(indent);
      exiting = true;
      break;
    }
    if (!exiting && lazy) {
      // Lazy lines are raw item text, never block starts.
      if (!fence.inFenced && !state.rawBlock && !state.inHtmlBlock) {
        state.paragraphOpen = true;
        state.paragraphEligible = setextEligible(line);
      }
      return;
    }
  }

  if (!exiting) {
    if (state.rawBlock) {
      // Raw block content: a fence-shaped line here is never a fence, so any
      // open the char scanner just applied is a phantom. (Blocks only start
      // while the fence is closed, so it cannot predate this line.)
      if (verdict === "opened") clearFence();
      // A type 6–7 HTML block underneath the raw block still ends at a blank
      // line; the raw block itself spans blanks.
      if (blank) state.inHtmlBlock = false;
      // `$$` math closes only once at least one body character has streamed:
      // the plugin's rule is `opener\n body \n closer` with a non-empty body,
      // so a closing run whose would-be body is still empty (the line right
      // after the opener, or after nothing but blank lines) is body text —
      // even when it is itself a `$$` run.
      if (state.rawBlock.exact && (state.rawBlock.bodyChars ?? 0) < 2) {
        state.rawBlock.bodyChars =
          (state.rawBlock.bodyChars ?? 0) + line.length + 1;
        return;
      }
      if (closesRawBlock(line, state.rawBlock)) state.rawBlock = null;
      return;
    }
    if (state.inHtmlBlock) {
      if (verdict === "opened") clearFence();
      if (blank) {
        state.inHtmlBlock = false;
        return;
      }
      // A raw block opener (comment, PI, declaration, CDATA, pre/script/...)
      // starting inside a type 6–7 HTML block still suppresses splitting until
      // it closes, taking priority over the block's end-at-blank-line rule:
      // the browser reads `<?` / `<!` as a bogus comment that runs to the
      // next `>` across what CommonMark would call later blocks, so a heading
      // split there would survive in the split render while being swallowed
      // by the comment in the whole-document render. The HTML block stays open
      // underneath: once the raw block closes, its own end-at-blank-line rule
      // keeps applying. Math delimiters are excluded: inside the HTML block
      // they are plain text to both the parser and the browser, so there is
      // nothing to protect. The opener is read relative to the innermost open
      // item, like the classification below.
      const inner =
        stack.length && indent >= topCi() ? line.slice(topCi()) : line;
      const rawBlock = detectRawBlockOpen(inner, false);
      if (rawBlock) {
        state.rawBlock = rawBlock;
      }
      return;
    }
    if (verdict === "closed") {
      // A genuine closing line (a dedenting "closer" took the exit path
      // above). The containing item outlives its fence: the stack stays.
      fence.fenceCi = null;
      return;
    }
    if (verdict === "opened") {
      if (fenceLine && !fenceLine.infoBacktick) {
        // A fence line outside every block. Fences interrupt paragraphs and
        // are never lazy continuations, so a dedenting fence line closes the
        // containers it dedents out of before opening at the outer level.
        popBelow(fenceLine.indent);
        fence.fenceCi = stack.length ? topCi() : null;
        state.paragraphOpen = false;
        state.bqLazy = false;
        return;
      }
      // A backtick fence whose info string contains a backtick is not a
      // fence: undo the phantom open and let the line be read as text below.
      clearFence();
    } else if (fence.inFenced) {
      // A closing fence line 0–3 spaces past the containing item's content
      // indent but 4+ absolutely is invisible to the char scanner: close the
      // contained fence here. A top-level fence has no such window — four
      // leading spaces there are just fence content.
      if (fence.fenceCi != null) {
        const closer = scanFenceLine(line.slice(fence.fenceCi));
        if (
          closer &&
          closer.tailBlank &&
          closer.char === fence.fenceChar &&
          closer.len >= fence.fenceLen
        ) {
          clearFence();
        }
      }
      return; // fence body line
    }
  } else if (fenceLine && !fenceLine.infoBacktick) {
    // The line that ended the item is itself a fence line — typically a
    // dedenting "closing" line: the parser reads it as a new opener. Fences
    // interrupt paragraphs, so no paragraph survives the open.
    popBelow(fenceLine.indent);
    fence.inFenced = true;
    fence.fenceChar = fenceLine.char;
    fence.fenceLen = fenceLine.len;
    fence.fenceCi = stack.length ? topCi() : null;
    state.paragraphOpen = false;
    return;
  } else if (verdict === "opened") {
    // The scanner opened on a backtick fence with a backtick in its info
    // string — not a fence (CommonMark): undo the phantom open and let the
    // line be classified below.
    clearFence();
  }

  // --- 3. Line classification: keep the container stack and the paragraph
  // state current. Runs for every remaining line, even with `record` off, so
  // switching `incremental` on mid-stream sees the correct context. ---
  if (blank) {
    state.paragraphOpen = false;
    state.bqFence = null;
    state.bqLazy = false;
    return;
  }
  // A line reaching the innermost open item's content indent belongs to that
  // item: read its block start relative to the content indent, since the
  // classification patterns only allow up to three *absolute* leading spaces
  // while CommonMark allows three *container-relative* ones. Every `popBelow`
  // below uses the absolute indent and is a no-op for such a line (dedenting
  // lines were already joined or exited in the continuation above).
  const rel = stack.length && indent >= topCi() ? line.slice(topCi()) : null;
  const blockLine = rel ?? line;
  // A non-blockquote line ends a blockquote whose inner fence is still open:
  // unlike a paragraph, a fence cannot be lazily continued, so the blockquote
  // died at its last `>` line and left no paragraph behind.
  if (state.bqFence && !BLOCKQUOTE_LINE.test(blockLine)) {
    state.bqFence = null;
    state.paragraphOpen = false;
  }
  // A top-level blockquote whose last `>` line had non-empty content lazily
  // absorbs this line — marked's blockquote rule bakes the paragraph
  // continuation into its regex — unless the line matches one of its
  // continuation exclusions: a thematic break, an ATX heading, a fence, a
  // quote line, a bullet/`1.` marker followed by a space, or a block-tag
  // HTML line (comments included; PIs, declarations, CDATA and type-7 tags
  // join the quote). An absorbed line starts no block of its own; an
  // excluding line ends the quote and is classified fresh, with no
  // top-level paragraph left behind.
  if (state.bqLazy) {
    const bqTag = blockLine.match(HTML_TAG_OPEN);
    if (
      !THEMATIC_BREAK_LINE.test(blockLine) &&
      !ATX_LINE.test(blockLine) &&
      !(
        countIndent(blockLine) <= 3 &&
        FENCE_BEGIN.test(blockLine.slice(countIndent(blockLine)))
      ) &&
      !BLOCKQUOTE_LINE.test(blockLine) &&
      !BQ_LAZY_LIST.test(blockLine) &&
      !HTML_COMMENT_OPEN.test(blockLine) &&
      !RAW_HTML_BLOCK_OPEN.test(blockLine) &&
      !(bqTag && HTML_BLOCK_TAG6.test(bqTag[2]))
    ) {
      return; // the line joins the blockquote, which stays lazy-open
    }
    // An excluding line ends the quote and is classified fresh, with no
    // top-level paragraph left behind.
    state.bqLazy = false;
    state.paragraphOpen = false;
  }
  // A list marker line, decomposed once for the setext guard (a marker with
  // nothing but its one delimiter character is not a list), the sibling
  // lookup and the marker branch below.
  const marker = blockLine.match(LIST_MARKER);
  let markerInfo: {
    mIndent: number;
    kind: string;
    ordered: boolean;
    digits: string | undefined;
    rest: string;
    contentBlank: boolean;
    content: string;
    ci: number;
  } | null = null;
  if (marker) {
    const mIndent = (rel ? topCi() : 0) + marker[1].length;
    const bullet = marker[2];
    const digits = marker[3];
    const ordered = bullet === undefined;
    const markerChars = bullet ? 1 : (digits ?? "").length + 1;
    const rest = blockLine.slice(marker[1].length + markerChars);
    const contentBlank = rest.trim() === "";
    // CommonMark: content starts after the marker plus a 1–4 space gap; a
    // tab is a non-space character here (`-\tx` starts content immediately,
    // `- \tx` after one space). A wider gap or a blank first line falls back
    // to one space after the marker.
    const gap = contentBlank ? 1 : rest.search(/[^ ]/);
    const ci = mIndent + markerChars + (gap > 4 ? 1 : gap);
    markerInfo = {
      mIndent,
      kind: bullet ?? marker[4],
      ordered,
      digits,
      rest,
      contentBlank,
      content: rest.slice(gap),
      ci,
    };
  }
  // A marker followed by nothing but its one delimiter character (`- `,
  // `1.\t`) can never *start* a list — marked's list-start rule needs content
  // after the delimiter — but it can *continue* one: the item loop breaks the
  // current item on any marker-shaped line, and the sibling rule (0–3 spaces
  // at the level's view, same marker kind, content optional) then reads the
  // line as a new, empty item, so the list survives with a blank-tailed item
  // that the next dedenting line ends. With no same-kind list to continue,
  // the line is plain paragraph text: a bullet/`1.` marker followed by a
  // space breaks the paragraph first (marked's paragraph lookahead excludes
  // it), while a tab-delimited or non-1 ordered marker lazily joins it.
  const wsOnlyMarker = (info: {
    mIndent: number;
    kind: string;
    ordered: boolean;
    digits: string | undefined;
    rest: string;
    ci: number;
  }): void => {
    let level = 0;
    while (level < stack.length && indent >= stack[level].ci) level++;
    const container = level < stack.length ? stack[level] : null;
    if (
      container &&
      container.kind === info.kind &&
      indent - (level > 0 ? stack[level - 1].ci : 0) <= 3
    ) {
      stack.length = level + 1;
      stack[level] = {
        ci: info.ci,
        mIndent: info.mIndent,
        kind: info.kind,
        blank: true,
        empty: true,
        lineVeto: false,
      };
      state.paragraphOpen = false;
      return;
    }
    popBelow(indent);
    // The line is the run's last line, so it alone decides a later setext
    // underline: a column-0 marker followed by a space forfeits it, a
    // tab-delimited or indented one keeps it.
    state.paragraphEligible = setextEligible(blockLine);
    state.paragraphOpen = true;
  };
  // A marker with content after its one delimiter character (or with nothing
  // at all — a bare `-` starts a list of one empty item in marked): a fresh
  // list opens, unless an open paragraph vetoes the interruption — only a
  // bullet or a `1.`/`1)` followed by a *space* may interrupt one, so a tab
  // delimiter or a non-1 ordered start makes the line lazy paragraph text.
  const openList = (info: NonNullable<typeof markerInfo>): void => {
    if (state.paragraphOpen) {
      if (info.rest[0] !== " " || (info.ordered && Number(info.digits) !== 1)) {
        // The line joins the paragraph; as its last line it alone decides a
        // later setext underline.
        state.paragraphEligible = setextEligible(blockLine);
        return;
      }
    }
    popBelow(info.mIndent);
    stack.push({
      ci: info.ci,
      mIndent: info.mIndent,
      kind: info.kind,
      blank: info.contentBlank,
      empty: info.contentBlank,
      lineVeto: sliceVeto(expandTabs(info.rest), info.ci),
    });
    state.paragraphOpen = !info.contentBlank;
    if (state.paragraphOpen) {
      state.paragraphEligible = setextEligible(info.content);
    }
  };
  // A held-back opener activates on a delimiter row: marked's paragraph rule
  // stops before the opener's line whenever this pair heads a gfm table, so
  // the paragraph was never there to block it. (A delimiter row is never a
  // heading or fence; this must run before the setext/hr branch, since `---`
  // is a delimiter row too.)
  if (blocked && DELIMITER_ROW.test(blockLine)) {
    popBelow(indent);
    if (blocked.inHtmlBlock) state.inHtmlBlock = true;
    if (blocked.rawBlock) state.rawBlock = blocked.rawBlock;
    state.paragraphOpen = false;
    return;
  }
  const rawBlock = detectRawBlockOpen(blockLine);
  if (rawBlock) {
    // PIs, declarations, CDATA (types 3–5) and the katex plugin's block math
    // cannot interrupt a paragraph: the line is lazy paragraph text then, not
    // a block start — unless the next line turns out to be a table delimiter
    // row, which is what `blockedOpener` records for.
    const interruptible =
      !HTML_PI_OPEN.test(blockLine) &&
      !HTML_DECLARATION_OPEN.test(blockLine) &&
      !HTML_CDATA_OPEN.test(blockLine) &&
      !MATH_DOLLAR_LINE.test(blockLine) &&
      !MATH_BRACKET_OPEN.test(blockLine);
    if (interruptible || !state.paragraphOpen) {
      popBelow(indent);
      state.rawBlock = rawBlock;
      state.paragraphOpen = false;
      return;
    }
    state.blockedOpener = { rawBlock };
  }
  if (
    !rawBlock &&
    (RAW_HTML_BLOCK_OPEN.test(blockLine) || HTML_COMMENT_OPEN.test(blockLine))
  ) {
    // A type 1–2 opener closed on its own line (`<pre>x</pre>`, `<!-- x -->`)
    // is still a block start: nothing stays open, but the paragraph ends.
    popBelow(indent);
    state.paragraphOpen = false;
    return;
  }
  if (
    !rawBlock &&
    !state.paragraphOpen &&
    (HTML_PI_OPEN.test(blockLine) ||
      HTML_DECLARATION_OPEN.test(blockLine) ||
      HTML_CDATA_OPEN.test(blockLine))
  ) {
    // Same for a type 3–5 opener closed on its own line — a block start only
    // with no paragraph open.
    popBelow(indent);
    state.paragraphOpen = false;
    return;
  }
  if (!RAW4_CLOSE_LINE.test(blockLine)) {
    const htmlTag = blockLine.match(HTML_TAG_OPEN);
    if (
      htmlTag &&
      (HTML_BLOCK_TAG6.test(htmlTag[2]) ||
        (!state.paragraphOpen && blockLine.includes(">")))
    ) {
      popBelow(indent);
      state.inHtmlBlock = true;
      state.paragraphOpen = false;
      return;
    }
    // A type-7 tag held back by an open paragraph activates the same way a
    // held-back raw block opener does (see above).
    if (htmlTag && state.paragraphOpen && blockLine.includes(">")) {
      state.blockedOpener = { rawBlock: null, inHtmlBlock: true };
    }
  }
  if (DEFINITION_LINE.test(blockLine)) {
    state.noSplit = true;
    state.offsets = [];
    state.paragraphOpen = false;
    return;
  }
  if (markerInfo) {
    // A marker that continues an already-open list (same marker column and
    // kind) is a sibling item; it interrupts the item's paragraph regardless
    // of start number or a blank body, and the list stays open. Checked
    // before the block classification: a sibling line shaped like a thematic
    // break (`- - -`) is still an item.
    let sibling = -1;
    for (
      let i = stack.length - 1;
      i >= 0 && stack[i].ci > markerInfo.mIndent;
      i--
    ) {
      if (
        stack[i].mIndent === markerInfo.mIndent &&
        stack[i].kind === markerInfo.kind
      ) {
        sibling = i;
        break;
      }
    }
    if (sibling >= 0) {
      stack.length = sibling + 1;
      stack[sibling].ci = markerInfo.ci;
      stack[sibling].blank = markerInfo.contentBlank;
      stack[sibling].empty = markerInfo.contentBlank;
      stack[sibling].lineVeto = sliceVeto(
        expandTabs(markerInfo.rest),
        markerInfo.ci,
      );
      state.paragraphOpen = !markerInfo.contentBlank;
      if (state.paragraphOpen) {
        state.paragraphEligible = setextEligible(markerInfo.content);
      }
      return;
    }
  }
  if (ATX_LINE.test(blockLine)) {
    // An ATX heading interrupts a paragraph and closes the containers it
    // dedents out of; only a column-0 one is a boundary candidate.
    popBelow(indent);
    state.paragraphOpen = false;
    if (indent > 0) return;
    // fall through to the boundary logic below
  } else if (
    SETEXT_LINE.test(blockLine) ||
    THEMATIC_BREAK_LINE.test(blockLine)
  ) {
    // A setext underline turns the open paragraph into a heading — but only
    // at the paragraph's own container level, and only when the paragraph's
    // last line is legal setext content (marked matches the paragraph and
    // its underline atomically, and its paragraph rule stops at the first
    // line the setext rule can start matching from, so the content can be
    // that last line alone). Dedenting below the paragraph ends the
    // containers first, and with no paragraph left at the outer level the
    // line is a thematic break (`- para\n---` parses as list + <hr>).
    const setext =
      !THEMATIC_BREAK_LINE.test(blockLine) &&
      state.paragraphOpen &&
      state.paragraphEligible &&
      (!stack.length || indent >= topCi());
    if (!setext) {
      // A marker followed by nothing but its one delimiter character (`- `,
      // `1.\t`): an empty sibling item when it continues an open list, plain
      // paragraph text otherwise.
      if (markerInfo && markerInfo.rest.length === 1) {
        wsOnlyMarker(markerInfo);
        return;
      }
      // With no underline firing, any other marker line (`-  `, a bare `-`)
      // is a real empty list item: marked's list-start rule only needs one
      // more character after the delimiter, or none at all.
      if (markerInfo && !THEMATIC_BREAK_LINE.test(blockLine)) {
        openList(markerInfo);
        return;
      }
      if (!THEMATIC_BREAK_LINE.test(blockLine)) {
        // Any other line that only looked like an underline — an `=` run, a
        // `--` — is plain paragraph text: it opens or continues a paragraph
        // instead of ending one.
        state.paragraphEligible = setextEligible(blockLine);
        state.paragraphOpen = true;
        return;
      }
      popBelow(indent);
    }
    state.paragraphOpen = false;
    return;
  } else if (BLOCKQUOTE_LINE.test(blockLine)) {
    // Only top-level or item-content quote lines reach here — a dedenting
    // quote line already lazy-attached to the item in the continuation
    // above. The quote's own paragraph state follows its content: `> # h`,
    // `> ---` or `> ``` ` leave no paragraph open for later lazy lines,
    // `> text` leaves one open. While a fence inside the quote is open the
    // lines are fence body, not paragraph content. Either way the quote's
    // paragraph is never setext content at this level: marked neutralizes
    // underline lines inside quotes, and a non-quote line that looks like an
    // underline starts a fresh top-level paragraph instead. A top-level
    // quote also keeps absorbing following plain lines (see `bqLazy`): no
    // top-level paragraph survives it, so interruption rules below must not
    // see one.
    if (!state.paragraphOpen) popBelow(indent);
    state.paragraphEligible = false;
    let inner = blockLine;
    while (BLOCKQUOTE_LINE.test(inner)) {
      inner = inner.replace(/^ {0,3}>[ \t]?/, "");
    }
    if (state.bqFence) {
      const closer = scanFenceLine(inner);
      if (
        closer &&
        closer.tailBlank &&
        closer.char === state.bqFence.char &&
        closer.len >= state.bqFence.len
      ) {
        state.bqFence = null;
      }
      // A fence as the quote's last inner token voids the lazy continuation
      // (marked's blockquote tokenizer breaks on a trailing code token) —
      // whether it just closed or is still open.
      state.bqLazy = false;
      state.paragraphOpen = false;
      return;
    }
    const fenceOpen = scanFenceLine(inner);
    if (fenceOpen && !fenceOpen.infoBacktick) {
      state.bqFence = { char: fenceOpen.char, len: fenceOpen.len };
      state.bqLazy = false;
      state.paragraphOpen = false;
      return;
    }
    state.paragraphOpen =
      inner.trim() !== "" &&
      !ATX_LINE.test(inner) &&
      !SETEXT_LINE.test(inner) &&
      !THEMATIC_BREAK_LINE.test(inner);
    if (!rel) {
      // Top-level quote: the line's content decides whether the quote may
      // lazily absorb the next line. Empty content may not, and neither may
      // content that tokenizes as a nested quote (marked's tokenizer breaks
      // on a trailing blockquote token) or as indented code.
      state.bqLazy =
        inner.trim() !== "" &&
        !BLOCKQUOTE_LINE.test(inner) &&
        expandTabs(inner).search(/[^ ]/) < 4;
      state.paragraphOpen = false;
    }
    return;
  } else {
    if (rel) {
      const fenceOpen = scanFenceLine(rel);
      if (fenceOpen && !fenceOpen.infoBacktick) {
        // A fence 0–3 spaces past the item's content indent but 4+ spaces
        // absolutely is invisible to the char scanner: open the contained
        // fence here so the scanner tracks it (and its closing line) from the
        // next line on, instead of mistaking its body for paragraph text.
        fence.inFenced = true;
        fence.fenceChar = fenceOpen.char;
        fence.fenceLen = fenceOpen.len;
        fence.fenceCi = topCi();
        state.paragraphOpen = false;
        return;
      }
    }
    if (markerInfo) {
      // A marker followed by nothing but its one delimiter character (`- `,
      // `1.\t`): an empty sibling item when it continues an open list, plain
      // paragraph text otherwise.
      if (markerInfo.rest.length === 1) {
        wsOnlyMarker(markerInfo);
        return;
      }
      openList(markerInfo);
      return;
    }
    // Plain text. The open paragraph simply continues (a dedenting line that
    // would have ended it was handled by the continuation above); as its
    // last line, this line alone decides a later setext underline.
    if (state.paragraphOpen) {
      state.paragraphEligible = setextEligible(blockLine);
      return;
    }
    // An indented code block (4+ spaces relative to the container) is not a
    // paragraph; every other plain line opens or continues one.
    state.paragraphOpen = indent < (stack.length ? topCi() : 0) + 4;
    if (state.paragraphOpen) {
      state.paragraphEligible = setextEligible(blockLine);
    }
    return;
  }

  // --- Boundary logic: only column-0 ATX headings reach this point. ---
  if (state.noSplit) return;
  // With `incremental` off the state above still advances (so switching it on
  // mid-stream sees correct definitions and raw blocks) but no boundary is
  // recorded: sections already built stay whole.
  if (!record) return;

  const sectionStart = state.offsets.length
    ? state.offsets[state.offsets.length - 1]
    : 0;
  // A boundary at the very start of the document (or of the current section)
  // would only produce an empty section. Larger sections can still parse to
  // zero nodes (all-whitespace or sanitize-stripped markup) — that case is
  // handled by the renderer returning a childless Fragment, keeping this
  // splitter a pure text scan with no marked/DOMPurify coupling.
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
