---
title: Playground
order: 2.2
---

Use this minimal page to spin up a local interactive playground quickly:

```vue
<script setup>
import { ref } from "vue";
import { XMarkdown } from "@antdv-next/x-markdown";
import "@antdv-next/x-markdown/themes/light.css";

const content = ref(
  `# XMarkdown Playground\n\nType Markdown here for live preview.`,
);
const streaming = ref({
  hasNextChunk: false,
  tail: true,
  enableAnimation: true,
});
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <textarea v-model="content" style="min-height: 360px; width: 100%;" />
    <XMarkdown
      class="x-markdown-light"
      :content="content"
      :streaming="streaming"
    />
  </div>
</template>
```

> If your project already has a docs site, this component can also be reused as a live debugging page.
