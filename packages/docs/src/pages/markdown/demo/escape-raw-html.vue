<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `<script>alert('xss')<\\/script>\n\n[Open docs](https://github.com/antdv-next/antdv-next-x)`;
</script>

<template>
  <XMarkdown
    :content="content"
    :escape-raw-html="true"
    :open-links-in-new-tab="true"
  />
</template>

<docs lang="zh-CN">
安全示例：原始 HTML 转义与新标签页打开链接。
</docs>

<docs lang="en-US">
Security demo: escape raw HTML and open links in a new tab.
</docs>
