<script setup lang="ts">
import type { SourcesProps } from "@antdv-next/x";

import { Sources } from "@antdv-next/x";
import { Button } from "antdv-next";
import { ref } from "vue";

const expanded = ref(true);

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
  <Button
    type="primary"
    @click="expanded = !expanded"
    style="margin-bottom: 8px"
  >
    Change expand
  </Button>
  <Sources title="Used 3 sources" :items="items" :expanded="expanded" />
</template>

<docs lang="zh-CN">
控制展开折叠状态。
</docs>

<docs lang="en-US">
Control expand and collapse state.
</docs>
