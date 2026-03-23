---
group:
  title: Plugins
title: Latex
order: 2
---

## When to Use

Use this when you need math formulas in Markdown.

## Recommended Approach

1. Define formula syntax (for example fenced code with `math`)
2. Integrate KaTeX or MathJax in a custom code component
3. Map `pre` or `code` to that component

## Example

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import MathCodeBlock from "./MathCodeBlock.vue";

const components = {
  pre: MathCodeBlock,
};

const content = `\`\`\`math\n\\int_0^1 x^2 dx\n\`\`\``;
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

## Notes

- Prefer KaTeX for static formulas (smaller bundle).
- Choose MathJax when you need broader TeX compatibility.
