<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { computed } from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const { isDark } = useDarkMode();

const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const content = `# Hello XMarkdown

This is a streaming-friendly Markdown renderer.

- Supports streaming rendering
- Supports component extension
- Supports secure rendering`;
</script>

<template>
  <XMarkdown :content="content" :class-name="markdownClass" />
</template>

<docs lang="zh-CN">
Minimal setup demo: render a Markdown string right after installation.
</docs>

<docs lang="en-US">
Minimal setup demo: render a Markdown string right after installation.
</docs>
