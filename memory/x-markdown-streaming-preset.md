# Streaming preset, typewriter and the Vue API mapping

**Files:** `packages/x-markdown/src/XMarkdown/utils/streaming.ts` (the preset),
`composables/useTypewriter.ts`, `components/AnimationText.vue`,
`components/Section.vue`, `index.vue`.
**Upstream counterpart:** `ant-design/x` -> `hooks/useTypewriter.ts`,
`AnimationText.tsx`, `Section.tsx`, `utils/memo.ts`, `index.tsx`.
**Origin:** port of `ant-design/x` PR #2061 (`8b76d6a`), landed as `7b6b587`
(#226) and `6ea3c9d` (#229).

## Deliberate divergences (not the marked-oracle kind)

Same rule as the other memory files: these are fixes for real bugs, and a
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
| 8   | `Parser.lex` + `index.vue` wiring | ours only                                                                                                                                         | Feeds the section tracker's marked oracle - see `x-markdown-streaming-sections.md`                                                                                                                                                                                               |

## Verified aligned

- `plugins/Latex` - after the `isBlock` port recorded in `x-markdown-latex.md`.
- `AnimationText` sentence splitting: same defaults (`。！？.!?\n`),
  `maxSentenceChars: 120` and cap-while-waiting behaviour as upstream.

## Do not

- Do not "align" divergences 1-5 back to upstream: they fix the preset's
  fade-in node explosion, mis-detected fences in the typewriter scanner, and
  half-cut emoji / flags. When porting a future upstream typewriter change,
  keep them and re-run `composables/__tests__/useTypewriter.test.ts`.
- Do not add a Vue equivalent of `arePropsEqualIgnoringDomNode` without
  reconsidering the `components` / `componentsProps` stability convention that
  replaced it.
