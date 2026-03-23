<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `# Custom Theme\n\nThis block overrides a few CSS variables.`;
</script>

<template>
  <div class="x-markdown-light x-markdown-custom custom-shell">
    <XMarkdown :content="content" />
  </div>
</template>

<style scoped>
.custom-shell {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 12px;
}

.x-markdown-custom {
  --primary-color: #0f766e;
  --primary-color-hover: #0d9488;
  --heading-color: #0f172a;
  --text-color: #1f2937;
  --light-bg: rgba(15, 118, 110, 0.08);
}
</style>

<docs lang="zh-CN">
自定义主题示例：在内置主题基础上覆盖局部变量。
</docs>

<docs lang="en-US">
Custom theme demo: override a subset of built-in theme variables.
</docs>
