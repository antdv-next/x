<script setup lang="ts">
import { ThoughtChain } from "@antdv-next/x";

const items = [
  { key: "1", title: "理解需求", status: "success" as const },
  { key: "2", title: "搜索文档", status: "success" as const },
  { key: "3", title: "生成代码", status: "loading" as const },
  { key: "4", title: "运行测试" },
];
</script>

<template>
  <ThoughtChain :items="items" />
</template>

<docs lang="zh-CN">
基本用法，展示思维链节点与状态。
</docs>

<docs lang="en-US">
Basic usage showing thought chain nodes with status.
</docs>
