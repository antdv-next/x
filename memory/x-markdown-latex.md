# LaTeX plugin and `$` / `$$` / `\[` math

**Files:** `packages/x-markdown/src/plugins/Latex/index.ts`,
`packages/x-markdown/src/plugins/Latex/__tests__/index.test.ts`, the theme
rules for `.inline-katex` / `.block-katex`
(`packages/x-markdown/src/XMarkdown/index.css` and the two `themes/index.css`
copies).
**Upstream counterpart:** `ant-design/x` -> `packages/x-markdown/src/plugins/Latex/`.
**Splitter side:** how the streaming section tracker treats math is recorded in
`x-markdown-streaming-sections.md` (divergence #4 and remaining limit #1).

## Synced (aligned)

- **Currency is not math** - upstream `fix(markdown): avoid parsing currency as
LaTeX` (#1997 line) plus `allow escaped dollar signs inside inline formulas`.
  Downstream commit `c463ec1`. The plugin implements Pandoc's single-dollar
  rules in `isValidInlineDollarMatch`: `$12, $20` and `$ x $` are not math,
  `$$...$$` is exempt, and `\$` inside a formula is not a closing delimiter.
  Covered by the currency / escaped-dollar / single-dollar-rule tests.

## Fixed on 2026-10-03: multi-line `\[...\]` was not ported

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

## Known gaps to re-check on the next sync

- Our plugin test file is a subset of upstream's (~20 cases). Upstream cases
  without an obvious downstream twin: inline `$$\n...\n$$`, inline
  `\[\n...\n\]`, block `$$...$$` on one line, `align*` replacement, empty
  content, "content without LaTeX", `throwOnError: true`. Verify each on the
  next sync instead of assuming coverage.
- Only upstream commits up to `8b76d6a` are visible in the local clone
  (`.sync-upstream.json` cursor is `7bd48aa`, tag 2.9.0). Anything newer about
  `$` / LaTeX needs a fetch before it can be compared.

## Do not

- Do not "simplify" the plugin to always emit `.inline-katex`; the
  `block-katex` path is upstream behaviour with theme support already in place.
- Do not move math out of the streaming tracker's raw-block state without
  reading why it is there: the plugin's block rule only matches once its
  closing delimiter is present, so a prefix-based marked check cannot see the
  block.
