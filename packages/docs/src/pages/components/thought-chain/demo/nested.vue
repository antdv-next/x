<script setup lang="ts">
import type { ThoughtChainProps } from "@antdv-next/x";

const nestedItemsMap: Record<string, ThoughtChainProps["items"]> = {
  task_1: [
    { title: "1-1 Thought Chain Item", description: "description" },
    { title: "1-2 Thought Chain Item", description: "description" },
  ],
  task_2: [
    { title: "2-1 Thought Chain Item", description: "description" },
    { title: "2-2 Thought Chain Item", description: "description" },
    { title: "2-3 Thought Chain Item", description: "description" },
  ],
};

const items: ThoughtChainProps["items"] = [
  {
    key: "task_1",
    title: "1 - Thought Chain Item",
    description: "description",
    collapsible: true,
  },
  {
    key: "task_2",
    title: "2 - Thought Chain Item",
    description: "description",
    collapsible: true,
  },
];
</script>

<template>
  <a-card :style="{ width: '500px' }">
    <ax-thought-chain :items="items">
      <template #content="{ item }">
        <ax-thought-chain :items="nestedItemsMap[item.key as string] || []" />
      </template>
      <template #footer="{ item }">
        <a-button>{{ item.title }} Footer</a-button>
      </template>
    </ax-thought-chain>
  </a-card>
</template>

<docs lang="zh-CN">
ThoughtChain 组件支持嵌套使用。
</docs>

<docs lang="en-US">
The ThoughtChain component supports nested usage.
</docs>
