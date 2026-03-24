<script setup lang="ts">
import type { ThoughtChainProps } from "@antdv-next/x";

import { ThoughtChain } from "@antdv-next/x";
import { Card } from "antdv-next";

const items: ThoughtChainProps["items"] = [
  {
    title: "Knowledge Query",
    description: "Query knowledge base",
  },
  {
    title: "Web Search Tool Invoked",
    description: "Tool invocation",
  },
  {
    title: "Model Invocation Complete",
    description: "Invoke model for response",
  },
  {
    title: "Response Complete",
    description: "Task completed",
    blink: true,
  },
];
</script>

<template>
  <Card :style="{ width: '500px' }">
    <ThoughtChain :items="items" />
  </Card>
</template>

<docs lang="zh-CN">
基础用法。
</docs>

<docs lang="en-US">
Basic usage.
</docs>
