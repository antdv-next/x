---
title: 在线体验
order: 2.2
---

你可以用下面这段最小页面在本地快速搭建一个可交互 Playground：

```vue
<script setup>
import { ref } from "vue";
import { XMarkdown } from "@antdv-next/x-markdown";
import "@antdv-next/x-markdown/themes/light.css";

const content = ref(`# XMarkdown Playground\n\n输入 Markdown 内容进行预览。`);
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

> 如果你在项目内已经有文档站，也可以复用同一个组件做实时调试页面。
