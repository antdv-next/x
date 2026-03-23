---
group:
  title: Components
  order: 5
title: Chat Enhancement
order: 2
---

For AI chat scenarios, map specific tags to business components to improve readability and interaction.

## Typical Cases

- Reasoning section rendering (`think`)
- Citation/source rendering (`sources`)

## Example

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import ThinkBlock from "./ThinkBlock.vue";
import SourcesBlock from "./SourcesBlock.vue";

const components = {
  think: ThinkBlock,
  sources: SourcesBlock,
};

const content = `<think>Search first, then summarize.</think>\n\n<sources>[1] https://example.com</sources>`;
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

## See Also

- [Overview](./components-en)
- [Data Display](./data-display-en)
- [Rich Text Enhancement](./rich-text-en)
