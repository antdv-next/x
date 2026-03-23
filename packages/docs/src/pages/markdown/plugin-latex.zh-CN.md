---
group:
  title: 插件集
title: 公式
order: 2
---

## 何时使用

当你需要在 Markdown 中展示数学公式时。

## 推荐方案

1. 约定公式语法（例如 fenced code 的 `math`）
2. 在自定义代码块组件中接入 KaTeX 或 MathJax
3. 将 `pre` 或 `code` 映射到该组件

## 示例

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

## 说明

- 若只需要静态公式展示，优先选择 KaTeX（体积更小）。
- 若需要更完整 TeX 特性，可考虑 MathJax。
