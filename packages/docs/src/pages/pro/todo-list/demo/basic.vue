<docs lang="zh-CN">
基础用法：传入 `items` 即可。头部汇总整体状态与完成计数，点击头部展开或折叠；所有任务进入终态后面板自动收起。
</docs>

<docs lang="en-US">
Basic usage: pass `items` and nothing else. The header summarizes the overall status and the completion count, clicking it toggles the panel, and the panel collapses itself once every task reaches a terminal state.
</docs>

<script setup lang="ts">
import type { TodoItem } from "@antdv-next/x-pro";

import { TodoList } from "@antdv-next/x-pro";
import { ref } from "vue";

const items = ref<TodoItem[]>([
  { id: "1", title: "Draft the release checklist", status: "completed" },
  { id: "2", title: "Wire the streaming endpoint", status: "completed" },
  { id: "3", title: "Review error states", status: "in-progress" },
  { id: "4", title: "Write the changelog", status: "pending" },
  { id: "5", title: "Tag and publish", status: "pending" },
]);
</script>

<template>
  <TodoList
    :items="items"
    :style="{
      maxWidth: '420px',
      padding: '12px 16px',
      border: '1px solid var(--ant-color-border)',
      borderRadius: '14px',
      background: 'var(--ant-color-bg-container)',
    }"
  />
</template>
