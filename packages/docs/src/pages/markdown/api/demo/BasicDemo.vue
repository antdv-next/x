<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `# Hello World

这是 **markdown** 内容。`;
</script>

<template>
  <XMarkdown :content="content" />
</template>

<docs lang="zh-CN">
基础渲染，展示了 XMarkdown 最简单的用法。
</docs>

<docs lang="en-US">
Basic rendering, demonstrating the simplest usage of XMarkdown.
</docs>
