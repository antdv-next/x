<script setup lang="ts">
import type { ThoughtChainProps } from "@antdv-next/x";

import { ThoughtChain } from "@antdv-next/x";
import { Button, Card } from "antdv-next";
import { h } from "vue";

const items: ThoughtChainProps["items"] = [
  {
    title: "1 - Thought Chain Item",
    description: "description",
    footer: h(Button, () => "1 - Thought Chain Item Footer"),
    content: h(ThoughtChain, {
      items: [
        { title: "1-1 Thought Chain Item", description: "description" },
        { title: "1-2 Thought Chain Item", description: "description" },
      ],
    }),
  },
  {
    title: "2 - Thought Chain Item",
    description: "description",
    footer: h(Button, () => "2 - Thought Chain Item Footer"),
    content: h(ThoughtChain, {
      items: [
        { title: "2-1 Thought Chain Item", description: "description" },
        { title: "2-2 Thought Chain Item", description: "description" },
        { title: "2-3 Thought Chain Item", description: "description" },
      ],
    }),
  },
];
</script>

<template>
  <Card :style="{ width: '500px' }">
    <ThoughtChain :items="items" />
  </Card>
</template>

<docs lang="zh-CN">
ThoughtChain 组件支持嵌套使用。
</docs>

<docs lang="en-US">
The ThoughtChain component supports nested usage.
</docs>
