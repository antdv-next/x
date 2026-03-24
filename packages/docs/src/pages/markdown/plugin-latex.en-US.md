---
group:
  title: Plugins
  order: 6
title: Latex
order: 2
---

## When to Use

When you need to render formulas in Markdown.

## Code Demo

<demo src="./demo/latex-basic.vue">Latex Basic Demo</demo>

## API

| Property          | Description                                                                                                                    | Type                                             | Default                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ---------------------- |
| replaceAlignStart | Whether to replace align* with aligned in formulas, [katex doesn't support align*](https://github.com/KaTeX/KaTeX/issues/1007) | `boolean`                                        | `true`                 |
| katexOptions      | Katex configuration                                                                                                            | [`KatexOptions`](https://katex.org/docs/options) | `{ output: 'mathml' }` |
