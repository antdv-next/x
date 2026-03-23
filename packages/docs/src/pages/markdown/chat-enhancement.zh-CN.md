---
group:
  title: 组件
  order: 5
title: 聊天增强
order: 2
---

在 AI 对话场景中，可以把特定标签映射为业务组件，提升可读性和交互性。

## 常见场景

- 思考过程折叠展示（如 `think`）
- 引用与来源区块（如 `sources`）

## 示例

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import ThinkBlock from "./ThinkBlock.vue";
import SourcesBlock from "./SourcesBlock.vue";

const components = {
  think: ThinkBlock,
  sources: SourcesBlock,
};

const content = `<think>先检索，再总结。</think>\n\n<sources>[1] https://example.com</sources>`;
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

## 相关

- [总览](./components)
- [数据展示](./data-display)
- [富文本增强](./rich-text)
