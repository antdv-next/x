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

  while (scanPos < html.length && WHITESPACE_REGEX.test(html[scanPos])) {
    scanPos++;
  }

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

      while (scanPos < html.length) {
        if (html[scanPos] === "\\" && scanPos + 1 < html.length) {
          scanPos += 2;
          continue;
        }

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
 * Scan one run of non-fence lines for raw HTML tags, maintaining the stack of
 * open containers across runs. Returns true when the range ends inside an
 * unterminated tag or comment (the browser would swallow whatever follows,
 * so a split there is never safe).
 */
const scanRawTagRange = (text: string, openStack: string[]): boolean => {
  // Multi-backtick inline code spans: `` `<div>` `` in prose is text, not an
  // element. A span opens with a run and only an equal-length run closes it.
  // The span state resets per line, the same approximation the typewriter's
  // scanBoundaries makes.
  let inInlineCode = false;
  let inlineCodeLen = 0;
  let backtickRun = 0;
  const settleBacktickRun = (): void => {
    const run = backtickRun;
    backtickRun = 0;
    if (run === 0) return;
    if (inInlineCode) {
      if (run === inlineCodeLen) {
        inInlineCode = false;
        inlineCodeLen = 0;
      }
    } else {
      inInlineCode = true;
      inlineCodeLen = run;
    }
  };

  let pos = 0;
  while (pos < text.length) {
    const char = text[pos];
    if (char === "\n") {
      inInlineCode = false;
      inlineCodeLen = 0;
      backtickRun = 0;
      pos += 1;
      continue;
    }
    if (char === "`") {
      backtickRun += 1;
      pos += 1;
      continue;
    }
    settleBacktickRun();
    if (inInlineCode || char !== "<") {
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
      if (!openingTag.isSelfClosing && !VOID_ELEMENTS.has(openingTag.tagName)) {
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
