import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import {
  computed,
  defineComponent,
  effectScope,
  h,
  nextTick,
  onMounted,
  ref,
  type Component,
  type VNode,
} from "vue";

import type { StreamingOption } from "../interface";

import Section from "../components/Section.vue";
import {
  DEFAULT_MIN_SECTION_CHARS,
  useStreamingCore,
  type StreamingResult,
} from "../composables/useStreaming";
import { hasUnclosedRawTags } from "../core/detectUnclosedComponentTags";
import XMarkdown from "../index.vue";

/**
 * `streaming.incremental` must never change what ends up on the page: at every
 * point of the stream, rendering the sections must produce exactly the markup
 * that rendering the whole output at once produces. The corpora below are
 * built around the constructs that could break that promise.
 *
 * How a boundary is decided is documented in the `DESIGN CONTRACT` comment
 * above `trackSectionBoundary`. Two things matter when reading a failure here:
 * a boundary is only placed where the renderer's own marked instance starts a
 * new top-level block, and **a test asserting that nothing splits is the
 * specification, not a bug** — refusing a boundary only costs incremental
 * reuse, while an over-eager boundary would change the rendered DOM. See
 * `memory/x-markdown.md` for the history behind the
 * deliberate refusals.
 */

const noMin = { minSectionChars: 0 };

/**
 * Attribute order in a live DOM depends on patch history (an attribute added
 * to an existing element serializes last, while a fresh parse emits it in
 * template order). Streaming renders and one-shot renders therefore differ in
 * attribute order without differing in meaning. Normalise by sorting every
 * element's attributes before comparing markup.
 */
function normalizeHTML(html: string | undefined): string {
  const container = document.createElement("div");
  // A comment-root render (an empty output under the root `v-if`) has no
  // innerHTML; treat it as empty markup instead of letting `undefined`
  // coerce to the literal string "undefined".
  container.innerHTML = html ?? "";
  const walk = (el: Element) => {
    const attrs = Array.from(el.attributes).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    for (const attr of attrs) el.removeAttribute(attr.name);
    for (const attr of attrs) el.setAttribute(attr.name, attr.value);
    for (const child of Array.from(el.children)) walk(child);
  };
  for (const child of Array.from(container.children)) walk(child);
  return container.innerHTML;
}

const corpora: Record<string, string> = {
  headingsAndBlocks: [
    "# Title",
    "",
    "Intro with **bold**, *em*, `code`, [link](https://x.ant.design) and 😀 emoji.",
    "",
    "## Code",
    "",
    "```js",
    "# not a heading inside a fence",
    "const a = 1;",
    "```",
    "",
    "~~~",
    "# not a heading inside a tilde fence",
    "~~~",
    "",
    "## Table",
    "",
    "| a | b |",
    "| - | - |",
    "| 1 | 2 |",
    "",
    "## Lists",
    "",
    "- one",
    "",
    "- two (loose list across a blank line)",
    "",
    "1. first",
    "2. second",
    "",
    "> quote",
    "> # not a heading, it is quoted",
    "",
    "### Trailing",
    "",
    "Last paragraph.",
  ].join("\n"),

  headingWithoutBlankLineBefore: [
    "# A",
    "",
    "para",
    "## B directly after a paragraph",
    "",
    "more",
    "",
    "  ## indented heading (not split on)",
    "",
    "Setext",
    "======",
    "",
    "end",
  ].join("\n"),

  rawBlocks: [
    "# A",
    "",
    "<pre>",
    "",
    "# inside pre",
    "",
    "</pre>",
    "",
    "## B",
    "",
    "<!--",
    "",
    "# inside a comment",
    "",
    "-->",
    "",
    "## C",
    "",
    "$$",
    "",
    "# inside math",
    "",
    "$$",
    "",
    "## D",
    "",
    "<script>",
    "",
    "# inside script",
    "",
    "</script>",
    "",
    "end",
  ].join("\n"),

  referenceDefinitionAfterUse: [
    "# A",
    "",
    "See [the docs][docs] and the footnote[^1].",
    "",
    "## B",
    "",
    "[docs]: https://x.ant.design",
    "",
    "[^1]: footnote text",
    "",
    "## C",
    "",
    "end",
  ].join("\n"),

  crlf: "# A\r\n\r\npara\r\n\r\n## B\r\n\r\n```\r\n# fenced\r\n```\r\n\r\n## C\r\n\r\nend",

  // No blank line between a table (or paragraph) and the next heading: the
  // heading still interrupts the previous block, so it is still a boundary.
  tableThenHeading: Array.from({ length: 4 }, (_, i) =>
    [
      `## 第 ${i} 节`,
      "",
      `第 ${i} 段，含 **加粗**、\`code\` 和[链接](https://x.ant.design)。`,
      "",
      "```ts",
      `const s${i} = ${i}; // # not a heading`,
      "```",
      "",
      "| a | b |",
      "| - | - |",
      `| ${i} | ${i * 2} |`,
      `| ${i + 1} | ${i * 2 + 1} |`,
      // GFM: a line without pipes right after the rows is still a row.
      `row without pipes ${i}`,
      "",
    ].join("\n"),
  ).join(""),

  indentedFences: [
    "# A",
    "",
    " ```",
    "# inside a fence indented by one space",
    " ```",
    "",
    "## B",
    "",
    "   ~~~",
    "",
    "# inside a fence indented by three spaces",
    "",
    "   ~~~",
    "",
    "## C",
    "",
    "end",
  ].join("\n"),

  // A fence indented 1–3 spaces *inside a list item*. The block parser binds
  // the fence to the item's content indent and ends it when the body dedents
  // below that indent (`x.y();` at column 0), so the indented "closing" line
  // actually *opens* a new top-level fence that swallows "## after" and
  // everything after it, so no boundary is placed there — while the earlier
  // "## B" boundary keeps this corpus in the sawSections assertion and proves
  // a safe earlier split still happens.
  listIndentedFence: [
    "# A",
    "",
    "lead",
    "",
    "## B",
    "",
    "- one",
    "- two",
    "",
    "   ```ts",
    "x.y();",
    "   ```",
    "",
    "## after",
    "",
    "more",
  ].join("\n"),

  // The safe counterpart: the fence and its body stay at the item's content
  // indent, so the indented closing line really closes the fence and every
  // later heading still splits.
  safeListFenceSplitsAfter: [
    "# A",
    "",
    "- one",
    "- two",
    "",
    "  ```ts",
    "  x.y();",
    "  ```",
    "",
    "## B",
    "",
    "more",
    "",
    "## C",
    "",
    "end",
  ].join("\n"),

  // The list ends when a column-0 paragraph follows a blank line, so the
  // indented fence is top-level and its column-0 body line is just content.
  listClosedByParagraphThenIndentedFence: [
    "# A",
    "",
    "- item",
    "",
    "para",
    "",
    "   ```ts",
    "x",
    "   ```",
    "",
    "## after",
    "",
    "end",
  ].join("\n"),

  // A `---` right after a list paragraph dedents out of the item; with no
  // paragraph left at the outer level it is a thematic break, not a setext
  // underline, so the list is over and "## after" splits.
  hrAfterListPara: ["# A", "", "- para", "---", "", "## after", "", "end"].join(
    "\n",
  ),

  // Two fences in one item, with an item paragraph in between.
  twoFencesOneItem: [
    "# A",
    "",
    "- item",
    "",
    "  ```ts",
    "  one",
    "  ```",
    "",
    "  text",
    "",
    "  ```js",
    "  two",
    "  ```",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // A nested list whose content indent reaches 4 still contains the fence:
  // every dedenting line ends it.
  nestedListFenceInOuterItem: [
    "# A",
    "",
    "- outer",
    "  - inner",
    "",
    "    ```ts",
    "    code",
    "    ```",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // A column-0 line lazily continues the item's paragraph (the list
  // survives), and the fence after the blank line is still contained.
  lazyThenFence: [
    "# A",
    "",
    "- item with a long paragraph",
    "that lazily continues",
    "",
    "  ```ts",
    "  code",
    "  ```",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // A fence can start on the list marker line itself. The line-level fence
  // scanner never sees that opener (the line starts with `-`), so it would
  // mistake the indented closing line for an opener — but the parser ends the
  // item, and the split decision comes from marked.
  fenceOnMarkerLine: [
    "# A",
    "",
    "- ```ts",
    "  code",
    "  ```",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // A raw-opener-shaped line inside a fence (`$$`, an unpaired `<!--`) is code
  // body, not a raw block. Treating it as one would open a sticky block whose
  // closer is ordinary code text, suppressing every later boundary.
  rawOpenerInFence: [
    "# A",
    "",
    "para",
    "",
    "```sh",
    "$$",
    "<!--",
    "echo hi",
    "```",
    "",
    "## B",
    "",
    "b",
    "",
    "## C",
    "",
    "c",
  ].join("\n"),

  // An unclosed `$$` is an ordinary paragraph, so the `[a]: /x` after the blank
  // line really is a link reference definition: an earlier `[a]` must not be
  // split away from it, or the sectioned render loses the link the whole render
  // resolves. Definitions are the only document-global must-refuse condition,
  // so the decision is asked of marked rather than read off the line position.
  definitionAfterUnclosedMath: [
    "# A",
    "",
    "see [a]",
    "",
    "# B",
    "",
    "$$",
    "",
    "[a]: /x",
  ].join("\n"),

  // A definition applies document-wide even when its label line is indented
  // into a list item's content — four-plus spaces (or a tab) after the marker,
  // which a "≤3 leading spaces" trigger would miss even though marked collects
  // it. The reference in the first section must not be split away from it.
  definitionIndentedInList: [
    "# A",
    "",
    "see [a]",
    "",
    "# B",
    "",
    "- item",
    "",
    "    [a]: /x",
  ].join("\n"),

  // marked counts a tab as a single column in the marker gap, so the item's
  // content indent is 2 and the fence at two spaces is contained.
  tabAfterMarker: [
    "# A",
    "",
    "-\titem",
    "",
    "  ```ts",
    "  code",
    "  ```",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // A type-1 HTML block inside a list item, holding lines that look like
  // fences and headings; the phantom fence opens the char scanner produces
  // there are undone, and the fenced block after it is still contained.
  htmlBlockInListWithFences: [
    "# A",
    "",
    "- item",
    "",
    "  <pre>",
    "  ```",
    "  # still pre",
    "  ```",
    "  </pre>",
    "",
    "  ```ts",
    "  # not a heading",
    "  ```",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // A fence indented 4+ spaces *absolutely* but 0–3 spaces past the item's
  // content indent is invisible to the char scanner: the tracker opens it
  // itself, so its body (including a `#` line) is not mistaken for paragraph
  // text and its equally deep closing line still closes it.
  blindListFence: [
    "# A",
    "",
    "- item",
    "",
    "    ```ts",
    "    code",
    "    # not a heading",
    "    ```",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // The same blind fence, but ended early by a column-0 body line: item and
  // fence die together there, so the later indented fence is top-level and
  // "## B" is fence content while "## C" splits again.
  blindListFenceEarlyExit: [
    "# A",
    "",
    "- item",
    "",
    "    ```ts",
    "    code",
    "x",
    "",
    "   ```",
    "## B",
    "   ```",
    "",
    "## C",
    "",
    "end",
  ].join("\n"),

  // A backtick fence whose info string contains a backtick is not a fence at
  // all — it is paragraph text. The char scanner opens it anyway, so the
  // tracker undoes the phantom open and "## B" still splits.
  backtickInfoString: ["# A", "", "``` a`b", "", "## B", "", "end"].join("\n"),

  // A marker-shaped line that is itself a thematic break (`- - -`) ends the
  // list — marked's block lexer reads it as an hr, never as a sibling item.
  dashHrEndsList: ["# A", "", "- item", "- - -", "", "## B", "", "end"].join(
    "\n",
  ),

  // A blank sibling item (`- ` with nothing after the marker is NOT a list,
  // but bare `-` is): the list stays open across it and its content, and
  // "## B" splits once the blank-tailed item ends.
  blankSiblingItem: [
    "# A",
    "",
    "- a",
    "-",
    "  code",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // An ordered marker two characters wide pushes the content indent to 4:
  // the fence is invisible to the char scanner, so the tracker opens it
  // itself (body `#` lines stay fenced) and closes it at the equally deep
  // closing line; "## B" splits.
  orderedWideMarkerFence: [
    "# A",
    "",
    "10. item",
    "    ```",
    "    # fenced",
    "    ```",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // A tab right after the marker counts as a non-space character, so the
  // content indent collapses to 1 and the fence at one space is contained.
  // The column-0 `x` meets the fence-opener veto and ends the item, which
  // makes the second fence top-level: it swallows "## B" before closing,
  // and "## C" splits again.
  tabGapMarker: [
    "# A",
    "",
    "+\tpara",
    " ~~~js",
    "x",
    " ~~~",
    "",
    "## B",
    "",
    "~~~",
    "",
    "## C",
    "",
    "end",
  ].join("\n"),

  // A processing instruction starting inside a type-6 HTML block. The HTML
  // block ends at the blank line per CommonMark, but the browser reads `<?`
  // as a bogus comment running to the next `>` — across the would-be "# in
  // pi" heading, swallowing its `<h1>` open tag in the whole-document
  // render. The raw-block opener takes priority over the end-at-blank-line
  // rule, so no boundary is recorded until the PI closes; "## after" splits.
  piAfterHtmlBlock: [
    "</div>",
    "<?php",
    "",
    "# in pi",
    "",
    "?>",
    "",
    "## after",
    "",
    "more",
  ].join("\n"),

  // The blank line arrives BEFORE the nested item exists: it leaves only the
  // outer item blank-tailed, so the column-0 `x` ends both items (the outer
  // item's continuation runs first in marked) and the fence is top-level,
  // swallowing "## B"; "## C" splits.
  nestedListBlankBeforeInner: [
    "# A",
    "",
    "- a",
    "",
    "  - b",
    "x",
    "  ```",
    "## B",
    "  ```",
    "",
    "## C",
    "",
    "end",
  ].join("\n"),

  // A whitespace-only marker below the list's column (` - `) breaks the
  // current item and continues the list as a new, *empty* item (marked's
  // sibling rule matches markers with no content). The column-0 `x` then ends
  // the blank-tailed item and the list, so the fence is top-level and swallows
  // "## B"; "## C" splits.
  wsOnlyMarkerEndsList: [
    "# A",
    "",
    "- a",
    " - ",
    "x",
    "  ```",
    "## B",
    "  ```",
    "",
    "## C",
    "",
    "end",
  ].join("\n"),

  // The same whitespace-only sibling keeps the list alive across an HTML
  // begin: the empty item is blank-tailed, so `</my-card>` ends the list and
  // opens a type-7 HTML block that swallows "# H"; "## B" splits.
  wsOnlySiblingKeepsList: [
    "- a",
    " - ",
    "</my-card>",
    "# H",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // Ordered flavour of the empty sibling item.
  wsOnlyOrderedSibling: [
    "1. a",
    " 1. ",
    "</my-card>",
    "# H",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // A whitespace-only marker of a *different* kind cannot continue the list:
  // the list ends and the line is plain paragraph text, which the type-7 tag
  // then joins (it cannot interrupt a paragraph), so "# H" splits.
  wsOnlyDifferentKindParagraph: [
    "- a",
    " + ",
    "</my-card>",
    "# H",
    "",
    "end",
  ].join("\n"),

  // A setext underline swallows the whole run above it — including the
  // indented marker line the tracker provisionally opened a list for — into
  // one heading, so `</my-card>` starts a type-7 block with no paragraph in
  // the way and swallows "# H"; "## B" splits.
  setextSwallowsIndentedList: [
    "x",
    "  - nested",
    "- ",
    "</my-card>",
    "# H",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // A paragraph run containing a column-0 marker line can never become a
  // setext heading (marked's content pattern rejects it), so the `- ` line is
  // plain text, `</div>` starts a type-6 block and swallows "# H"; "## B"
  // splits.
  setextContentRunWithMarker: [
    "?>",
    "1. ",
    " - ",
    "10. item",
    "<!DOCTYPE html>",
    "</div>",
    "# H",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // An `=` run on its own line is paragraph text (and valid setext content):
  // here the following indented marker underlines it into a heading, after
  // which the processing instruction runs to its terminator across the
  // heading-looking lines; "# H" splits.
  equalsRunIsParagraph: [
    "===",
    "  - ",
    "<?php",
    "",
    "===",
    "  - ",
    "?>",
    "# H",
    "",
    "end",
  ].join("\n"),

  // A fence inside a blockquote is invisible to the char scanner: the
  // `> quote` line is fence body, not a paragraph, so the PI after the quote
  // opens a raw block that swallows "# H"; "## B" splits.
  blockquoteInnerFence: [
    "> ```",
    "> quote",
    "<?php",
    "# H",
    "?>",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // marked neutralizes setext underlines inside blockquotes, and the quote
  // lazily absorbs the `===` and the tag line: everything is one quote until
  // the heading, which splits.
  bqSetextNeutralized: ["> x", "===", "</my-card>", "# H", "", "end"].join(
    "\n",
  ),

  // A marker-shaped line does not lazy-join a blockquote: the quote ends, the
  // whitespace-only marker becomes a paragraph the tag line joins, and the
  // heading splits.
  bqMarkerEndsQuote: ["> x", "- ", "</my-card>", "# H", "", "end"].join("\n"),

  // A marker followed by *two* spaces does start a list (its content is the
  // second space): the fenced block belongs to the empty item, the type-6 tag
  // ends the list and swallows "# H"; "## B" splits.
  twoSpaceWsOnlyStartsList: [
    "-  ",
    "  ```ts",
    "</div>",
    "# H",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // But with a paragraph open, `-  ` is the setext underline of that
  // paragraph, not a list: the heading is `x` and the fence swallows "## H2"
  // (the "## B" boundary keeps the corpus in the sawSections assertion).
  dashDashUnderlineFiresSetext: [
    "# A",
    "",
    "## B",
    "",
    "x",
    "-  ",
    "  ~~~",
    "## H2",
    "",
    "end",
  ].join("\n"),

  // A tab-delimited marker is valid setext content (marked's exclusion needs
  // a literal space): the run `-\t` is underlined by `- ` into one heading,
  // and the tag line swallows "# H"; "## B" splits.
  tabMarkerKeepsSetextEligible: [
    "-\t",
    "- ",
    "</my-card>",
    "# H",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // An empty-first-line item dies at the immediately following blank line
  // (marked's `R && blankLine` rule), so the fence is top-level and swallows
  // the `===` and the `#` line.
  emptyItemBlankEndsItem: [
    "# A",
    "",
    "## B",
    "",
    "-  ",
    "   ",
    "  ~~~",
    "===",
    "#",
  ].join("\n"),

  // A setext underline fires whenever the run's *last* line is valid content
  // — marked's paragraph rule stops at the first line the setext rule can
  // start from, so the earlier tag-only and indented lines belong to a
  // separate paragraph and the underline turns `x` into a heading. The PI
  // then swallows everything else.
  setextFiresOnLastEligibleLine: [
    "# A",
    "",
    "## B",
    "",
    "</pre>",
    "  code",
    "x",
    "- ",
    "<?php",
    "===",
    "#",
  ].join("\n"),

  // A blockquote lazily absorbs plain lines even when its inner content was
  // a heading: `$$$` joins the quote, `-  ` ends it (list exclusion) and
  // starts a list, and the `\[` math block — opened with no paragraph in the
  // way — swallows the heading and the ordered list.
  bqLazyAbsorbsPlainLines: [
    "# A",
    "",
    "## B",
    "",
    "> # h",
    "$$$",
    "-  ",
    "  y",
    "\\[",
    "# H",
    "10. item",
    "    ```",
    " - ",
    "\\]",
  ].join("\n"),

  // A column-0 `$$` opens the bundled Latex plugin's math block, which
  // swallows heading-looking lines until its closing run; the split resumes
  // after it. (The raw-block state tracks `$$` conservatively: the plugin's
  // block rule needs its closing delimiter to match at all, so a prefix-based
  // marked check cannot see the block.)
  bqThenMathBlock: ["> # h", "$$", "x", "$$", "", "## B", "", "end"].join("\n"),

  // A raw block (here `<pre>`) opening inside a type-6 HTML block takes over
  // until it closes — and the HTML block stays open underneath, so the whole
  // run up to the blank line is one block to the parser and "# H" never
  // becomes a heading; "## B" splits.
  rawBlockStackedInHtmlBlock: [
    "</div>",
    "?>",
    "-   item",
    "<pre>",
    "</pre>",
    "# H",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // A fence interrupts the open paragraph, so the closing-tag line after it
  // starts a type-7 HTML block that swallows "# H"; "## B" splits.
  fenceEndsParagraph: [
    "para",
    "```",
    "x",
    "```",
    "</my-card>",
    "# H",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  // The PI after the whitespace-only marker cannot interrupt its paragraph —
  // until the next line turns out to be a table delimiter row, which stops
  // the paragraph before the PI in marked's grammar and lets the PI open
  // after all. The held-back opener activates on the delimiter row, swallows
  // up to `?>`, and "# H" splits.
  tableDelimiterActivatesOpener: [
    "- ",
    "<?php",
    "- ",
    "?>",
    "# H",
    "",
    "## B",
    "",
    "end",
  ].join("\n"),

  htmlBlocks: [
    "# A",
    "",
    '<div class="card">',
    "## not a heading, html block text",
    "</div>",
    "",
    "## B",
    "",
    "<my-card>",
    "",
    "## C inside an open custom tag",
    "",
    "</my-card>",
    "",
    "## D",
    "",
    "end",
  ].join("\n"),

  // CommonMark ends the HTML block at the blank line, but the browser keeps
  // nesting into the unclosed <div> until </div>: splitting before
  // "# Centered Title" would un-nest the heading. The only boundary is the
  // one after the container has closed.
  unclosedHtmlContainer:
    '# Doc\n\n<div align="center">\n\n' +
    "text ".repeat(60) +
    "\n\n# Centered Title\n\nmore\n\n</div>\n\n## After\n\nend\n",

  // The document can start with text that sanitizes down to no nodes at all.
  // The empty leading section must contribute nothing: emitting a placeholder
  // would give the sectioned render a node the whole-document render lacks,
  // and it would survive the end of the stream as a stray element. The blank
  // lines clear the default minSectionChars floor with a small margin.
  leadingWhitespaceSection: `${"\n".repeat(DEFAULT_MIN_SECTION_CHARS + 10)}# Heading\n\ntext\n`,

  leadingCommentSection: `<!--\n${"comment ".repeat(30)}\n-->\n\n# Heading\n\ntext\n`,
};

/** Drive `useStreamingCore` inside an effect scope with controllable refs. */
function createCore(
  streaming: boolean | StreamingOption,
  components?: Record<string, Component>,
) {
  const scope = effectScope();
  const content = ref("");
  const streamingRef = ref<boolean | StreamingOption>(streaming);
  const componentsRef = ref(components);
  let core!: StreamingResult;
  scope.run(() => {
    core = useStreamingCore(content, streamingRef, componentsRef);
  });
  return { scope, content, streamingRef, core };
}

describe("streaming.incremental", () => {
  describe("sections are a lossless partition of the output", () => {
    for (const [name, text] of Object.entries(corpora)) {
      it(`${name}`, async () => {
        const { scope, content, streamingRef, core } = createCore({
          hasNextChunk: true,
          incremental: noMin,
        });
        let sawSections = false;
        for (let i = 1; i <= text.length; i++) {
          content.value = text.slice(0, i);
          await nextTick();
          const { output, sections } = core;
          if (sections.value) {
            sawSections = true;
            expect(sections.value.length).toBeGreaterThan(1);
            expect(sections.value.join("")).toBe(output.value);
            // Every boundary sits right before a column-0 ATX heading.
            for (const section of sections.value.slice(1)) {
              expect(section).toMatch(/^#{1,6}[ \t]/);
            }
          }
        }
        streamingRef.value = { hasNextChunk: false, incremental: noMin };
        await nextTick();
        expect(core.output.value).toBe(text);
        if (core.sections.value) {
          expect(core.sections.value.join("")).toBe(text);
        }
        if (name === "referenceDefinitionAfterUse") {
          // Splits until the definition shows up, then every boundary is dropped.
          expect(sawSections).toBe(true);
          expect(core.sections.value).toBeNull();
        } else {
          expect(sawSections).toBe(true);
        }
        scope.stop();
      }, 30000);
    }
  });

  describe("rendered markup equals the whole-document render at every step", () => {
    // Markup equivalence is checked with animation off (the same condition the
    // upstream React suite uses): AnimationText's span fragmentation depends on
    // patch history, so innerHTML legitimately differs between modes with
    // animation on. The animation-on invariant — identical textContent at
    // every step — is covered separately below.
    const renderBoth = (
      streamingExtra: Partial<StreamingOption> = {},
      components?: Record<string, Component>,
    ) => {
      const withDefaults = { enableAnimation: false, ...streamingExtra };
      const whole = mount(XMarkdown, {
        props: {
          content: "",
          streaming: { hasNextChunk: true, ...withDefaults },
          components,
        },
      });
      const sectioned = mount(XMarkdown, {
        props: {
          content: "",
          streaming: {
            hasNextChunk: true,
            incremental: noMin,
            ...withDefaults,
          },
          components,
        },
      });
      const update = async (content: string, hasNextChunk: boolean) => {
        await whole.setProps({
          content,
          streaming: { hasNextChunk, ...withDefaults },
          components,
        });
        await sectioned.setProps({
          content,
          streaming: { hasNextChunk, incremental: noMin, ...withDefaults },
          components,
        });
        await nextTick();
        return {
          whole: normalizeHTML((whole.element as HTMLElement).innerHTML),
          sectioned: normalizeHTML(
            (sectioned.element as HTMLElement).innerHTML,
          ),
        };
      };
      return { update, whole, sectioned };
    };

    for (const [name, text] of Object.entries(corpora)) {
      it(`${name}`, async () => {
        const { update } = renderBoth();
        for (let i = 1; i <= text.length; i++) {
          const { whole, sectioned } = await update(text.slice(0, i), true);
          expect(sectioned).toBe(whole);
        }
        const done = await update(text, false);
        expect(done.sectioned).toBe(done.whole);
        // …and both equal a plain non-streaming render of the final text
        // (hasNextChunk falsy → the non-streaming path; animation off to
        // match the condition the two streaming renders were driven with).
        const plain = mount(XMarkdown, {
          props: { content: text, streaming: { enableAnimation: false } },
        });
        await nextTick();
        expect(done.sectioned).toBe(
          normalizeHTML((plain.element as HTMLElement).innerHTML),
        );
      }, 60000);
    }

    it("with custom components, a tail and a code component", async () => {
      const text = corpora.headingsAndBlocks;
      const components = {
        code: defineComponent({
          name: "CodeProbe",
          inheritAttrs: false,
          setup(_, { attrs, slots }) {
            return () =>
              h(
                "code",
                {
                  "data-test-lang": attrs.lang,
                  "data-test-block": String(attrs.block),
                },
                slots.default?.(),
              );
          },
        }),
        h2: defineComponent({
          name: "H2Probe",
          inheritAttrs: false,
          setup(_, { slots }) {
            return () => h("h2", { "data-custom": "1" }, slots.default?.());
          },
        }),
      };
      const { update } = renderBoth({ tail: true }, components);
      for (let i = 1; i <= text.length; i += 3) {
        const { whole, sectioned } = await update(text.slice(0, i), true);
        expect(sectioned).toBe(whole);
      }
      const done = await update(text, false);
      expect(done.sectioned).toBe(done.whole);
    }, 60000);

    it("renders an empty document with no element content at all", async () => {
      // As upstream: an empty output skips the root wrapper entirely rather
      // than leaving an empty `.x-markdown` (plus a placeholder element).
      // Vue still anchors the root `v-if` with a comment node — `children`
      // counts only elements, which is what "nothing" means here.
      const host = mount(
        defineComponent({
          components: { XMarkdown },
          props: { content: { type: String, default: "" } },
          template: `<div class="host"><XMarkdown :content="content" /></div>`,
        }),
        { props: { content: "" } },
      );
      await nextTick();
      const root = host.element as HTMLElement;
      expect(root.querySelector(".x-markdown")).toBeNull();
      expect(root.children.length).toBe(0);
      expect(root.textContent).toBe("");

      // A non-empty output that sanitizes down to nothing keeps the wrapper
      // (upstream renders `<div class="x-markdown" />`) but gains no
      // placeholder element inside it — only the childless Fragment's
      // invisible anchor text nodes.
      const blank = mount(XMarkdown, { props: { content: "\n\n" } });
      await nextTick();
      const blankRoot = blank.element as HTMLElement;
      expect(blankRoot.className).toBe("x-markdown");
      expect(blankRoot.querySelector("span")).toBeNull();
      expect(blankRoot.children.length).toBe(0);
    });

    it("keeps an empty leading section out of the default minSectionChars split", async () => {
      // The corpus's leading blank lines clear the default minSectionChars
      // floor, so the first section is empty and must contribute no element
      // at all.
      const text = corpora.leadingWhitespaceSection;
      const sectioned = mount(XMarkdown, {
        props: {
          content: text,
          streaming: {
            hasNextChunk: true,
            incremental: true,
            enableAnimation: false,
          },
        },
      });
      const plain = mount(XMarkdown, {
        props: { content: text, streaming: { enableAnimation: false } },
      });
      await nextTick();
      // Pin the precondition: the split must actually happen — without it
      // the sectioned mount falls back to the whole-document render and the
      // assertions below pass vacuously.
      expect(sectioned.findAllComponents(Section).length).toBeGreaterThan(1);
      expect(
        (sectioned.element as HTMLElement).querySelector("span"),
      ).toBeNull();
      // …and the streamed output is identical to a one-shot render.
      expect((sectioned.element as HTMLElement).innerHTML).toBe(
        (plain.element as HTMLElement).innerHTML,
      );
    });

    it("with animation on, textContent still matches the whole-document render at every step", async () => {
      const text = corpora.headingsAndBlocks;
      const whole = mount(XMarkdown, {
        props: { content: "", streaming: { hasNextChunk: true } },
      });
      const sectioned = mount(XMarkdown, {
        props: {
          content: "",
          streaming: { hasNextChunk: true, incremental: noMin },
        },
      });
      for (let i = 1; i <= text.length; i += 3) {
        await whole.setProps({
          content: text.slice(0, i),
          streaming: { hasNextChunk: true },
        });
        await sectioned.setProps({
          content: text.slice(0, i),
          streaming: { hasNextChunk: true, incremental: noMin },
        });
        await nextTick();
        expect((sectioned.element as HTMLElement).textContent).toBe(
          (whole.element as HTMLElement).textContent,
        );
      }
      await whole.setProps({
        content: text,
        streaming: { hasNextChunk: false },
      });
      await sectioned.setProps({
        content: text,
        streaming: { hasNextChunk: false, incremental: noMin },
      });
      await nextTick();
      const plain = mount(XMarkdown, { props: { content: text } });
      await nextTick();
      expect((sectioned.element as HTMLElement).textContent).toBe(
        (plain.element as HTMLElement).textContent,
      );
    }, 60000);
  });

  describe("boundary guards", () => {
    const sectionsFor = async (
      text: string,
      streaming: StreamingOption = {},
      components?: Record<string, Component>,
    ) => {
      const { scope, content, core } = createCore(
        { hasNextChunk: true, incremental: noMin, ...streaming },
        components,
      );
      content.value = text;
      await nextTick();
      const sections = core.sections.value;
      scope.stop();
      return sections;
    };

    it("splits before a top-level heading that follows a blank line", async () => {
      expect(await sectionsFor("# A\n\npara\n\n## B\n\nmore\n\n")).toEqual([
        "# A\n\npara\n\n",
        "## B\n\nmore\n\n",
      ]);
    });

    it("splits on a heading directly after a paragraph line (a heading interrupts a paragraph)", async () => {
      expect(await sectionsFor("# A\n\npara\n## B\n\nmore\n\n")).toEqual([
        "# A\n\npara\n",
        "## B\n\nmore\n\n",
      ]);
    });

    it("does not split on an indented heading or a setext heading", async () => {
      expect(
        await sectionsFor("# A\n\npara\n\n   ## B\n\nmore\n\n"),
      ).toBeNull();
      expect(await sectionsFor("# A\n\npara\n\nB\n---\n\nmore\n\n")).toBeNull();
    });

    it("does not split inside an HTML block until its blank line", async () => {
      expect(
        await sectionsFor("# A\n\n<div>\n## B\n</div>\n\n## C\n\n"),
      ).toEqual(["# A\n\n<div>\n## B\n</div>\n\n", "## C\n\n"]);
      // The HTML block ends at the blank line, but the <div> is still open in
      // the browser's eyes: splitting before ## B would auto-close the div at
      // the section end and un-nest the heading. The split resumes once the
      // container has closed.
      expect(
        await sectionsFor("# A\n\n<div>\n\n## B\n\n</div>\n\n"),
      ).toBeNull();
      expect(
        await sectionsFor("# A\n\n<div>\n\n## B\n\n</div>\n\n## C\n\n"),
      ).toEqual(["# A\n\n<div>\n\n## B\n\n</div>\n\n", "## C\n\n"]);
    });

    it("does not split while a raw HTML container is open, but angle brackets in code do not veto", async () => {
      // The review repro: an unclosed centered container around a heading.
      expect(
        await sectionsFor(
          '# Doc\n\n<div align="center">\n\n' +
            "text ".repeat(60) +
            "\n\n# Centered Title\n\nmore\n\n</div>\n\n## After\n\nend\n",
        ),
      ).toEqual([
        '# Doc\n\n<div align="center">\n\n' +
          "text ".repeat(60) +
          "\n\n# Centered Title\n\nmore\n\n</div>\n\n",
        "## After\n\nend\n",
      ]);
      // Fenced code, inline code and autolinks full of angle brackets must
      // not be mistaken for open containers.
      expect(
        await sectionsFor(
          "# A\n\n```cpp\n#include <vector>\nauto xs = std::vector<int>{};\n```\n\n" +
            "Inline `<div>` and <https://x.ant.design>.\n\n## B\n\nend\n",
        ),
      ).toHaveLength(2);
      // An open <p> is safe: the HTML parser closes it before a heading in
      // both parse modes.
      expect(
        await sectionsFor("# A\n\n<p>\n\npara text\n\n## B\n\nend\n"),
      ).toHaveLength(2);
    });

    it("does not split out of a nested raw container the tag scan must see", async () => {
      // Two <pre> opens with one </pre>: marked ends its HTML block at the
      // </pre> line, but the browser keeps the outer <pre> open and nests the
      // heading into it. The veto must count the second <pre> — a line-leading
      // ``` run paired into an inline span would hide it.
      expect(
        await sectionsFor(
          "    ```\n<pre>\n    ```\n<pre>\n```sh\n  ```\n</pre>\n# B\n~~~",
        ),
      ).toBeNull();
    });

    it("does not split on # lines inside fenced code, indented fences included", async () => {
      expect(await sectionsFor("# A\n\n```\n\n# fenced\n\n```\n\n")).toBeNull();
      expect(await sectionsFor("# A\n\n~~~\n\n# fenced\n\n~~~\n\n")).toBeNull();
      expect(await sectionsFor("# A\n\n ```\n# fenced\n ```\n\n")).toBeNull();
      expect(
        await sectionsFor("# A\n\n   ```\n\n# fenced\n\n   ```\n\n"),
      ).toBeNull();
      // Four spaces is indented code, not a fence: the `#` line after it is a heading.
      expect(await sectionsFor("# A\n\n    ```\n\n# heading\n\n")).toHaveLength(
        2,
      );
    });

    it("reads tab-indented lines as indented code, not paragraphs", async () => {
      // A leading tab is four columns to the block parser, so `\tcode` is an
      // indented code block: the raw/HTML opener after it is a block start,
      // and the `#` line that follows is swallowed by that block instead of
      // becoming a top-level heading boundary.
      expect(await sectionsFor("# A\n\n\tcode\n<?\n#\n")).toBeNull();
      expect(await sectionsFor("# A\n\n\tcode\n</span>\n#\n")).toBeNull();
      // A tab-indented `#` is code, not a heading.
      expect(
        await sectionsFor("# A\n\n\tcode\n\n\t# not a heading\n"),
      ).toBeNull();
    });

    it("splits every heading after a list-internal fence that closes inside its item", async () => {
      // The P3-1 regression shape: a list marker plus a safe indented fence
      // must not poison later splits.
      const text = [
        "# A",
        "",
        "- one",
        "- two",
        "",
        "  ```ts",
        "  x.y();",
        "  ```",
        "",
        "## B",
        "",
        "b",
        "",
        "## C",
        "",
        "c",
        "",
        "## D",
        "",
        "d",
        "",
      ].join("\n");
      expect(await sectionsFor(text)).toHaveLength(4);
    });

    it("does not split on a heading swallowed by the fence a dedenting list fence re-opens", async () => {
      // The column-0 body line ends the item and its fence; the indented
      // "closing" line re-opens at the top level and swallows the heading.
      expect(
        await sectionsFor(
          "# A\n\n- one\n\n  ```ts\nx.y();\n  ```\n\n## after\n\nmore\n",
        ),
      ).toBeNull();
      // …and the split resumes once that re-opened fence actually closes.
      expect(
        await sectionsFor(
          "# A\n\n- one\n\n  ```ts\nx.y();\n  ```\n\n## after\n\n  ```\n\n## B\n",
        ),
      ).toHaveLength(2);
    });

    it("does not split inside a fence indented past the scanner's window but inside a list item", async () => {
      // Four absolute spaces = two relative to the item's content indent: a
      // contained fence the char scanner cannot see. Its `#` line stays
      // fenced, and the split resumes after the equally deep closing line.
      expect(
        await sectionsFor(
          "# A\n\n- item\n\n    ```ts\n    # fenced\n    ```\n\n",
        ),
      ).toBeNull();
      expect(
        await sectionsFor(
          "# A\n\n- item\n\n    ```ts\n    # fenced\n    ```\n\n## B\n",
        ),
      ).toEqual([
        "# A\n\n- item\n\n    ```ts\n    # fenced\n    ```\n\n",
        "## B\n",
      ]);
      // …but a column-0 `#` line still ends item and fence together and is a
      // heading, blind fence or not.
      expect(
        await sectionsFor("# A\n\n- item\n\n    ```ts\n# heading\n    ```\n\n"),
      ).toHaveLength(2);
    });

    it("treats a backtick fence with a backtick in its info string as paragraph text", async () => {
      expect(await sectionsFor("# A\n\n``` a`b\n\n## B\n\n")).toHaveLength(2);
      // A tilde fence has no such restriction: the heading stays fenced.
      expect(await sectionsFor("# A\n\n~~~ a`b\n\n## B\n\n")).toBeNull();
    });

    it("does not split on # lines inside <pre>, <script>, comments and $$ math", async () => {
      expect(await sectionsFor("# A\n\n<pre>\n\n# x\n\n</pre>\n\n")).toBeNull();
      expect(
        await sectionsFor("# A\n\n<SCRIPT>\n\n# x\n\n</SCRIPT>\n\n"),
      ).toBeNull();
      expect(await sectionsFor("# A\n\n<!--\n\n# x\n\n-->\n\n")).toBeNull();
      expect(await sectionsFor("# A\n\n$$\n\n# x\n\n$$\n\n")).toBeNull();
      expect(await sectionsFor("# A\n\n\\[\n\n# x\n\n\\]\n\n")).toBeNull();
      // …but splits again once the raw block has closed.
      expect(
        await sectionsFor("# A\n\n<pre>\n\n# x\n\n</pre>\n\n## B\n\n"),
      ).toEqual(["# A\n\n<pre>\n\n# x\n\n</pre>\n\n", "## B\n\n"]);
    });

    it("does not treat a raw opener inside a fenced code block as a raw block", async () => {
      // A bare `$$` or an unpaired `<!--` in fence body is code text. Opening
      // a raw block there would be sticky — its closer is ordinary code text
      // that never appears again — and would suppress every later heading.
      expect(
        await sectionsFor(
          "# A\n\npara\n\n```sh\n$$\necho hi\n```\n\n## B\n\nb\n\n## C\n\nc\n",
        ),
      ).toHaveLength(3);
      expect(
        await sectionsFor(
          "# A\n\npara\n\n```sh\n<!--\necho hi\n```\n\n## B\n\nb\n\n## C\n\nc\n",
        ),
      ).toHaveLength(3);
      // A tilde fence behaves the same.
      expect(
        await sectionsFor("# A\n\n~~~\n$$\n~~~\n\n## B\n\nb\n\n## C\n\nc\n"),
      ).toHaveLength(3);
      // A fence nested in a list item is invisible to the char scanner; its
      // raw opener is still code body.
      expect(
        await sectionsFor(
          "- item\n\n  ```html\n  <!--\n  code\n  ```\n\n## B\n\nb\n\n## C\n\nc\n",
        ),
      ).toHaveLength(3);
      // A genuine raw opener right after a closed fence still opens its block,
      // so the heading inside it is not split on.
      expect(
        await sectionsFor("# A\n\n```\nx\n```\n\n$$\nmath\n$$\n\n## B\n\nb\n"),
      ).toEqual(["# A\n\n```\nx\n```\n\n$$\nmath\n$$\n\n", "## B\n\nb\n"]);
    });

    it("does not disable splitting for a definition-shaped line inside a fence or a raw block", async () => {
      // `[a]: /x` in fence body is code text — marked extracts no definition
      // there — so it must not set noSplit or discard earlier boundaries. A
      // `$$` line opens a raw block first, whose branch consumes the body.
      expect(
        await sectionsFor(
          "# A\n\npara\n\n# B\n\n```markdown\n[a]: /x\n```\n\n# C\n\ntail\n",
        ),
      ).toHaveLength(3);
      expect(
        await sectionsFor(
          "# A\n\npara\n\n# B\n\n$$\n[a]: /x\n$$\n\n# C\n\ntail\n",
        ),
      ).toHaveLength(3);
      expect(
        await sectionsFor(
          "# A\n\npara\n\n# B\n\n<!--\n[a]: /x\n-->\n\n# C\n\ntail\n",
        ),
      ).toHaveLength(3);
      // A real definition — top-level or nested — still disables splitting.
      expect(
        await sectionsFor("# A\n\npara\n\n# B\n\n[x]: /y\n\n# C\n\ntail\n"),
      ).toBeNull();
      expect(
        await sectionsFor("# A\n\npara\n\n# B\n\n> [x]: /y\n\n# C\n\ntail\n"),
      ).toBeNull();
    });

    it("asks marked, not the line position, whether the document has a definition", async () => {
      // An unclosed `$$` (or `\[`) is an ordinary paragraph, so the following
      // `[a]: /x` really is a definition — marked's `links` map has it — and
      // splitting the earlier `[a]` away from it would render `[a]` as literal
      // text. The conservative raw-block state must not hide it.
      expect(
        await sectionsFor("# A\n\nsee [a]\n\n# B\n\n$$\n\n[a]: /x\n"),
      ).toBeNull();
      expect(
        await sectionsFor("# A\n\nsee [a]\n\n# B\n\n\\[\n\n[a]: /x\n"),
      ).toBeNull();
      // The destination and/or title may complete on a later line.
      expect(
        await sectionsFor("# A\n\nsee [a]\n\n# B\n\n[a]:\n/url\n"),
      ).toBeNull();
      // A definition-shaped line that marked reads as body text (fence,
      // comment, real `$$` math) still leaves the earlier boundaries alone.
      expect(
        await sectionsFor(
          "# A\n\npara\n\n# B\n\n```md\n[a]: /x\n```\n\n# C\n\ntail\n",
        ),
      ).toHaveLength(3);
      expect(
        await sectionsFor(
          "# A\n\npara\n\n# B\n\n<!--\n[a]: /x\n-->\n\n# C\n\ntail\n",
        ),
      ).toHaveLength(3);
      // The trigger must have no false negatives: a definition whose label
      // line is indented into a list item's content (four-plus spaces, or a
      // tab) is still document-global, and marked collects it.
      expect(
        await sectionsFor("# A\n\nsee [a]\n\n# B\n\n- item\n\n    [a]: /x\n"),
      ).toBeNull();
      expect(
        await sectionsFor("# A\n\nsee [a]\n\n# B\n\n1. item\n\n     [a]: /x\n"),
      ).toBeNull();
      expect(
        await sectionsFor("# A\n\nsee [a]\n\n# B\n\n- item\n\n\t[a]: /x\n"),
      ).toBeNull();
    });

    it("drops all boundaries once a reference or footnote definition appears", async () => {
      const { scope, content, core } = createCore({
        hasNextChunk: true,
        incremental: noMin,
      });
      content.value = "# A\n\n[docs]\n\n## B\n\n";
      await nextTick();
      expect(core.sections.value).toHaveLength(2);
      content.value = "# A\n\n[docs]\n\n## B\n\n[docs]: https://x\n\n## C\n\n";
      await nextTick();
      expect(core.sections.value).toBeNull();
      scope.stop();
    });

    it("drops all boundaries for definitions nested in blockquotes or list items", async () => {
      // A definition applies document-wide even when it lives inside a quote
      // or a list, so it must disable splitting just like a top-level one.
      expect(
        await sectionsFor("# A\n\n[docs]\n\n## B\n\n> [docs]: https://x\n"),
      ).toBeNull();
      expect(
        await sectionsFor("# A\n\n[docs]\n\n## B\n\n- [docs]: https://x\n"),
      ).toBeNull();
      expect(
        await sectionsFor(
          "# A\n\n[docs]\n\n## B\n\n> - [docs]: https://x\n\n## C\n",
        ),
      ).toBeNull();
    });

    it("does not end a raw block at a mere closing-tag prefix like </prefix>", async () => {
      // CommonMark's type-1 end condition is the literal `</pre>`: `</prefix>`
      // is pre content, and the `#` after it is still inside the block.
      expect(
        await sectionsFor("# A\n\n<pre>\n\n</prefix>\n\n# x\n\n</pre>\n\n"),
      ).toBeNull();
      expect(
        await sectionsFor("# A\n\n<script>\n</scripts>\n# x\n</script>\n\n"),
      ).toBeNull();
      // …and the block still ends at the real closing tag.
      expect(
        await sectionsFor("# A\n\n<pre>\n\n# x\n\n</pre>\n\n## B\n\n"),
      ).toHaveLength(2);
    });

    it("ends a list at a thematic-break-shaped marker line instead of treating it as a sibling", async () => {
      // `- - -` after an item is an hr — marked's block lexer never reads it
      // as a list item — so the list ends and the heading splits.
      expect(await sectionsFor("- item\n- - -\n\n## B\n\ntail")).toEqual([
        "- item\n- - -\n\n",
        "## B\n\ntail",
      ]);
      // …and a definition after that hr is top-level and document-wide.
      expect(
        await sectionsFor("- item\n- - -\n[^1]: n\n# A\n\ntail"),
      ).toBeNull();
    });

    it("starts a fresh ordered list at any number once the previous item ended", async () => {
      // The `2. b` marker ends the bullet item (any marker does) and opens a
      // new ordered list — the just-ended item's paragraph no longer blocks
      // the non-1 start. Its fence dedents below the new item, so it is
      // top-level and swallows "## B"; "## C" splits.
      expect(
        await sectionsFor("- a\n2. b\n  ```\n## B\n  ```\n\n## C\n\ntail"),
      ).toEqual(["- a\n2. b\n  ```\n## B\n  ```\n\n", "## C\n\ntail"]);
    });

    it("tracks list items whose content indent is 4 or more", async () => {
      // `-   ```ts` has content indent 4, and its marker line already vetoes
      // lazy continuation (the content slice begins a fence), so the
      // dedenting ` </my-card>` ends the item and opens a type-7 HTML block
      // that swallows the fences and the headings as text.
      expect(
        await sectionsFor("-   ```ts\n </my-card>\n~~~\n~~~\n## B\n#"),
      ).toBeNull();
    });

    it("closes $$ math only at a column-0 delimiter and splits after it", async () => {
      expect(await sectionsFor("$$\nx\n$$\n\n## B\n\ntail")).toEqual([
        "$$\nx\n$$\n\n",
        "## B\n\ntail",
      ]);
      // An indented or longer run keeps the block open (the plugin's closer
      // is the opening run alone, right after a newline).
      expect(await sectionsFor("$$\nx\n  $$\n\n## B\n\ntail")).toBeNull();
      expect(await sectionsFor("$$\nx\n$$$\n\n## B\n\ntail")).toBeNull();
      // A bracket block closes at its `\]` line.
      expect(await sectionsFor("\\[\nx\n\\]\n\n## B\n\ntail")).toEqual([
        "\\[\nx\n\\]\n\n",
        "## B\n\ntail",
      ]);
    });

    it("does not open block math on top of an open paragraph", async () => {
      // The katex block rule cannot interrupt a paragraph, so the `$$` lines
      // here are lazy paragraph text and the heading splits normally.
      expect(await sectionsFor("para\n$$\nx\n$$\n\n## B\n\ntail")).toEqual([
        "para\n$$\nx\n$$\n\n",
        "## B\n\ntail",
      ]);
    });

    it("does not close $$ math on the line right after the opener", async () => {
      // The plugin's block rule needs at least one body line between the
      // fences, so the second `$$` is body text and "# H" stays inside the
      // math; the run closes at the third `$$` and "## B" splits.
      expect(await sectionsFor("$$\n$$\n# H\n$$\n\n## B\n\ntail")).toEqual([
        "$$\n$$\n# H\n$$\n\n",
        "## B\n\ntail",
      ]);
    });

    it("treats a raw opener as a raw block wherever it appears", async () => {
      // A raw opener (`<?php`) starts a raw block even though CommonMark lets
      // it continue a paragraph: the tracker keeps such lines out of any
      // section split because the browser and DOMPurify re-interpret them (a
      // `<?` opens a bogus comment that can swallow a following `<h1>`). The
      // block ends at `?>` and the heading after it splits.
      expect(await sectionsFor("para\n<?php\n- \n?>\n# H\n\ntail")).toEqual([
        "para\n<?php\n- \n?>\n",
        "# H\n\ntail",
      ]);
      expect(await sectionsFor("x\n<?php\n---\n# H\n\ntail")).toBeNull();
      // Without a `?>` the raw block never closes, so nothing splits — a
      // conservative refusal, never a wrong boundary.
      expect(await sectionsFor("para\n<?php\ny\n# H\n\ntail")).toBeNull();
    });

    it("reads a whitespace-only marker as an empty sibling item of an open list", async () => {
      // The empty item is blank-tailed, so the tag line ends the list and
      // opens a type-7 HTML block that swallows the heading.
      expect(await sectionsFor("- a\n - \n</my-card>\n# H\n\ntail")).toBeNull();
      // A marker of a different kind cannot continue the list: it becomes a
      // paragraph, the tag joins it, and the heading splits.
      expect(await sectionsFor("- a\n + \n</my-card>\n# H\n\ntail")).toEqual([
        "- a\n + \n</my-card>\n",
        "# H\n\ntail",
      ]);
      // Inside a nested different-kind list the whitespace-only marker is
      // outer item content and the tag line lazy-joins the item, so only the
      // final heading splits.
      expect(await sectionsFor("- + a\n  - \n</my-card>\n# H\n")).toEqual([
        "- + a\n  - \n</my-card>\n",
        "# H\n",
      ]);
    });

    it("treats `-  ` as a setext underline when a paragraph is open", async () => {
      // The paragraph `x` becomes a heading and the fence swallows "## H2".
      expect(await sectionsFor("x\n-  \n  ~~~\n## H2\n\ntail")).toBeNull();
      // With no paragraph open `-  ` is a real (empty) list item: the fence
      // belongs to the item, the heading dedents out and splits.
      expect(await sectionsFor("\n-  \n  ~~~\n## H2\n\ntail")).toEqual([
        "\n-  \n  ~~~\n",
        "## H2\n\ntail",
      ]);
    });

    it("lets a blockquote lazily absorb plain lines until an exclusion", async () => {
      // `$$$` joins the quote even though the quote's inner content is a
      // heading; `-  ` ends the quote and starts a list whose item ends at
      // the dedenting `\[`; the math block swallows "# H".
      expect(
        await sectionsFor("> # h\n$$$\n-  \n  y\n\\[\n# H\n\\]\n\ntail"),
      ).toBeNull();
      // A column-0 `$$` always opens the conservative math raw block, even
      // when it lazily continues a quote: a missed split, never a wrong one.
      expect(await sectionsFor("> # h\n$$\nx\n# H\n\ntail")).toBeNull();
      // A bullet marker followed by a space ends the quote; a non-1 ordered
      // marker or a tab-delimited one joins it.
      expect(await sectionsFor("> x\n2. y\n# H\n\ntail")).toEqual([
        "> x\n2. y\n",
        "# H\n\ntail",
      ]);
      expect(await sectionsFor("> x\n- y\n# H\n\ntail")).toEqual([
        "> x\n- y\n",
        "# H\n\ntail",
      ]);
    });

    it("fires a setext underline whenever the run's last line is eligible", async () => {
      // The tag-only and indented lines form their own paragraph; the
      // underline fires on `x` alone, and the PI swallows the rest.
      expect(
        await sectionsFor("</pre>\n  code\nx\n- \n<?php\n===\n#\n\ntail"),
      ).toBeNull();
      // A column-0 marker followed by a space is not eligible: no underline,
      // the tag line joins the paragraph and the heading splits.
      expect(await sectionsFor("x\n1. \n- \n</my-card>\n# H\n\ntail")).toEqual([
        "x\n1. \n- \n</my-card>\n",
        "# H\n\ntail",
      ]);
    });

    it("ends an empty-first-line item at the immediately following blank line", async () => {
      // The item dies at the blank, so the fence is top-level and swallows
      // the `===` and the `#` line.
      expect(await sectionsFor("-  \n   \n  ~~~\n===\n#\n\ntail")).toBeNull();
      // Without the blank the item lives: the fence belongs to it, and the
      // dedenting heading ends the blank-tailed item and splits.
      expect(await sectionsFor("-  \n  ~~~\n===\n#\n\ntail")).toEqual([
        "-  \n  ~~~\n===\n",
        "#\n\ntail",
      ]);
    });

    it("does not end processing instructions, declarations or CDATA at a blank line", async () => {
      // CommonMark types 3–5 end only at their terminator, so `#` lines after
      // a blank line are still inside the block.
      expect(
        await sectionsFor("# A\n\n<?php\n\necho 1;\n\n# x\n\n?>\n\n"),
      ).toBeNull();
      expect(
        await sectionsFor("# A\n\n<![CDATA[\n\n# x\n\n]]>\n\n"),
      ).toBeNull();
      expect(await sectionsFor("# A\n\n<!ENTITY\n\n# x\n\n>\n\n")).toBeNull();
      // …and splitting resumes once the terminator has streamed.
      expect(
        await sectionsFor("# A\n\n<?php\n\n# x\n\n?>\n\n## B\n\n"),
      ).toHaveLength(2);
      expect(
        await sectionsFor("# A\n\n<![CDATA[\n\n# x\n\n]]>\n\n## B\n\n"),
      ).toHaveLength(2);
    });

    it("does not split while a custom component tag is still open", async () => {
      const components = { "my-card": defineComponent(() => () => null) };
      expect(
        await sectionsFor(
          "# A\n\n<my-card>\n\n## B\n\n</my-card>\n\n",
          {},
          components,
        ),
      ).toBeNull();
      expect(
        await sectionsFor(
          "# A\n\n<my-card>\n\n## B\n\n</my-card>\n\n## C\n\n",
          {},
          components,
        ),
      ).toEqual(["# A\n\n<my-card>\n\n## B\n\n</my-card>\n\n", "## C\n\n"]);
      // The same text without the component registered still does not split:
      // the browser nests the heading inside the unknown element just the
      // same, so the raw-HTML guard applies to it too.
      expect(
        await sectionsFor("# A\n\n<my-card>\n\n## B\n\n</my-card>\n\n"),
      ).toBeNull();
      // …and splits again once the tag has closed, registered or not.
      expect(
        await sectionsFor("# A\n\n<my-card>\n\n## B\n\n</my-card>\n\n## C\n\n"),
      ).toHaveLength(2);
    });

    it("merges sections shorter than minSectionChars into the next one", async () => {
      const text = "# A\n\npara\n\n## B\n\nmore\n\n## C\n\nend\n\n";
      expect(await sectionsFor(text, { incremental: true })).toBeNull();
      expect(
        await sectionsFor(text, { incremental: { minSectionChars: 12 } }),
      ).toEqual(["# A\n\npara\n\n## B\n\nmore\n\n", "## C\n\nend\n\n"]);
    });

    it("exposes a boundary held inside the pending table once the table commits", async () => {
      // The table token stays pending until its blank line (unchanged
      // behaviour), and a heading right after the last row is part of that
      // pending text. The boundary is recorded immediately but only used once
      // the table has committed.
      const { scope, content, core } = createCore({
        hasNextChunk: true,
        incremental: noMin,
      });
      content.value = "# A\n\n| a |\n| - |\n| 1 |\n## B\n";
      await nextTick();
      expect(core.sections.value).toBeNull();
      content.value = "# A\n\n| a |\n| - |\n| 1 |\n## B\n\npara\n\n";
      await nextTick();
      expect(core.sections.value).toEqual([
        "# A\n\n| a |\n| - |\n| 1 |\n",
        "## B\n\npara\n\n",
      ]);
      scope.stop();
    });

    it("is off unless incremental is set, and off for a non-streaming render", async () => {
      const text = "# A\n\npara\n\n## B\n\nmore\n\n";
      expect(await sectionsFor(text, { incremental: undefined })).toBeNull();
      const { scope, core } = createCore({
        hasNextChunk: false,
        incremental: noMin,
      });
      await nextTick();
      expect(core.output.value).toBe("");
      expect(core.sections.value).toBeNull();
      scope.stop();
    });

    it("sees definitions that streamed while incremental was off once it is switched on", async () => {
      const { scope, content, streamingRef, core } = createCore({
        hasNextChunk: true,
        incremental: false,
      });
      content.value = "# A\n\n[docs]\n\n## B\n\n[docs]: https://x\n\n";
      await nextTick();
      expect(core.sections.value).toBeNull();
      streamingRef.value = {
        hasNextChunk: true,
        incremental: { minSectionChars: 0 },
      };
      await nextTick();
      content.value += "## C\n\nend\n\n";
      await nextTick();
      // The definition streamed before the switch; a boundary after it would
      // orphan the reference, so no boundary may exist at all.
      expect(core.sections.value).toBeNull();
      scope.stop();
    });

    it("records boundaries from where incremental was switched on, not retroactively", async () => {
      const { scope, content, streamingRef, core } = createCore({
        hasNextChunk: true,
        incremental: false,
      });
      content.value = "# A\n\npara\n\n## B\n\nmore\n\n";
      await nextTick();
      streamingRef.value = {
        hasNextChunk: true,
        incremental: { minSectionChars: 0 },
      };
      await nextTick();
      content.value += "## C\n\nend\n\n";
      await nextTick();
      // ## B streamed while off, so only the ## C boundary exists: the first
      // section is bigger, but still a valid lossless split.
      expect(core.sections.value).toEqual([
        "# A\n\npara\n\n## B\n\nmore\n\n",
        "## C\n\nend\n\n",
      ]);
      scope.stop();
    });
  });

  describe("work skipped for finished sections", () => {
    const doc = Array.from({ length: 6 }, (_, i) =>
      [
        `## Section ${i}`,
        "",
        `Paragraph ${i}.`,
        "",
        "```js",
        `const s${i} = ${i};`,
        "```",
        "",
      ].join("\n"),
    ).join("\n");

    function extractText(nodes: VNode[]): string {
      return nodes
        .map(node => {
          const children = node.children;
          if (typeof children === "string") return children;
          if (Array.isArray(children)) return extractText(children as VNode[]);
          return "";
        })
        .join("");
    }

    const streamIn = async (
      incremental: boolean,
      onRender: (children: string) => void,
    ) => {
      const code = defineComponent({
        name: "CodeCounter",
        inheritAttrs: false,
        setup(_, { slots }) {
          return () => {
            const text = extractText(slots.default?.() ?? []);
            onRender(text);
            return h("code", {}, text);
          };
        },
      });
      // Like every memo in XMarkdown, sections rely on `components` (and
      // `config`, `streaming`, …) keeping the same identity across renders.
      const components = { code };
      const streaming = incremental
        ? { hasNextChunk: true, incremental: noMin }
        : { hasNextChunk: true };
      const wrapper = mount(XMarkdown, {
        props: { content: "", streaming, components },
      });
      for (let i = 10; i < doc.length; i += 10) {
        await wrapper.setProps({ content: doc.slice(0, i) });
        await nextTick();
      }
      await wrapper.setProps({ content: doc });
      await nextTick();
      return wrapper;
    };

    it("does not re-render custom components in earlier sections", async () => {
      const count = async (incremental: boolean) => {
        const renders: Record<string, number> = {};
        await streamIn(incremental, children => {
          renders[children] = (renders[children] ?? 0) + 1;
        });
        return renders;
      };
      const whole = await count(false);
      const sectioned = await count(true);
      // The first block's final text (downstream trims the trailing newline
      // that upstream's React renderer keeps). Every render at this value
      // happened after the block finished streaming, i.e. was pure re-render
      // work caused by later chunks.
      const finalText = "const s0 = 0;";
      // Without sections the first code block re-renders on every chunk of the
      // whole document; with sections it stops once its section has closed.
      expect(whole[finalText]).toBeGreaterThan(20);
      expect(sectioned[finalText]).toBeLessThan(9);
      const total = (r: Record<string, number>) =>
        Object.values(r).reduce((a, b) => a + b, 0);
      expect(total(sectioned) * 3).toBeLessThan(total(whole));
    }, 30000);

    it("does not re-render finished sections when a fresh inline streaming literal carries animationConfig", async () => {
      // An inline `:streaming="{ hasNextChunk, animationConfig: { ... } }"`
      // literal is a new object on every parent render. Only a change to the
      // options the renderer actually reads may invalidate the sections.
      const streamingOf = (): StreamingOption => ({
        hasNextChunk: true,
        incremental: noMin,
        animationConfig: { splitBy: "sentence" },
      });
      const renders: Record<string, number> = {};
      const code = defineComponent({
        name: "CodeCounter",
        inheritAttrs: false,
        setup(_, { slots }) {
          return () => {
            const text = extractText(slots.default?.() ?? []);
            renders[text] = (renders[text] ?? 0) + 1;
            return h("code", {}, text);
          };
        },
      });
      const wrapper = mount(XMarkdown, {
        props: { content: "", streaming: streamingOf(), components: { code } },
      });
      for (let i = 10; i < doc.length; i += 10) {
        await wrapper.setProps({
          content: doc.slice(0, i),
          streaming: streamingOf(),
        });
        await nextTick();
      }
      await wrapper.setProps({ content: doc, streaming: streamingOf() });
      await nextTick();
      // The first section closed early; re-parsing it per parent render would
      // show up here as its code block re-rendering with every later chunk.
      const finalText = "const s0 = 0;";
      expect(renders[finalText]).toBeLessThan(9);
    }, 30000);

    it("re-renders the whole document at the end with keepSectionsOnEnd: false", async () => {
      const streaming = {
        hasNextChunk: true,
        incremental: { ...noMin, keepSectionsOnEnd: false },
      };
      const scope = effectScope();
      const content = ref(doc);
      const streamingRef = ref<StreamingOption>(streaming);
      let core!: StreamingResult;
      scope.run(() => {
        core = useStreamingCore(content, streamingRef);
      });
      await nextTick();
      expect(core.sections.value).toHaveLength(6);
      streamingRef.value = { ...streaming, hasNextChunk: false };
      await nextTick();
      expect(core.output.value).toBe(doc);
      expect(core.sections.value).toBeNull();
      scope.stop();

      const wrapper = mount(XMarkdown, {
        props: { content: doc, streaming },
      });
      await nextTick();
      await wrapper.setProps({
        streaming: { ...streaming, hasNextChunk: false },
      });
      await nextTick();
      const plain = mount(XMarkdown, { props: { content: doc } });
      await nextTick();
      expect((wrapper.element as HTMLElement).innerHTML).toBe(
        (plain.element as HTMLElement).innerHTML,
      );
    });

    it("keeps sections after the stream ends so custom components are not remounted", async () => {
      let mounts = 0;
      const code = defineComponent({
        name: "CodeMountCounter",
        inheritAttrs: false,
        setup(_, { slots }) {
          onMounted(() => {
            mounts += 1;
          });
          return () => h("code", {}, slots.default?.());
        },
      });
      const streaming = { hasNextChunk: true, incremental: noMin };
      const wrapper = mount(XMarkdown, {
        props: { content: doc, streaming, components: { code } },
      });
      await nextTick();
      expect(mounts).toBe(6);
      await wrapper.setProps({
        streaming: { hasNextChunk: false, incremental: noMin },
      });
      await nextTick();
      expect(mounts).toBe(6);
      const plain = mount(XMarkdown, {
        props: { content: doc, components: { code } },
      });
      await nextTick();
      expect((wrapper.element as HTMLElement).innerHTML).toBe(
        (plain.element as HTMLElement).innerHTML,
      );
    });
  });
});

describe("streaming option identity", () => {
  it("does not re-run the pipeline when an inline streaming literal is rebuilt with equal values", async () => {
    const scope = effectScope();
    const content = ref("# A\n\npara\n\n## B\n\nmore\n\n");
    const rebuild = ref(0);
    // Mimics an inline `:streaming="{ hasNextChunk, incremental: {...} }"`:
    // every parent render produces a fresh object holding the same values.
    const streamingRef = computed<StreamingOption>(() => {
      void rebuild.value;
      return { hasNextChunk: true, incremental: { minSectionChars: 0 } };
    });
    let core!: StreamingResult;
    scope.run(() => {
      core = useStreamingCore(content, streamingRef);
    });
    await nextTick();
    const before = core.sections.value;
    expect(before).toHaveLength(2);
    rebuild.value++;
    await nextTick();
    // A re-run would rebuild the sections array; identical values must not
    // trigger one (each run is O(N) over the whole stream).
    expect(core.sections.value).toBe(before);
    scope.stop();
  });
});

describe("streaming tail", () => {
  it("does not remount the tail component when inline literals rebuild around it", async () => {
    let mounts = 0;
    const Tail = defineComponent({
      name: "TailCounter",
      setup() {
        onMounted(() => {
          mounts += 1;
        });
        return () => h("span", { class: "my-tail" }, "…");
      },
    });
    const content = ref("");
    const wrapper = mount(
      defineComponent({
        setup() {
          // Inline literals: both objects are recreated on every render, like
          // a template written as `:streaming="{...}" :components="{}"`.
          return () =>
            h(XMarkdown, {
              content: content.value,
              streaming: { hasNextChunk: true, tail: { component: Tail } },
              components: {},
            });
        },
      }),
    );
    for (const chunk of [
      "# A\n\nhello ",
      "world ",
      "again ",
      "and again\n\n",
    ]) {
      content.value += chunk;
      await nextTick();
    }
    expect(wrapper.find(".my-tail").exists()).toBe(true);
    expect(mounts).toBe(1);
    wrapper.unmount();
  });
});

describe("hasUnclosedRawTags", () => {
  it("detects an unclosed container and accepts a closed one", () => {
    expect(hasUnclosedRawTags('<div align="center">\n\ntext')).toBe(true);
    expect(hasUnclosedRawTags("<div>\n\ntext\n\n</div>")).toBe(false);
    expect(hasUnclosedRawTags("<details>\n\n<summary>s</summary>")).toBe(true);
    expect(hasUnclosedRawTags("<table>\n\n<tr>\n\n<td>x</td>")).toBe(true);
  });

  it("ignores an open <p>: the HTML parser closes it when a heading starts", () => {
    expect(hasUnclosedRawTags("<p>\n\ntext")).toBe(false);
    expect(hasUnclosedRawTags("<p>\n\n<div>")).toBe(true);
  });

  it("ignores tags inside fenced and inline code", () => {
    expect(hasUnclosedRawTags("```\n<div>\n```")).toBe(false);
    expect(hasUnclosedRawTags("  ```jsx\nconst x = <div>\n  ```")).toBe(false);
    expect(hasUnclosedRawTags("```cpp\n#include <vector>\n```")).toBe(false);
    expect(hasUnclosedRawTags("wrap it in a `<div>` here")).toBe(false);
    // …but the container stays tracked across the fenced block.
    expect(hasUnclosedRawTags("<div>\n\n```\ncode\n```\n\ntext")).toBe(true);
    expect(hasUnclosedRawTags("<div>\n\n```\n</div>\n```")).toBe(true);
    expect(hasUnclosedRawTags("<div>\n\n```\ncode\n```\n\n</div>")).toBe(false);
  });

  it("does not mistake autolinks, stray closers, void or self-closing tags for containers", () => {
    expect(hasUnclosedRawTags("see <https://x.ant.design> now")).toBe(false);
    expect(hasUnclosedRawTags("</div>")).toBe(false);
    expect(hasUnclosedRawTags('<br> and <img src="x"> and <hr>')).toBe(false);
    expect(hasUnclosedRawTags("<div/>")).toBe(false);
  });

  it("handles misnesting like the HTML parser: closing a container closes what is inside it", () => {
    expect(hasUnclosedRawTags("<div><span></div>")).toBe(false);
    expect(hasUnclosedRawTags("<div><span>text")).toBe(true);
    expect(hasUnclosedRawTags("<div><div></div>")).toBe(true);
  });

  it("vetoes on an unterminated tag or comment (the browser swallows what follows)", () => {
    expect(hasUnclosedRawTags('<div class="')).toBe(true);
    expect(hasUnclosedRawTags("<!-- open")).toBe(true);
    expect(hasUnclosedRawTags("<!--\n\n# x\n\n-->")).toBe(false);
    expect(hasUnclosedRawTags("<!-- a --> b <!--")).toBe(true);
  });

  it("does not treat '</ div>' (whitespace after the slash) as a closing tag", () => {
    // Per the HTML spec '</' followed by a non-letter is a bogus comment that
    // closes nothing, so the <div> is still open.
    expect(hasUnclosedRawTags("<div>\n\n</ div>\n\ntext")).toBe(true);
    // …while whitespace between the name and '>' is allowed.
    expect(hasUnclosedRawTags("<div>\n\n</div >\n\ntext")).toBe(false);
  });

  it("does not treat a backslash as an escape inside quoted attribute values", () => {
    // HTML has no escape mechanism: the value ends at the quote right after
    // the backslash, so the tag is complete and the container closes later.
    expect(hasUnclosedRawTags('<div title="C:\\">text</div>')).toBe(false);
    expect(hasUnclosedRawTags('<div title="C:\\">text')).toBe(true);
  });

  it("keeps an inline code span across a newline, so a </tag> inside it closes nothing", () => {
    // CommonMark code spans may contain line endings within one paragraph:
    // the </span> below is code content, so the real <span> is still open.
    expect(hasUnclosedRawTags("<span>\n\npara `code\n</span>\ncode` end")).toBe(
      true,
    );
    // …but a blank line ends the paragraph and with it the span.
    expect(hasUnclosedRawTags("<span>\n\npara `code\n\n</span>\n")).toBe(false);
  });

  it("treats a backtick run with no equal-length closer as literal text", () => {
    // The fuzz-found case: a bare ``` line has no closing run, so it is
    // literal, and the <div> right after it is a real element — assuming the
    // run opened a span would hide the container from this guard.
    expect(hasUnclosedRawTags("para\n    ```\n<div>\n")).toBe(true);
    expect(hasUnclosedRawTags("para ``` and <div>")).toBe(true);
    expect(hasUnclosedRawTags("para `code` and <div>")).toBe(true);
    // A run that does have an equal-length closer hides only what is between.
    expect(hasUnclosedRawTags("para ``` <div> ``` end")).toBe(false);
    expect(hasUnclosedRawTags("para ``` <div> `` end")).toBe(true);
  });

  it("does not pair a line-leading backtick run into a span across blocks", () => {
    // `    ``` ` is an indented code block, not the opener of a paragraph's
    // inline span: pairing the two runs would skip the lines between and hide
    // the <pre> and the fact that a second <pre> is never closed.
    expect(
      hasUnclosedRawTags(
        "    ```\n<pre>\n    ```\n<pre>\n```sh\n  ```\n</pre>\n",
      ),
    ).toBe(true);
    // A run that merely *starts* a paragraph line still pairs, as before — the
    // rule only rejects a run that begins its line with three or more ticks.
    expect(hasUnclosedRawTags("para\n`<pre>`\n")).toBe(false);
  });
});
