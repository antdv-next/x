<docs lang="zh-CN">
状态与进度：四种状态各有一个形变图标——待处理是虚线圆，进行中是进度弧（`progress` 控制弧长）加旋转外圈，完成是对勾描绘，取消是叉号描绘。取消是终态的一种，参与自动折叠，但不计入完成数。
</docs>

<docs lang="en-US">
Status and progress: each of the four statuses has its own morphing icon — a dashed circle for pending, a progress arc (`progress` drives the arc length) with a rotating ring for in-progress, a drawn checkmark for completed, and a drawn cross for cancelled. Cancelled is a terminal state: it counts towards auto-collapse but not towards the completion total.
</docs>

<script setup lang="ts">
import type { TodoItem } from "@antdv-next/x-pro";

import { TodoList } from "@antdv-next/x-pro";
import { ref } from "vue";

const items = ref<TodoItem[]>([
  { id: "1", title: "Pending — waiting for a slot", status: "pending" },
  {
    id: "2",
    title: "In progress — indexing the corpus",
    status: "in-progress",
    progress: 35,
    detail: "35%",
  },
  {
    id: "3",
    title: "In progress — almost done",
    status: "in-progress",
    progress: 82,
    detail: "82%",
  },
  { id: "4", title: "Completed — fetched sources", status: "completed" },
  { id: "5", title: "Cancelled — duplicate of task 1", status: "cancelled" },
]);
</script>

<template>
  <TodoList
    :items="items"
    :style="{
      maxWidth: '460px',
      padding: '12px 16px',
      border: '1px solid var(--ant-color-border)',
      borderRadius: '14px',
      background: 'var(--ant-color-bg-container)',
    }"
  />
</template>
