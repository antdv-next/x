<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `# Hello XMarkdown

- Streaming-friendly rendering
- Component extension
- Safe HTML handling`;
</script>

<template>
  <XMarkdown :content="content" />
</template>

<docs lang="zh-CN">
基础渲染，最小可用示例。
</docs>

<docs lang="en-US">
Basic rendering, the smallest working setup.
</docs>
