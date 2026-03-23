<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";

const components = {
  pre: {
    template: `<pre style="background: #f6f8fa; padding: 16px; border-radius: 6px;"><code><slot /></code></pre>`,
  },
};
const content = `\`\`\`ts
console.log('hello')
\`\`\``;
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>

<docs lang="zh-CN">
组件扩展，展示了如何将 HTML 节点映射为自定义 Vue 组件。
</docs>

<docs lang="en-US">
Component extension, demonstrating how to map HTML nodes to custom Vue components.
</docs>
