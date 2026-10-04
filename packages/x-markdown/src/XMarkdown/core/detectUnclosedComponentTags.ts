const WHITESPACE_REGEX = /\s/;
const TAG_NAME_CHAR_REGEX = /[a-zA-Z0-9-]/;
const VOID_ELEMENTS = new Set<string>([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);
const COMMENT_START = "<!--";
const COMMENT_END = "-->";
const CDATA_START = "<![CDATA[";
const CDATA_END = "]]>";

export const getTagInstanceId = (tagName: string, instance: number) =>
  `${tagName}-${instance}`;

const skipComment = (html: string, pos: number): number => {
  if (!html.startsWith(COMMENT_START, pos)) {
    return pos;
  }

  const endPos = html.indexOf(COMMENT_END, pos + COMMENT_START.length);
  return endPos === -1 ? html.length : endPos + COMMENT_END.length;
};

const skipCDATA = (html: string, pos: number): number => {
  if (!html.startsWith(CDATA_START, pos)) {
    return pos;
  }

  const endPos = html.indexOf(CDATA_END, pos + CDATA_START.length);
  return endPos === -1 ? html.length : endPos + CDATA_END.length;
};

const parseClosingTag = (
  html: string,
  pos: number,
): { tagName: string; endPos: number } | null => {
  if (html[pos + 1] !== "/") {
    return null;
  }

  let scanPos = pos + 2;
  let tagName = "";

  // No whitespace between '</' and the name: per the HTML spec '</' followed
  // by a non-letter is a bogus comment that closes nothing, so '</ div>' must
  // not pop a <div>.
  while (scanPos < html.length && TAG_NAME_CHAR_REGEX.test(html[scanPos])) {
    tagName += html[scanPos];
    scanPos++;
  }

  while (scanPos < html.length && WHITESPACE_REGEX.test(html[scanPos])) {
    scanPos++;
  }

  if (!tagName || html[scanPos] !== ">") {
    return null;
  }

  return { tagName: tagName.toLowerCase(), endPos: scanPos + 1 };
};

const parseOpeningTag = (
  html: string,
  pos: number,
): {
  tagName: string;
  endPos: number;
  foundEnd: boolean;
  isSelfClosing: boolean;
} | null => {
  let scanPos = pos + 1;
  let tagName = "";

  while (scanPos < html.length && TAG_NAME_CHAR_REGEX.test(html[scanPos])) {
    tagName += html[scanPos];
    scanPos++;
  }

  if (!tagName) {
    return null;
  }

  // After the name a real tag continues with whitespace, '>' or '/'. Anything
  // else (':', '@', '=', …) means this was never a tag — an autolink like
  // <https://example.com> or inline code like `a < b` must not be treated as
  // one. CommonMark's inline-HTML production applies the same restriction.
  if (
    scanPos < html.length &&
    html[scanPos] !== ">" &&
    html[scanPos] !== "/" &&
    !WHITESPACE_REGEX.test(html[scanPos])
  ) {
    return null;
  }

  let foundEnd = false;
  let isSelfClosing = false;

  while (scanPos < html.length) {
    if (html[scanPos] === ">") {
      foundEnd = true;
      isSelfClosing = html[scanPos - 1] === "/";
      break;
    }

    if (html[scanPos] === '"' || html[scanPos] === "'") {
      const quoteChar = html[scanPos];
      scanPos++;

      // HTML attribute values have no escape mechanism: a backslash is a
      // literal character, so `title="C:\"` ends at the quote right after it.
      while (scanPos < html.length) {
        if (html[scanPos] === quoteChar) {
          scanPos++;
          break;
        }

        scanPos++;
      }

      continue;
    }

    scanPos++;
  }

  return {
    tagName: tagName.toLowerCase(),
    endPos: foundEnd ? scanPos + 1 : html.length,
    foundEnd,
    isSelfClosing,
  };
};

export function detectUnclosedComponentTags(
  html: string,
  componentNames: Iterable<string>,
): Set<string> {
  const trackedTags = new Set(
    Array.from(componentNames, tagName => tagName.toLowerCase()),
  );

  if (trackedTags.size === 0 || html.length === 0) {
    return new Set();
  }

  const unclosedTags = new Set<string>();
  const tagCounts: Record<string, number> = {};
  const openTagIndexes: Record<string, number[]> = {};

  let pos = 0;
  while (pos < html.length) {
    const afterComment = skipComment(html, pos);
    if (afterComment !== pos) {
      pos = afterComment;
      continue;
    }

    const afterCDATA = skipCDATA(html, pos);
    if (afterCDATA !== pos) {
      pos = afterCDATA;
      continue;
    }

    if (html[pos] !== "<") {
      pos++;
      continue;
    }

    const closingTag = parseClosingTag(html, pos);
    if (closingTag) {
      const pendingIndexes = openTagIndexes[closingTag.tagName];
      if (trackedTags.has(closingTag.tagName) && pendingIndexes?.length) {
        pendingIndexes.pop();
      }
      pos = closingTag.endPos;
      continue;
    }

    const openingTag = parseOpeningTag(html, pos);
    if (!openingTag || !trackedTags.has(openingTag.tagName)) {
      pos++;
      continue;
    }

    tagCounts[openingTag.tagName] = (tagCounts[openingTag.tagName] ?? 0) + 1;
    const instance = tagCounts[openingTag.tagName];

    if (!openingTag.foundEnd) {
      unclosedTags.add(getTagInstanceId(openingTag.tagName, instance));
    } else if (
      !openingTag.isSelfClosing &&
      !VOID_ELEMENTS.has(openingTag.tagName)
    ) {
      openTagIndexes[openingTag.tagName] ??= [];
      openTagIndexes[openingTag.tagName].push(instance);
    }

    pos = openingTag.endPos;
  }

  for (const [tagName, pendingIndexes] of Object.entries(openTagIndexes)) {
    pendingIndexes.forEach(instance => {
      unclosedTags.add(getTagInstanceId(tagName, instance));
    });
  }

  return unclosedTags;
}

/* ------------ Raw HTML container scan (section-split safety) ------------ */

interface RawScanFenceState {
  inFence: boolean;
  fenceChar: string;
  fenceLen: number;
}

/**
 * Line-level fenced-code tracking with the same rules as feedFenceState in
 * useStreaming: a fence is a run of >= 3 backticks or tildes indented by up
 * to three spaces, and a closing run needs the same character, at least the
 * opening run's length and a whitespace-only tail. Tags inside fenced code
 * are code, not HTML — without this, a JSX snippet or `#include <vector>`
 * would look like an open container and veto every later split.
 */
const classifyRawScanLine = (line: string, fence: RawScanFenceState): void => {
  let pos = 0;
  let indent = 0;
  while (indent < 3 && line[pos] === " ") {
    indent += 1;
    pos += 1;
  }
  const marker = line[pos];
  let runLen = 0;
  if (marker === "`" || marker === "~") {
    while (line[pos + runLen] === marker) runLen += 1;
  }
  if (runLen < 3) return;
  if (!fence.inFence) {
    // A *backtick* fence's info string may not contain a backtick (CommonMark,
    // and marked agrees: ```foo``` is a paragraph with an inline code span).
    // Opening a phantom fence there swallows every tag in the rest of the
    // document. Tilde fences have no such restriction.
    if (marker === "`" && line.slice(pos + runLen).includes("`")) return;
    fence.inFence = true;
    fence.fenceChar = marker;
    fence.fenceLen = runLen;
    return;
  }
  if (
    marker === fence.fenceChar &&
    runLen >= fence.fenceLen &&
    line.slice(pos + runLen).trim() === ""
  ) {
    fence.inFence = false;
    fence.fenceChar = "";
    fence.fenceLen = 0;
  }
};

/**
 * Tag names whose line-leading `<name` (or, for the type-6 names, `</name`)
 * starts an HTML block that *interrupts a paragraph*: CommonMark's type-6 list.
 * Derived by asking marked rather than from memory — `span`, `em`, `a`, `svg`,
 * `math` and the other inline names are deliberately absent, because a line
 * starting with one of those is paragraph text that a code span may cross.
 */
const PARAGRAPH_INTERRUPTING_TAGS = new Set(
  "address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link main menu menuitem nav noframes ol optgroup option p param search section summary table tbody td tfoot th thead title tr track ul".split(
    " ",
  ),
);

/** Type-1 tags interrupt as openers only; their closing tags start nothing. */
const BLOCK_OPENER_TAGS = new Set(["pre", "script", "style", "textarea"]);

/**
 * Whether a `<` at `pos` begins an HTML block that interrupts the paragraph a
 * code span lives in — in which case the span cannot cross it and the tag must
 * be left visible to the tag scan.
 */
const startsParagraphInterruptingBlock = (
  text: string,
  pos: number,
): boolean => {
  let cursor = pos + 1;
  const closing = text[cursor] === "/";
  if (closing) cursor += 1;

  let tagName = "";
  while (cursor < text.length && TAG_NAME_CHAR_REGEX.test(text[cursor])) {
    tagName += text[cursor];
    cursor += 1;
  }

  tagName = tagName.toLowerCase();
  if (BLOCK_OPENER_TAGS.has(tagName)) return !closing;
  return PARAGRAPH_INTERRUPTING_TAGS.has(tagName);
};

/**
 * Index of the next run of exactly `len` backticks before the paragraph ends,
 * or -1 when there is none. CommonMark: a code span ends at the next run of
 * the *same* length, may contain line endings, and does not cross a blank
 * line; a run with no such closer is literal text, not a span.
 *
 * The lookahead also stops where the paragraph does: a blank line, or a line
 * that starts an HTML block (`<div>`, `</pre>`, …) — the paragraph cannot
 * continue past either, so a tag on that line is real HTML and must not be
 * swallowed by a pairing.
 */
const findClosingBacktickRun = (
  text: string,
  from: number,
  len: number,
): number => {
  let pos = from;
  while (pos < text.length) {
    const char = text[pos];
    if (char === "\n") {
      let ahead = pos + 1;
      while (text[ahead] === " " || text[ahead] === "\t") ahead += 1;
      if (text[ahead] === "\n" || ahead >= text.length) return -1;
      if (
        text[ahead] === "<" &&
        startsParagraphInterruptingBlock(text, ahead)
      ) {
        return -1;
      }
      pos += 1;
      continue;
    }
    if (char !== "`") {
      pos += 1;
      continue;
    }
    let run = 1;
    while (text[pos + run] === "`") run += 1;
    if (run === len) return pos;
    // A run of another length is span content, not a closer.
    pos += run;
  }
  return -1;
};

/**
 * Columns of whitespace between the start of `pos`'s line and `pos`, or -1 when
 * a non-whitespace character precedes it on the line. A tab advances to the
 * next multiple of four, the way CommonMark counts indentation.
 */
const lineIndentColumns = (text: string, pos: number): number => {
  let lineStart = pos;
  while (lineStart > 0 && text[lineStart - 1] !== "\n") lineStart -= 1;

  let columns = 0;
  for (let i = lineStart; i < pos; i++) {
    if (text[i] === " ") {
      columns += 1;
    } else if (text[i] === "\t") {
      columns += 4 - (columns % 4);
    } else {
      return -1;
    }
  }
  return columns;
};

/**
 * End offset of the indented code block whose first line starts at `pos` (a
 * line indented four columns): the start of the first following line that is
 * neither blank nor indented four columns, or the end of the text. Blank lines
 * do not end the block.
 */
const skipIndentedCodeBlock = (text: string, pos: number): number => {
  let cursor = pos;
  for (;;) {
    const newline = text.indexOf("\n", cursor);
    cursor = newline === -1 ? text.length : newline + 1;
    if (cursor >= text.length) return cursor;

    let probe = cursor;
    let columns = 0;
    while (
      probe < text.length &&
      (text[probe] === " " || text[probe] === "\t")
    ) {
      columns += text[probe] === "\t" ? 4 - (columns % 4) : 1;
      probe += 1;
    }
    if (probe < text.length && text[probe] !== "\n" && columns < 4) {
      return cursor;
    }
  }
};

/**
 * Scan one run of non-fence lines for raw HTML tags, maintaining the stack of
 * open containers across runs. Returns true when the range ends inside an
 * unterminated tag or comment (the browser would swallow whatever follows,
 * so a split there is never safe).
 */
const scanRawTagRange = (text: string, openStack: string[]): boolean => {
  let pos = 0;
  while (pos < text.length) {
    const char = text[pos];

    if (char === "`" || char === "~") {
      // `` `<div>` `` in prose is text, not an element. Resolving the span by
      // lookahead (rather than assuming every run opens one) matters both
      // ways: with a closer, the `<div>` inside is skipped; without one, the
      // run is literal and a real `<div>` right after it must still be seen —
      // assuming an open span there would let an unclosed container slip past
      // this guard and break the section-split DOM.
      let runLen = 1;
      while (text[pos + runLen] === char) runLen += 1;
      const indent = runLen >= 3 ? lineIndentColumns(text, pos) : -1;

      // A run of three or more fence characters that begins its line indented
      // by four columns is an *indented code block*, not a fence: the whole
      // block is code, so a `</div>` inside it is text the browser never sees.
      // Skipping the block keeps such a fake closer from popping a container
      // that is really open, and stopping at the first line that is neither
      // blank nor indented keeps a real tag after the block visible.
      if (indent >= 4) {
        pos = skipIndentedCodeBlock(text, pos);
        continue;
      }

      // A line-leading run of three or more backticks is block-level code when
      // the line classifier recognised it as a fence (then the whole fence is
      // excluded from this range) and indented code when it is indented four
      // columns (handled above). What is left is paragraph text — a run whose
      // info string contains a backtick is not a fence at all — so the ordinary
      // span pairing below is the right reading, and *not* skipping the run is
      // what keeps a real tag after the span visible.
      // A tilde run carries no span semantics, so it is always skipped.
      if (char === "~") {
        pos += runLen;
        continue;
      }

      const close = findClosingBacktickRun(text, pos + runLen, runLen);
      pos = close === -1 ? pos + runLen : close + runLen;
      continue;
    }

    if (char !== "<") {
      pos += 1;
      continue;
    }

    if (text.startsWith(COMMENT_START, pos)) {
      const end = text.indexOf(COMMENT_END, pos + COMMENT_START.length);
      if (end === -1) return true;
      pos = end + COMMENT_END.length;
      continue;
    }
    if (text.startsWith(CDATA_START, pos)) {
      const end = text.indexOf(CDATA_END, pos + CDATA_START.length);
      if (end === -1) return true;
      pos = end + CDATA_END.length;
      continue;
    }

    const closingTag = parseClosingTag(text, pos);
    if (closingTag) {
      // Pop the matching open tag and anything nested above it; the HTML
      // parser auto-closes misnested content when a container closes. Stray
      // closing tags are ignored.
      for (let i = openStack.length - 1; i >= 0; i--) {
        if (openStack[i] === closingTag.tagName) {
          openStack.length = i;
          break;
        }
      }
      pos = closingTag.endPos;
      continue;
    }

    const openingTag = parseOpeningTag(text, pos);
    if (openingTag) {
      // A tag cut off by the end of the range swallows whatever follows as
      // attribute text in the whole-document parse.
      if (!openingTag.foundEnd) return true;
      // Two ways a tag that looks opened-and-closed still opens a container:
      //  - a non-void element with a self-closing slash: in HTML that slash is
      //    ignored, so `<div/>` really does swallow whatever follows. (Foreign
      //    content such as `<circle/>` does self-close, but the pop-to-match
      //    below closes it with its `<svg>` parent.)
      //  - `<Tag …>`, an uppercase-spelled name: `protectCustomTags` (on by
      //    default) deletes the whole `<Tag>…</Tag>` region before marked
      //    parses it, so a split inside that region would keep markup the
      //    whole-document render does not have.
      // Both can only add a refusal, never remove one.
      const customTagShape = /[A-Z]/.test(text[pos + 1] ?? "");
      if (customTagShape || !VOID_ELEMENTS.has(openingTag.tagName)) {
        openStack.push(openingTag.tagName);
      }
      pos = openingTag.endPos;
      continue;
    }
    pos += 1;
  }
  return false;
};

/**
 * Whether `text` (a section's worth of Markdown source) leaves a raw HTML
 * container open. CommonMark ends an HTML block at a blank line, but the
 * browser keeps nesting into an unclosed `<div>`/`<details>`/`<table>`/…
 * until its closing tag — so a section split placed before the next heading
 * would auto-close the container at the section end and produce a different
 * DOM from the whole-document render. An open `<p>` is the one exception:
 * the HTML parser closes it when a heading starts, so both parses nest the
 * heading identically. (Downstream-only guard; upstream ant-design/x#2061
 * only checks registered custom component tags here.)
 */
export function hasUnclosedRawTags(text: string): boolean {
  const openStack: string[] = [];
  const fence: RawScanFenceState = {
    inFence: false,
    fenceChar: "",
    fenceLen: 0,
  };

  let rangeStart = 0;
  let rangeOpen = false;
  const flushRange = (end: number): boolean => {
    if (!rangeOpen) return false;
    rangeOpen = false;
    return end > rangeStart
      ? scanRawTagRange(text.slice(rangeStart, end), openStack)
      : false;
  };

  let lineStart = 0;
  while (lineStart < text.length) {
    const newline = text.indexOf("\n", lineStart);
    const lineEnd = newline === -1 ? text.length : newline;
    const wasInFence = fence.inFence;
    classifyRawScanLine(text.slice(lineStart, lineEnd), fence);
    // Fence marker and body lines carry no raw HTML; everything else is
    // scanned as one continuous run so multi-line comments and attributes
    // stay intact.
    if (fence.inFence || wasInFence) {
      if (flushRange(lineStart)) return true;
    } else if (!rangeOpen) {
      rangeStart = lineStart;
      rangeOpen = true;
    }
    if (newline === -1) break;
    lineStart = newline + 1;
  }
  if (flushRange(text.length)) return true;

  return openStack.some(tagName => tagName !== "p");
}
