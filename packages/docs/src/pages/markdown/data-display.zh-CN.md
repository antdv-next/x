---
group:
  title: 组件
  order: 5
title: 数据展示
order: 3
---

你可以把结构化内容映射为图表或卡片组件，实现更强的数据可视化展示。

## 常见场景

- Mermaid 图渲染
- 统计卡片 / 指标面板

## 示例

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import MermaidBlock from "./MermaidBlock.vue";
import MetricCard from "./MetricCard.vue";

const components = {
  mermaid: MermaidBlock,
  metric: MetricCard,
};

const content = `<mermaid>graph TD; A-->B</mermaid>\n\n<metric title="QPS" value="1290" />`;
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

## 相关

- [总览](./components)
- [聊天增强](./chat-enhancement)
- [富文本增强](./rich-text)
