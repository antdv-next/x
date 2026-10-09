<docs lang="zh-CN">
自定义行内容：`itemTitle` 与 `itemDetail` 插槽接收 `{ item, index, status }`，优先于 `TodoItem` 上的同名字段——状态图标、折叠与计数仍由组件维护。这里给进行中的任务加了一个进度条。
</docs>

<docs lang="en-US">
Custom row content: the `itemTitle` and `itemDetail` slots receive `{ item, index, status }` and take precedence over the same fields on `TodoItem` — the status icon, collapsing, and the counter stay with the component. This example adds a progress bar to the running task.
</docs>

<script setup lang="ts">
import type { TodoItem } from "@antdv-next/x-pro";

import { TodoList } from "@antdv-next/x-pro";
import { ref } from "vue";

const items = ref<TodoItem[]>([
  { id: "1", title: "Ingest documents", status: "completed", detail: "1.2s" },
  {
    id: "2",
    title: "Build the index",
    status: "in-progress",
    progress: 64,
    detail: "64%",
  },
  { id: "3", title: "Warm the cache", status: "pending" },
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
  >
    <template #itemTitle="{ item, status }">
      <a-typography-text :delete="status === 'completed'">
        {{ item.title }}
      </a-typography-text>
    </template>

    <template #itemDetail="{ item, status }">
      <a-tag v-if="status === 'in-progress'" color="processing">
        {{ item.detail }}
      </a-tag>
      <a-typography-text v-else type="secondary" style="font-size: 12px">
        {{ item.detail ?? "—" }}
      </a-typography-text>
    </template>
  </TodoList>
</template>
