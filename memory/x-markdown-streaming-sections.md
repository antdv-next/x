# `streaming.incremental` section boundaries

**Files:** `packages/x-markdown/src/XMarkdown/composables/useStreaming.ts`
(`trackSectionBoundary` and the `DESIGN CONTRACT` comment above it),
`packages/x-markdown/src/XMarkdown/interface.ts` (`SectionState`, the
`incremental` JSDoc).
**Upstream counterpart:** `ant-design/x` -> `packages/x-markdown/src/XMarkdown/hooks/useStreaming.ts`.
**Origin:** port of `ant-design/x` PR #2061 (upstream commit `8b76d6a`),
landed downstream as `0703ba2`; tracked in issue #225.

## The invariant

While streaming, rendering the sections must produce **exactly** the
whole-document DOM at every point of the stream (and the same DOM as a plain
one-shot render at the end). A boundary may only be placed before a column-0
ATX heading line, and only when that line really starts a new top-level block.

A boundary placed _inside_ a block that the whole-document parse keeps open
changes the rendered markup (a spurious `<h1>` where the full render has code
or raw text). Placing **no** boundary only costs incremental reuse. So every
ambiguity must resolve to "do not split".

## The decision (2026-10-03): ask marked, do not model it

Rounds 1-9 of review produced downstream-only fixes that grew a hand-written
model of marked's block grammar - list-item continuation, blockquote laziness,
paragraph interruption, setext eligibility, the fenced-code / HTML block
rules, marker widths, tab gaps. It reached ~950 extra lines of interacting
state, and every review round found another input where the model and marked
disagreed. It also meant fixing one case routinely broke another.

That model was **deleted** on 2026-10-03. `startsNewTopLevelBlock` now lexes
the current section with the _renderer's own_ marked instance
(`Parser.lex`, wired in `index.vue`) and answers the only question that
matters: does `prefix + "# x\n"` parse into strictly more top-level blocks
than `prefix`? The tracker keeps only the offsets, a `noSplit` flag, a small
conservative raw-block state, and a bounded memo of refusals.

## Deliberate divergences from upstream's file

Upstream's `trackSectionBoundary` is ~62 lines. Ours is structurally the same
shape, plus:

| #   | Divergence                                                                                                                                             | Why                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Boundaries are verified by lexing the section with the renderer's marked (`startsNewTopLevelBlock` + `openBlock` memo + `Parser.lex`)                  | Upstream's char-level fence scanner is blind to containers, so it splits wrongly when a fence is reopened at top level after a list item ends (upstream bug #1 below)                       |
| 2   | No `HTML_BLOCK_OPEN` catch-all; HTML blocks are decided by marked                                                                                      | Upstream's "any `<x` line opens an HTML block until a blank line" is a superset approximation that also _misses_ correct splits (e.g. a PI that closes at `?>` before any blank line)       |
| 3   | Raw-block set extended with `<?` (PI), `<!` (declaration) and `<![CDATA[`                                                                              | Their raw text is re-interpreted by the browser/DOMPurify - `<?php` opens a bogus comment that can swallow a following `<h1>` open tag (upstream bug #2)                                    |
| 4   | `$$` math: opener must be exactly `$`/`$$` (no trailing whitespace); closer must sit at column 0 with the same run length, only after a non-empty body | Matches the bundled LaTeX plugin's rule `^(\${1,2})\n` / `\n\1`; upstream uses `\s*$` and `line.trim() === close`, which close on indented / longer / trailing-space runs (upstream bug #3) |
| 5   | A candidate `#` line is still checked when the fence scanner believes it is inside a fence (no hard fence gate)                                        | Upstream returns early whenever `fence.inFenced`, so one mis-detected fence poisons every later split (upstream bug #4)                                                                     |
| 6   | `hasUnclosedRawTags` veto (upstream only has `detectUnclosedComponentTags`)                                                                            | An unclosed `<div>` is auto-closed by DOMPurify at the section end, which changes the DOM shape                                                                                             |
| 7   | The tracker state machine runs even when `incremental` is off (`record` gates only the recording); upstream skips it entirely                          | Keeps definitions / raw-block state / line starts correct when `incremental` is switched on mid-stream                                                                                      |
| 8   | One trailing `\r` is stripped before the line classifiers                                                                                              | CRLF documents                                                                                                                                                                              |

## Upstream bugs we deliberately fix

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

## Remaining limits (accepted)

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

## How it is verified

- `packages/x-markdown/src/XMarkdown/__tests__/incremental.test.ts`: per
  character whole-vs-sectioned DOM equivalence over the corpora, plus boundary
  guards. Its "does not split" assertions are the specification.
- Differential fuzz: feed random documents built from mixed
  heading/fence/list/quote/HTML/math/tab lines one character at a time and
  compare sectioned vs whole render at every step. 800 documents x 2 seeds
  produced 0 divergences on 2026-10-03.

## Do not

- Do not re-add a hand-written model of marked's block grammar to make one
  input split again. If a split is missing, the fix is to improve how we _ask_
  marked (or to accept the refusal), never to predict it ourselves.
- Do not "align" the divergences above back to upstream without reading this
  file: they are upstream bugs, not porting mistakes.
