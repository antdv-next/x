<docs lang="zh-CN">
受控展开：用 `v-model:open` 接管面板状态，`openChange` 上报每次变化。宿主可以在自己的工具栏里放一个按钮，与头部点击走同一条状态通路。
</docs>

<docs lang="en-US">
Controlled open state: take over the panel with `v-model:open` and observe every transition through `openChange`. The host can put its own toggle in a toolbar and drive the same state path as clicking the header.
</docs>

<script setup lang="ts">
import type { TodoItem } from "@antdv-next/x-pro";

import { TodoList } from "@antdv-next/x-pro";
import { ref } from "vue";

const items = ref<TodoItem[]>([
  { id: "1", title: "Collect requirements", status: "completed" },
  { id: "2", title: "Sketch the data flow", status: "completed" },
  { id: "3", title: "Implement the worker", status: "in-progress" },
  { id: "4", title: "Ship the preview", status: "pending" },
]);

const open = ref(true);
const changes = ref(0);
</script>

<template>
  <div>
    <a-flex justify="space-between" align="center" style="margin-bottom: 12px">
      <a-space>
        <a-tag :color="open ? 'success' : 'default'">
          {{ open ? "Open" : "Collapsed" }}
        </a-tag>
        <a-typography-text type="secondary">
          openChange fired {{ changes }} time(s)
        </a-typography-text>
      </a-space>
      <a-button @click="open = !open">
        {{ open ? "Collapse" : "Expand" }}
      </a-button>
    </a-flex>

    <TodoList
      v-model:open="open"
      :items="items"
      :style="{
        maxWidth: '420px',
        padding: '12px 16px',
        border: '1px solid var(--ant-color-border)',
        borderRadius: '14px',
        background: 'var(--ant-color-bg-container)',
      }"
      @open-change="changes += 1"
    />
  </div>
</template>
