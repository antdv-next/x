<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { computed } from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const { isDark } = useDarkMode();

const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const content = `# Hello XMarkdown

> Streaming-friendly, extensible Markdown renderer for LLM output.

## Features

- **Streaming** - syntax recovery and progressive rendering
- **Extensible** - map any node to your Vue components (\`components\`)
- **Plugins** - Latex, code highlighting, Mermaid, etc.

Inline code: \`vp add @antdv-next/x-markdown\`. See [docs](/markdown) for more.
`;
</script>

<template>
  <XMarkdown :content="content" :class-name="markdownClass" />
</template>

<docs lang="zh-CN">
基础渲染：对齐 antdx 示例内容，展示 Markdown 渲染能力与常见特性。
</docs>

<docs lang="en-US">
Basic rendering aligned with antdx demo content, showing core Markdown capabilities.
</docs>
