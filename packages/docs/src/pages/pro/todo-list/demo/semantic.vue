<docs lang="zh-CN">
语义化样式：通过 `classes` 与 `styles` 精细控制头部、任务行与状态图标。
</docs>

<docs lang="en-US">
Semantic styling: use `classes` and `styles` to fine-tune the header, the task rows, and the status icons.
</docs>

<script setup lang="ts">
import type { TodoListProps } from "@antdv-next/x-pro";

import { TodoList } from "@antdv-next/x-pro";

const items = [
  { id: "1", title: "Semantic header", status: "completed" as const },
  {
    id: "2",
    title: "Semantic rows",
    status: "in-progress" as const,
    progress: 50,
  },
  { id: "3", title: "Semantic icons", status: "pending" as const },
];

const classes: TodoListProps["classes"] = {
  header: "demo-todo-header",
  item: "demo-todo-item",
};

const styles: TodoListProps["styles"] = {
  header: { padding: "4px 8px", borderRadius: "8px" },
  item: { padding: "2px 8px", borderRadius: "8px" },
  counter: { color: "var(--ant-color-primary)" },
};
</script>

<template>
  <TodoList
    :items="items"
    :classes="classes"
    :styles="styles"
    :style="{
      maxWidth: '420px',
      padding: '12px 16px',
      border: '1px solid var(--ant-color-border)',
      borderRadius: '14px',
      background: 'var(--ant-color-bg-container)',
    }"
  />
</template>
