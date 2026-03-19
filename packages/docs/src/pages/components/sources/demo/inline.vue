<script setup lang="ts">
import type { SourcesProps } from "@antdv-next/x";

import { Sources } from "@antdv-next/x";

const items: SourcesProps["items"] = [
  {
    title: "1. Data source",
    key: "1",
    url: "https://x.antdv-next.com/components",
    description:
      "Artificial Intelligence, often abbreviated as AI, is a broad branch of computer science concerned with building smart machines capable of performing tasks that typically require human intelligence.",
  },
  {
    title: "2. Data source",
    key: "2",
    url: "https://x.antdv-next.com/components",
  },
  {
    title: "3. Data source",
    key: "3",
    url: "https://x.antdv-next.com/components",
  },
];
</script>

<template>
  <div style="display: flex; align-items: center">
    <span>Use the inline mode in the text</span>
    <Sources title="1" :items="items" inline />
    <span>Use the inline mode in the text</span>
    <Sources title="2" :items="items" inline />
  </div>
</template>

<docs lang="zh-CN">
悬停时展示来源信息。
</docs>

<docs lang="en-US">
Show source information on hover.
</docs>
