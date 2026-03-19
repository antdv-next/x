<script setup lang="ts">
import type { SourcesProps } from "@antdv-next/x";

import { Sources } from "@antdv-next/x";

const items: SourcesProps["items"] = [
  {
    title: "1. Data source",
    url: "https://x.antdv-next.com/components",
  },
  {
    title: "2. Data source",
    url: "https://x.antdv-next.com/components",
  },
  {
    title: "3. Data source",
    url: "https://x.antdv-next.com/components",
  },
];
</script>

<template>
  <Sources title="Used 3 sources" :items="items" />
</template>

<docs lang="zh-CN">
基础用法。
</docs>

<docs lang="en-US">
Basic usage.
</docs>
