---
group:
  title: Plugins
  order: 6
title: Overview
order: 1
---

The current `x-markdown` release does not ship a standalone built-in plugin package, but you can still implement plugin-like extensions with:

1. `components` mapping for custom tag rendering
2. Markdown preprocessing before passing content to `XMarkdown`
3. `streaming.incompleteMarkdownComponentMap` for loading placeholders

## Extension Paths

- [LaTeX](./plugin-latex-en)
- [Custom Plugin Flow](./custom-plugin-en)

## Recommended Practices

- Keep extension logic as pure functions for reuse and testability.
- Use preprocessing for syntax transformation only; keep rendering in components.
- In streaming scenarios, prioritize readability before heavy visual polish.
