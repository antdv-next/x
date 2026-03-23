<script setup lang="ts">
import { ThoughtChain } from "@antdv-next/x";
import { ref, h } from "vue";

const expandedKeys = ref(["1"]);

const items = [
  {
    key: "1",
    title: "分析任务",
    status: "success" as const,
    collapsible: true,
    content: h("div", [
      h("p", "1. 解析用户输入"),
      h("p", "2. 识别关键意图"),
      h("p", "3. 确定执行方案"),
    ]),
  },
  {
    key: "2",
    title: "执行操作",
    status: "loading" as const,
    collapsible: true,
    content: h("p", "正在创建文件并写入代码..."),
  },
  {
    key: "3",
    title: "验证结果",
    collapsible: true,
    content: h("p", "等待执行完成后验证"),
  },
];
</script>

<template>
  <ThoughtChain v-model:expandedKeys="expandedKeys" :items="items" />
</template>

<docs lang="zh-CN">
可折叠的思维链节点，支持 `v-model:expandedKeys`。
</docs>

<docs lang="en-US">
Collapsible thought chain nodes with `v-model:expandedKeys`.
</docs>
