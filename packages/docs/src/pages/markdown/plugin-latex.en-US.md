---
group:
  title: Plugins
  order: 6
title: Latex
order: 2
---

## When to Use

Use this when you need to render formula content or formula placeholders in Markdown.

## Code Demo

<demo src="./demo/latex-basic.vue">Latex Basic Demo</demo>

## Recommended Workflow

1. Convert formula syntax (for example `$...$` or `$$...$$`) into custom tags in a preprocess step.
2. Map those tags to your formula component in `components` (KaTeX/MathJax, etc.).
3. In streaming mode, prefer recalculating formulas after `streamStatus === 'done'`.
