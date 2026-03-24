<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { computed } from "vue";

const source = `
### Use [marked extensions](https://marked.js.org/using_advanced#extensions)

I :heart: XMarkdown! :tada:
`;

const transformed = computed(() =>
  source.replace(/:heart:/g, "❤️").replace(/:tada:/g, "🎉"),
);
</script>

<template>
  <XMarkdown :content="transformed" />
</template>

<docs lang="zh-CN">
Marked 风格插件示例：对齐 antdx 的 emoji 扩展场景，演示预处理后渲染。
</docs>

<docs lang="en-US">
Marked-style plugin demo aligned with antdx emoji-extension scenario, rendering transformed content.
</docs>
