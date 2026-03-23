---
group:
  title: Components
  order: 5
title: Data Display
order: 3
---

You can map structured content to charts or cards for richer data visualization.

## Typical Cases

- Mermaid diagram rendering
- Metric cards / KPI panels

## Example

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

## See Also

- [Overview](./components-en)
- [Chat Enhancement](./chat-enhancement-en)
- [Rich Text Enhancement](./rich-text-en)
