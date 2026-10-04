# x-markdown: streaming, math and the Vue API mapping

**This is the single record for `packages/x-markdown`.** It was consolidated on
2026-10-04 from `x-markdown-streaming-sections.md`, `x-markdown-latex.md` and
`x-markdown-streaming-preset.md`; every entry from those files is preserved
below. `memory/upstream-sync.md` (the sync cursor) stays separate.

Read the section that covers what you are about to change, and check that the
change does not undo a decision recorded there.

- **1. `streaming.incremental` section boundaries** — the contract, our
  divergences from `ant-design/x`, the upstream bugs we fix, remaining limits.
- **2. LaTeX plugin and `$` / `$$` / `\[` math** — what is synced, what was
  missed, how the splitter treats math.
- **3. Streaming preset, typewriter and the Vue API mapping** — the
  downstream-only fixes and the Vue API translation.

## 1. `streaming.incremental` section boundaries

**Files:** `packages/x-markdown/src/XMarkdown/composables/useStreaming.ts`
(`trackSectionBoundary` and the `DESIGN CONTRACT` comment above it),
`packages/x-markdown/src/XMarkdown/interface.ts` (`SectionState`, the
`incremental` JSDoc).
**Upstream counterpart:** `ant-design/x` -> `packages/x-markdown/src/XMarkdown/hooks/useStreaming.ts`.
**Origin:** port of `ant-design/x` PR #2061 (upstream commit `8b76d6a`),
landed downstream as `0703ba2`; tracked in issue #225.

### The invariant

While streaming, rendering the sections must produce **exactly** the
whole-document DOM at every point of the stream (and the same DOM as a plain
one-shot render at the end). A boundary may only be placed before a column-0
ATX heading line, and only when that line really starts a new top-level block.

A boundary placed _inside_ a block that the whole-document parse keeps open
changes the rendered markup (a spurious `<h1>` where the full render has code
or raw text). Placing **no** boundary only costs incremental reuse. So every
ambiguity must resolve to "do not split".

### The decision (2026-10-03): ask marked, do not model it

Rounds 1-9 of review produced downstream-only fixes that grew a hand-written
model of marked's block grammar - list-item continuation, blockquote laziness,
paragraph interruption, setext eligibility, the fenced-code / HTML block
rules, marker widths, tab gaps. It reached ~950 extra lines of interacting
state, and every review round found another input where the model and marked
disagreed. It also meant fixing one case routinely broke another.

That model was **deleted** on 2026-10-03. `probeBoundary` now lexes
the current section with the _renderer's own_ marked instance
(`Parser.lex`, wired in `index.vue`) and answers the only question that
matters: does `prefix + "# x\n"` parse into strictly more top-level blocks
than `prefix`? The tracker keeps only the offsets, a `noSplit` flag, a small
conservative raw-block state, and a bounded memo of refusals.

### Deliberate divergences from upstream's file

Upstream's `trackSectionBoundary` is ~62 lines. Ours is structurally the same
shape, plus:

| #   | Divergence                                                                                                                                                                                                                   | Why                                                                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Boundaries are verified by lexing the section with the renderer's marked (`probeBoundary` + `openBlock` memo + `Parser.lex`)                                                                                                 | Upstream's char-level fence scanner is blind to containers, so it splits wrongly when a fence is reopened at top level after a list item ends (upstream bug #1 below)                       |
| 2   | No `HTML_BLOCK_OPEN` catch-all; HTML blocks are decided by marked                                                                                                                                                            | Upstream's "any `<x` line opens an HTML block until a blank line" is a superset approximation that also _misses_ correct splits (e.g. a PI that closes at `?>` before any blank line)       |
| 3   | Raw-block set extended with `<?` (PI), `<!` (declaration) and `<![CDATA[`                                                                                                                                                    | Their raw text is re-interpreted by the browser/DOMPurify - `<?php` opens a bogus comment that can swallow a following `<h1>` open tag (upstream bug #2)                                    |
| 4   | `$$` math: opener must be exactly `$`/`$$` (no trailing whitespace); closer must sit at column 0 with the same run length, only after a non-empty body                                                                       | Matches the bundled LaTeX plugin's rule `^(\${1,2})\n` / `\n\1`; upstream uses `\s*$` and `line.trim() === close`, which close on indented / longer / trailing-space runs (upstream bug #3) |
| 5   | A candidate `#` line is still checked when the fence scanner believes it is inside a fence (no hard fence gate). Raw-opener detection, by contrast, is gated on the renderer's marked (`lineIsCodeContent`), not the scanner | Upstream returns early whenever `fence.inFenced`, so one mis-detected fence poisons every later split (upstream bug #4)                                                                     |
| 6   | `hasUnclosedRawTags` veto (upstream only has `detectUnclosedComponentTags`)                                                                                                                                                  | An unclosed `<div>` is auto-closed by DOMPurify at the section end, which changes the DOM shape                                                                                             |
| 7   | The tracker state machine runs even when `incremental` is off (`record` gates only the recording); upstream skips it entirely                                                                                                | Keeps definitions / raw-block state / line starts correct when `incremental` is switched on mid-stream                                                                                      |
| 8   | One trailing `\r` is stripped before the line classifiers                                                                                                                                                                    | CRLF documents                                                                                                                                                                              |
| 9   | Definitions are decided from marked's `links` map (sticky `]:` gate + a whole-text probe on every pass that has recorded a boundary)                                                                                         | Upstream's `DEFINITION_LINE` latch misses a definition indented into a list item and stops all reuse for the rest of the stream (see the follow-up entries)                                 |

### Upstream bugs we deliberately fix

Each of these is a case where upstream's tracker records a boundary that the
whole-document render does not have. **Do not "align" these away** - the
covering tests fail on purpose.

| #   | Repro (as a document)                                                | Ground truth                                                                                                                               | Upstream                                                                                          | Ours                                | Test                                                                                                                   |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | `# A\n\n- one\n\n  ```ts\nx.y();\n  ```\n\n## after\n\nmore\n`       | The column-0 body line ends the item and its fence; the indented "closing" line opens a **new** top-level fence, which swallows `## after` | Splits before `## after` -> spurious heading                                                      | No split                            | corpus `listIndentedFence`, guard "does not split on a heading swallowed by the fence a dedenting list fence re-opens" |
| 2   | `</div>\n<?php\n\n# in pi\n\n?>\n\n## after\n`                       | `<?php` runs to `?>`; DOMPurify/browser swallow the `<h1>` open tag                                                                        | Splits before `# in pi` -> different DOM                                                          | No split until the PI closes        | corpus `piAfterHtmlBlock`, `rawBlockStackedInHtmlBlock`                                                                |
| 3   | `$$\nx\n  $$\n\n## B\n\ntail`                                        | The plugin's closer must be at column 0 with the opening run's length                                                                      | Closes the block -> splits                                                                        | No split                            | guard "closes $$ math only at a column-0 delimiter and splits after it"                                                |
| 4   | `- ```ts\n  code\n  ```\n\n## B\n`                                   | The fence is inside the item and closes there; the "closing" line is not a new opener                                                      | The scanner opens a fence on the closing line and never closes it -> **no further splits at all** | Splits at `## B`                    | corpus `fenceOnMarkerLine`                                                                                             |
| 5   | `<div align="center">\n\ntext...\n\n# Title\n\n</div>\n\n## After\n` | The `<div>` is only closed after the heading                                                                                               | Splits inside the container -> DOMPurify auto-closes it                                           | No split until the container closes | guard "does not split while a raw HTML container is open, but angle brackets in code do not veto"                      |

### Remaining limits (accepted)

- `$$` / `\[` math is tracked with a hand-written rule, because the plugin's
  block rule only matches once its **closing** delimiter is present - a
  prefix-based lex cannot see the block at all. Without the plugin registered
  these lines are plain text and the rule is merely conservative.
- A custom marked extension whose block rule also requires its closer (e.g.
  `:::note ... :::`) cannot be seen by a prefix lex, so a `#` line inside it
  may split. Documented: turn `incremental` off when using extensions with
  document-wide state. If this bites, extend the same way math is handled.
- Refusals are memoised for up to `OPEN_BLOCK_MEMO_CHARS` (4096) bytes, so a
  split may be lost right after an open block closes. Losing a split is safe.
  The memo is dropped by the lines that can end the block that caused it (a
  blank line, a line containing `</`) and by a change in the fence scanner's
  verdict; only a refusal caused by an unclosed _fenced code block_ survives
  blank lines (see the memo entry below).
- A raw-opener-shaped line (`$$`, `$`, `\[`, `<pre|script|style|textarea`,
  `<?`, `<!`, `<!--`) outside an open raw block costs two whole-prefix lexes
  (`lineIsCodeContent`), because the char-level fence scanner cannot see a
  fence nested inside a list item and a mis-detected fence there would hide a
  real `$$` block. A document whose code body is full of such lines therefore
  pays O(prefix) per line, with `incremental` off as well. The fix is to derive
  "is this line code body" from one token walk of the current prefix (marked's
  tokens carry `raw`), not to relax the question.
- The definition probe costs one whole-text lex per pass that has recorded a
  boundary, while the `]:` gate is armed and no definition has been found yet
  (a document with `]:` lines but no real definition, streamed in many chunks,
  is the worst case). It cannot be bounded by a line count — see the entry
  below — and a real definition latches `noSplit`, after which it is free.

### Review follow-ups

#### 2026-10-04: a raw opener inside a fenced code block is code, not a block

- **Repro:** `# A\n\npara\n\n```sh\n$$\necho hi\n```\n\n## B\n\nb\n\n## C\n\nc\n`
  (an unpaired `<!--`, a `<pre>` / `<?` without its closer, or a fence nested
  in a list item behave the same).
- **Ground truth:** the `$$` / `<!--` line is fenced-code body, so it is not a
  raw opener; `## B` / `## C` are top-level headings and split normally.
- **Upstream behaviour:** upstream's tracker returns early whenever its char
  fence scanner says `inFenced`, so it never sees these lines — but for the
  wrong reason: its scanner is blind to fences nested in list items.
- **Our behaviour (before this fix):** the raw-opener detection ran on every
  line (the hard fence gate had been removed for the _heading_ check), so a
  raw-opener-shaped line in fence body opened a `state.rawBlock` whose closer
  is ordinary code text. It never closed, every later heading was suppressed,
  and `sections` fell back to `null` — a lost incremental reuse, the rendered
  DOM stayed correct.
- **Decision:** before opening a raw block, ask the renderer's marked whether
  the line is code body (`lineIsCodeContent`: appending the line must grow the
  recursive code-token content). Do **not** re-introduce the char scanner as
  the gate — a mis-detected fence would hide a real `$$` block that a prefix
  lex cannot see.
- **Covering test:** corpus `rawOpenerInFence` (per-character whole-vs-sectioned
  DOM equivalence) and the guard "does not treat a raw opener inside a fenced
  code block as a raw block".

#### 2026-10-04: a definition-shaped line in code or a raw block is not a definition

- **Repro:** `# A\n\npara\n\n# B\n\n```markdown\n[a]: /x\n```\n\n# C\n\ntail\n`
  (the same line inside `$$` math, an HTML comment, or `<pre>` behaves the
  same).
- **Ground truth:** marked extracts no link reference definition from fence
  body, math body or comment body — those lines never yield a `def` token, and
  a later `[a]` reference cannot resolve to them.
- **Upstream behaviour:** upstream's fence gate returned before its
  definition check, so fence body never reached it.
- **Our behaviour (before this fix):** `DEFINITION_LINE` ran before the
  raw-block branch and without a code gate, so such a line set `noSplit = true`
  and discarded the recorded offsets — sections collapsed to `null` mid-stream
  and the rest of the document never split again. Lost reuse only; the rendered
  DOM stayed correct.
- **Decision:** the raw-block branch consumes its body first (order restored),
  and a fence-body line is confirmed with `lineIsCodeContent` before it may set
  `noSplit`. A definition-shaped line inside a type-6 HTML block (`<div>`,
  `<table>`, …) still sets `noSplit` — marked parses no definition there
  either, so that refusal is over-conservative; it is safe (lost reuse only)
  and left as-is rather than growing another hand-written block model.
- **Covering test:** guard "does not disable splitting for a definition-shaped
  line inside a fence or a raw block" (plus the existing "drops all boundaries
  once a reference or footnote definition appears" / nested-definition tests,
  which pin the real-definition path).

#### 2026-10-04: the definition decision is asked of marked, not of the line's position

Supersedes the entry above, which fixed one direction (definitions wrongly
refusing inside code/raw bodies) and opened the other (real definitions wrongly
ignored).

- **Repro:** `# A\n\nsee [a]\n\n# B\n\n$$\n\n[a]: /x\n` (an unclosed `$$` or
  `\[`; the same with or without the bundled Latex plugin registered).
- **Ground truth:** an unclosed `$$` is an ordinary paragraph, so `[a]: /x` is
  a real link reference definition. marked's `links` map contains `a`, the line
  is not inside any open block, and the whole-document render resolves
  `see [a]`.
- **Upstream behaviour:** upstream checks `DEFINITION_LINE` _after_ its
  raw-block branch, so the conservative raw-block state swallows the line and
  the definition is missed; upstream places the boundary and renders `see [a]`
  as literal text. An inherited upstream bug we now fix (upstream's `links`
  map is not consulted at all).
- **Our behaviour (before this fix):** same as upstream after the `fba2f90`
  reorder — the sectioned render emitted `[a]` where the whole render emitted
  `<a href="/x">a</a>`. That is a **wrong boundary**, not a lost split, so
  neither the "refuse is always safe" rule nor the "check whether the
  whole-document render keeps the line inside an open block" rule covers it.
- **Decision:** the definition check now runs _ahead of every block state_ and
  asks the renderer's marked for its `links` map. Nothing a raw-block branch
  consumes can hide a definition, and a definition-shaped line inside a fence,
  comment, `<pre>` or real math body cannot fake one. A `definitionLookahead`
  window (3 lines, cleared by a blank line, since a definition never spans one)
  picks up definitions whose destination/title sits on a later line.
- **Why this closes the class:** link/footnote definitions are the only
  document-global "must refuse" condition. Deciding them from marked instead of
  from the line's position removes the ordering dependence between that
  condition and the over-approximating block state, so adding future raw
  openers can no longer re-open it. It also supersedes the older note that a
  definition-shaped line inside a type-6 HTML block refuses conservatively:
  marked extracts no definition there, so the line no longer refuses and the
  reuse is kept.
- **Covering test:** guard "asks marked, not the line position, whether the
  document has a definition" and corpus `definitionAfterUnclosedMath`
  (per-character whole-vs-sectioned DOM equivalence).

#### 2026-10-04: the definition trigger must be a sound over-approximation

Found while reviewing the entry above; same date, supersedes its trigger.

- **Repro:** `# A\n\nsee [a]\n\n# B\n\n- item\n\n    [a]: /x\n` (also with a
  `1.` marker and five spaces, or a tab instead of four spaces).
- **Ground truth:** marked collects the definition — the label line is
  indented into the list item's content, not four spaces of code — so
  `see [a]` resolves in the whole-document render.
- **Our behaviour (before this fix):** the marked probe was gated on the old
  `DEFINITION_LINE = /^ {0,3}.../` test, which only allows the leading
  whitespace of a _top-level_ definition. A definition indented past three
  columns inside a list item never triggered the probe, so the definition was
  missed and the sectioned render emitted `[a]` where the whole render emitted
  `<a href="/x">a</a>` — a wrong boundary. (Upstream has the same pattern, and
  an earlier revision used `DEFINITION_LINE` as the _decider_, so this hole is
  older than the marked probe.)
- **Decision:** the trigger is a _sound over-approximation_ whose only job is
  to keep the `lex` off the per-line path — the label terminator `]:`, which
  every definition's label line contains. A false positive costs one marked
  `lex`; a false negative would be a wrong boundary, so it must not be made
  more specific than that. The decider stays marked.
- **Covering test:** guard "asks marked, not the line position, whether the
  document has a definition" (indented cases) and corpus
  `definitionIndentedInList` (per-character whole-vs-sectioned DOM
  equivalence).

#### 2026-10-04: the raw-container veto must not pair a line-leading backtick run

Found by the 1000-document differential fuzz (1 failure); unrelated to the
definition work — that input contains no `]:`, so `trackDefinition` is inert.

- **Repro:** `    ```\n<pre>\n    ```\n<pre>\n```sh\n  ```\n</pre>\n# B\n~~~`.
- **Ground truth:** the browser keeps the outer `<pre>` open — line 4 opens a
  second `<pre>` and line 7's `</pre>` closes only that inner one — so the
  whole-document render nests `<h1>B</h1>` inside the still-open `<pre>`, while
  a split before `# B` puts it outside. A boundary there is a wrong boundary.
- **Our behaviour (before this fix):** `hasUnclosedRawTags`
  (`core/detectUnclosedComponentTags.ts`) resolves backtick runs as inline code
  spans with lookahead. The two `    ``` ` lines are an _indented code block_,
  not a paragraph's span, but the span resolution paired them across the
  `<pre>` between them and skipped it: only one `<pre>` was counted, the
  `</pre>` emptied the stack, and the veto passed. The tracker's raw-block
  state is single-level, so it cannot see the nesting either — this veto is the
  only guard, and it failed.
- **Decision:** a run of three or more backticks that _begins its line_ is
  block-level code, never an inline-span opener, so only the run itself is
  skipped and the lines after it stay visible to the tag scan. The change is
  one-directional — it can only make more text visible, so it can only add
  vetoes (refusals), never remove them. Cross-line spans inside a paragraph
  still pair, as the existing code-span test requires.
- **Covering test:** `hasUnclosedRawTags` "does not pair a line-leading
  backtick run into a span across blocks" and the boundary guard "does not
  split out of a nested raw container the tag scan must see".

#### 2026-10-04: the definition probe must not be bounded by a line count

Supersedes the `definitionLookahead` window (3 lines, cleared by a blank line)
in "the definition decision is asked of marked, not of the line's position",
and that entry's premise that a definition never spans a blank line.

- **Repro:** `# A\n\nsee [a]\n\n# B\n\n[a]:\n/url "t1\nt2\nt3\nt4\nt5"\n`, and
  the same with a blank line inside the title
  (`'# A\n\nsee [a]\n\n# B\n\n[a]:\n/url "t1\n\nt2"\n'`).
- **Ground truth:** marked (16.4.2, verified) accepts a link-reference title
  spanning any number of lines — blank lines included — and only adds the
  definition to its `links` map once the closing quote has arrived. The
  definition completes on a line the window had already left.
- **Upstream behaviour:** upstream latches on `DEFINITION_LINE` for the rest of
  the stream (sound but lossy: any `]:` line kills incremental reuse).
- **Our behaviour (before this fix):** the window expired before the title
  closed, `noSplit` was never set, and the boundary before `# B` survived:
  section 1 rendered `see [a]` where the whole render emitted a link — a wrong
  boundary, and a regression against upstream's latch.
- **Decision:** no window at all. The sticky `]:` gate (sound
  over-approximation, entry above) decides only whether to ask; the question is
  asked of marked on the whole accumulated text, once per pass, and `noSplit`
  discards any offsets already recorded, so a late yes still collapses the
  sections. The probe is deferred further, to passes that have recorded a
  boundary: with no boundary `sections` is null whatever the answer, and by the
  end of the pass the offsets include every boundary recorded in it, so a
  boundary that is about to be used was always covered by a probe on the text
  that contains it.
- **Covering test:** guard "keeps asking marked while a definition can still
  complete"; its last assertion pins that a title that never closes is _not_ a
  definition, so the boundaries stay.

#### 2026-10-04: the raw-container veto's backtick guard is not one-directional

Supersedes "the raw-container veto must not pair a line-leading backtick run",
whose claim "it can only make more text visible, so it can only add vetoes,
never remove them" is false: the guard skipped text that upstream's scanner
still scanned, so on `<div>`-shaped inputs upstream vetoed and the branch split.

- **Repro:** `hasUnclosedRawTags("<div>\n\n    ```\n    </div>\n    ```\n")` —
  upstream `true`, branch `false` (a branch regression); and
  `hasUnclosedRawTags("```foo``` <div> ```\n")` — upstream `false`, branch
  `true` before the line classifier learned the info-string rule. In both, the
  whole-document render nests a later `<h1>` inside the still-open `<div>`, so
  a boundary there changes the DOM.
- **Ground truth (all verified against marked, not from memory):** a run of
  three or more backticks indented four columns is an _indented code block_,
  whose body the browser never sees; a line-leading backtick run whose info
  string contains a backtick is not a fence at all (` ```foo``` ` is a
  paragraph with an inline code span, and the `<div>` after it is real HTML); a
  line beginning with a type-6 tag interrupts a paragraph, so a paragraph's
  opening backtick run cannot pair with a backtick after such a tag; the
  self-closing slash is ignored on non-void HTML elements, so `<div/>` opens a
  `<div>` nothing closes; and an uppercase-spelled tag is deleted wholesale by
  `protectCustomTags` before the renderer parses.
- **Our behaviour (before this fix):** the guard skipped every line-leading
  run — including the second of two runs on one line, making the _third_ pair —
  so the veto missed containers, and the self-closing/uppercase shapes were not
  containers at all. The self-closing and type-6-interruption holes are
  pre-existing (upstream has them); the indented-run and info-string holes came
  with this branch.
- **Decision:** classify a line-leading run the way the tracker's fence scanner
  does (`classifyRawScanLine`: at least three markers, at most three spaces of
  indent, no backtick in a backtick fence's info string). A run indented four
  columns starts an indented code block, and the block is skipped (first line
  plus blank-or-indented ones); a tilde run is always skipped (it has no span
  semantics); otherwise the ordinary span pairing applies, and its lookahead
  stops only at a blank line or at a line beginning with a tag from CommonMark's
  type-6 list (plus `pre`/`script`/`style`/`textarea` as openers) — derived by
  asking marked, not at every `<`. The container stack pushes uppercase tags and
  non-void self-closing ones.
- **Covering test:** `hasUnclosedRawTags` cases for the indented run, the
  info-string backtick, type-6 interruption, the self-closing slash and
  uppercase tags; corpora `indentedCodeBlockHoldsCloser`,
  `backtickInfoStringWithTag`, `backtickSpanAcrossHtmlBlock`,
  `selfClosingNonVoidTag` (per-character whole-vs-sectioned DOM equivalence).

#### 2026-10-04: the splitter's oracle lexes the text the renderer parses

- **Repro:** with `escapeRawHtml: true`,
  `# A\n\nsee [a]\n\n<filler>\n\n# B\n\n<pre>\n\n[a]: /x\n\n</pre>\n\n# C\n\ntail\n`
  (the escaped `<pre>` is text, so the definition is live); and with
  `protectCustomTags` (the default) a `#` line inside a `<BR>…</BR>` region
  (the renderer deletes the region, so the line is not a heading).
- **Ground truth:** `parse()` runs `protectCustomTags` and then
  `escapeRawHtml` before marked sees the source, so a lex of the raw source asks
  marked about a different document — the two answers can disagree, which is the
  one thing the oracle must never do.
- **Our behaviour (before this fix):** `Parser.lex` lexed the raw source, so
  with `escapeRawHtml` the definition stayed hidden inside an HTML block, the
  boundary was placed, and section 1 rendered `see [a]` where the whole render
  emitted a link (a branch regression: upstream's line-regex rule latched on the
  `]:` line regardless). The `protectCustomTags` direction was pre-existing.
- **Decision:** one `preprocess` shared by `parse` and `lex`. Each section is
  still preprocessed on its own before it is rendered — the corpora compare that
  against the whole-document render, and the region can only be deleted when it
  is complete.
- **Covering test:** guard "asks marked about the same preprocessed text the
  renderer parses" (both option sets), the DOM test "matches with a definition
  that only escapeRawHtml makes live", and corpus `protectedCustomTagRegion`.

#### 2026-10-04: the refusal memo is bounded by what can end the block

Found by review: one cost regression and one lost split, both in the heading
memo (`state.openBlock`).

- **Repro (cost):** a fenced block of 300 column-0 `#` lines separated by blank
  lines (a shell/YAML snippet) re-lexed the whole prefix twice per line — 570
  lexes for 4.4 KB, quadratic in the block, because every blank line dropped the
  memo. Upstream's char-fence gate made this case free.
- **Repro (lost split):** `# A\n\n<pre>\n\n</pre >\n# x\n</pre>\n## B\n\n` — the
  raw-block tracker's close check is deliberately loose (`</pre…` counts as the
  closer), so the tracker is already outside the block when `# x` arrives, the
  oracle refusal there is memoised, and the memo then swallowed `## B` although
  `</pre>` had ended the block. Upstream (whose close check requires `>`) kept
  the split.
- **Ground truth:** a fenced code block's body may contain blank lines and
  closing-tag-shaped text; an HTML block and a table end at a blank line; a
  type-1 raw block ends at its closing tag.
- **Decision:** the memo records whether the refusal was caused by an unclosed
  fenced code block (`probeBoundary` reads marked's last top-level token — a
  fenced `code` token — which is also where the probe's two lexes are now
  interpreted). Only such a memo survives a blank line; any memo is dropped by a
  blank line, by a line containing `</`, and by a change in the fence scanner's
  verdict. `memo.sectionStart` is gone: `offsets` only changes together with
  clearing the memo, so a live memo always belongs to the current section. The
  scanner's `inFenced` cannot stand in for `fenceCause`: it is over-eager for a
  fence inside a list item, where the block marked really swallowed the heading
  with is not the fence at all.
- **Covering test:** guard "memoises a refused heading across the blank lines
  inside a fence" (asserts the lex count; red at 122 calls without
  `fenceCause`), guard "keeps a closing-tag lookalike from ending a raw block
  early or losing a later split" (the `</pre >` case), and corpus
  `twoSpaceWsOnlyStartsList`, whose fence lives in a list item.

### How it is verified

- `packages/x-markdown/src/XMarkdown/__tests__/incremental.test.ts`: per
  character whole-vs-sectioned DOM equivalence over the corpora, plus boundary
  guards. Its "does not split" assertions are the specification.
- Differential fuzz: feed random documents built from mixed
  heading/fence/list/quote/HTML/math/tab lines one character at a time and
  compare sectioned vs whole render at every step. 800 documents x 2 seeds
  produced 0 divergences on 2026-10-03.

### Do not

- Do not re-add a hand-written model of marked's block grammar to make one
  input split again. If a split is missing, the fix is to improve how we _ask_
  marked (or to accept the refusal), never to predict it ourselves.
- Do not "align" the divergences above back to upstream without reading this
  file: they are upstream bugs, not porting mistakes.

## 2. LaTeX plugin and `$` / `$$` / `\[` math

**Files:** `packages/x-markdown/src/plugins/Latex/index.ts`,
`packages/x-markdown/src/plugins/Latex/__tests__/index.test.ts`, the theme
rules for `.inline-katex` / `.block-katex`
(`packages/x-markdown/src/XMarkdown/index.css` and the two `themes/index.css`
copies).
**Upstream counterpart:** `ant-design/x` -> `packages/x-markdown/src/plugins/Latex/`.
**Splitter side:** how the streaming section tracker treats math is recorded in
section 1 of this file (divergence #4 and remaining limit #1).

### Synced (aligned)

- **Currency is not math** - upstream `fix(markdown): avoid parsing currency as
LaTeX` (#1997 line) plus `allow escaped dollar signs inside inline formulas`.
  Downstream commit `c463ec1`. The plugin implements Pandoc's single-dollar
  rules in `isValidInlineDollarMatch`: `$12, $20` and `$ x $` are not math,
  `$$...$$` is exempt, and `\$` inside a formula is not a closing delimiter.
  Covered by the currency / escaped-dollar / single-dollar-rule tests.

### Fixed on 2026-10-03: multi-line `\[...\]` was not ported

Upstream `feat(latex): support render block latex in inline` +
`feat(latex): block latex use span insteadof div` (the `#1859` feat/latex
line, merged 2026-04-12) marks an inline `\[...\]` run whose content spans a
newline as `isBlock` and renders it with `<span class="block-katex">`; a
single-line `\[...\]` stays `<span class="inline-katex">`.

This had **not** been ported: our plugin never emitted `block-katex`, while our
theme already carried `.x-markdown .block-katex { display: block; margin: 1em
0 }` copied verbatim from upstream - a dead rule. Repro (before the fix):
mounting with `config: { extensions: latexPlugin() }` and
`content\n\[\frac{a}{b}\n\]\ncontent` produced `.inline-katex` and no
`.block-katex`, where upstream produces the opposite.

Fixed in the plugin (the newline test must run before `trim()`), with the two
upstream cases added as tests ("should render multi-line `\[..\]` as a
block-level formula", "should still render single-line `\[..\]` as an inline
formula").

### Known gaps to re-check on the next sync

- Our plugin test file is a subset of upstream's (~20 cases). Upstream cases
  without an obvious downstream twin: inline `$$\n...\n$$`, inline
  `\[\n...\n\]`, block `$$...$$` on one line, `align*` replacement, empty
  content, "content without LaTeX", `throwOnError: true`. Verify each on the
  next sync instead of assuming coverage.
- Only upstream commits up to `8b76d6a` are visible in the local clone
  (`.sync-upstream.json` cursor is `8b76d6a`, tag 2.9.0). Anything newer about
  `$` / LaTeX needs a fetch before it can be compared.

### Do not

- Do not "simplify" the plugin to always emit `.inline-katex`; the
  `block-katex` path is upstream behaviour with theme support already in place.
- Do not move math out of the streaming tracker's raw-block state without
  reading why it is there: the plugin's block rule only matches once its
  closing delimiter is present, so a prefix-based marked check cannot see the
  block.

## 3. Streaming preset, typewriter and the Vue API mapping

**Files:** `packages/x-markdown/src/XMarkdown/utils/streaming.ts` (the preset),
`composables/useTypewriter.ts`, `components/AnimationText.vue`,
`components/Section.vue`, `index.vue`.
**Upstream counterpart:** `ant-design/x` -> `hooks/useTypewriter.ts`,
`AnimationText.tsx`, `Section.tsx`, `utils/memo.ts`, `index.tsx`.
**Origin:** port of `ant-design/x` PR #2061 (`8b76d6a`), landed as `7b6b587`
(#226) and `6ea3c9d` (#229).

### Deliberate divergences (not the marked-oracle kind)

Same rule as the rest of this file: these are fixes for real bugs, and a
review that reports them is reporting upstream's behaviour.

| #   | Where                             | Divergence from upstream                                                                                                                          | Why                                                                                                                                                                                                                                                                              |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `utils/streaming.ts` `PRESET`     | adds `animationConfig: Object.freeze({ splitBy: "sentence" })`                                                                                    | `streaming={true}` opens the typewriter while `enableAnimation` defaults to true; with the default `splitBy: "chunk"` every frame's few revealed characters become their own fade-in node, so a long answer accumulates thousands of them. Upstream's preset leaves the default. |
| 2   | `useTypewriter` `scanBoundaries`  | opening / closing fences may be indented 0-3 spaces (`lineIndent`)                                                                                | CommonMark, and it must agree with `feedFenceState` in `useStreaming`; upstream's scanner only recognises column-0 fences, so an indented fence's body is treated as prose and sentence-split                                                                                    |
| 3   | `useTypewriter` `scanBoundaries`  | a closing fence must be followed by whitespace only (`lineTailBlank`)                                                                             | CommonMark: a line like ` ```js ` inside a fenced block is body text, not the terminator                                                                                                                                                                                         |
| 4   | `useTypewriter`                   | inline-code backtick run length (`inlineCodeLen`, `backtickRun`, `settleBacktickRun`)                                                             | CommonMark: a run of N backticks is closed only by a run of exactly N; upstream toggles on every backtick                                                                                                                                                                        |
| 5   | `useTypewriter`                   | `safeWindowStart` and `streamSafeEnd`                                                                                                             | The `Intl.Segmenter` window must start at a real cluster start (a window opened mid-cluster reports boundaries that do not exist), and a trailing high surrogate / ZWJ must be held back or the typewriter shows U+FFFD / a half-joined emoji                                    |
| 6   | `components/AnimationText.vue`    | props are flattened (`splitBy`, `delimiters`, `maxSentenceChars`, `fadeDuration`, `easing`) instead of upstream's single `animationConfig` object | Vue SFC API; `index.vue` unpacks `streaming.animationConfig` into them. Sentence-splitting semantics and defaults match upstream                                                                                                                                                 |
| 7   | `utils/memo.ts`                   | not ported                                                                                                                                        | `arePropsEqualIgnoringDomNode` is a `React.memo` comparator with no Vue equivalent; downstream relies on the documented stable `components` / `componentsProps` references instead                                                                                               |
| 8   | `Parser.lex` + `index.vue` wiring | ours only                                                                                                                                         | Feeds the section tracker's marked oracle - see section 1                                                                                                                                                                                                                        |

### Verified aligned

- `plugins/Latex` - after the `isBlock` port recorded in section 2.
- `AnimationText` sentence splitting: same defaults (`。！？.!?\n`),
  `maxSentenceChars: 120` and cap-while-waiting behaviour as upstream.

### Do not

- Do not "align" divergences 1-5 back to upstream: they fix the preset's
  fade-in node explosion, mis-detected fences in the typewriter scanner, and
  half-cut emoji / flags. When porting a future upstream typewriter change,
  keep them and re-run `composables/__tests__/useTypewriter.test.ts`.
- Do not add a Vue equivalent of `arePropsEqualIgnoringDomNode` without
  reconsidering the `components` / `componentsProps` stability convention that
  replaced it.
