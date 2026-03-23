---
group:
  title: 组件
  order: 5
title: 富文本增强
order: 4
---

富文本增强通常用于代码高亮、行号、复制按钮等体验优化。

## 示例

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import CodeHighlighter from "./CodeHighlighter.vue";

const components = {
  pre: CodeHighlighter,
};

const content = `\`\`\`ts\nconst msg = 'hello markdown'\n\`\`\``;
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

## 相关

- [总览](./components)
- [聊天增强](./chat-enhancement)
- [数据展示](./data-display)
