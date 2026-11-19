<docs lang="zh-CN">
树形任务：`items` 的每一项可以通过 `children` 带出子任务，行尾出现展开入口，展开后递归渲染一层子清单。`expandedKeys` 受控展开，`itemExtra` 插槽可完全接管展开区内容——这里在不跑子任务的行里塞了一段自定义面板。
</docs>

<docs lang="en-US">
Tree tasks: each item can carry `children`, which adds an expand affordance and recursively renders a nested list. `expandedKeys` controls expansion, and the `itemExtra` slot can fully take over the expanded area — here a custom panel is shown on a row without children.
</docs>

<script setup lang="ts">
import type { TodoItem } from "@antdv-next/x-pro";

import { TodoList } from "@antdv-next/x-pro";
import { ref } from "vue";

const items = ref<TodoItem[]>([
  {
    id: "1",
    title: "Build the agent loop",
    status: "completed",
    children: [
      { id: "1-1", title: "Wire the model client", status: "completed" },
      { id: "1-2", title: "Add tool dispatch", status: "completed" },
    ],
  },
  {
    id: "2",
    title: "Design the plan panel",
    status: "in-progress",
    progress: 60,
    children: [
      { id: "2-1", title: "Status icons", status: "completed" },
      {
        id: "2-2",
        title: "Expandable rows",
        status: "in-progress",
        progress: 40,
      },
      {
        id: "2-3",
        title: "Nested children",
        status: "pending",
        children: [
          { id: "2-3-1", title: "Indent tokens", status: "pending" },
          { id: "2-3-2", title: "Semantic classes", status: "pending" },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Write the docs",
    status: "pending",
    detail: "Owner review pending",
    payload: { owner: "docs", estimate: "2h" },
  },
]);

const expandedKeys = ref<string[]>(["2"]);

function toggle(id: string) {
  expandedKeys.value = expandedKeys.value.includes(id)
    ? expandedKeys.value.filter(key => key !== id)
    : [...expandedKeys.value, id];
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <TodoList
      v-model:expanded-keys="expandedKeys"
      :items="items"
      title="Agent plan"
      recursive-count
      :max-height="360"
      :style="{
        width: '420px',
        padding: '16px 20px',
        border: '1px solid var(--ant-color-border)',
        borderRadius: '14px',
        background: 'var(--ant-color-bg-container)',
      }"
    >
      <template #itemDetail="{ item }">
        <a-typography-text
          v-if="item.detail"
          type="secondary"
          style="font-size: 12px"
        >
          {{ item.detail }}
        </a-typography-text>
      </template>

      <template #itemExtra="{ item, toggle }">
        <div
          v-if="item.id === '3'"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 8px 10px;
            border-radius: 8px;
            background: var(--ant-color-fill-quaternary);
            font-size: 12px;
          "
        >
          <span>Owner: {{ (item.payload as any)?.owner }}</span>
          <a @click.prevent="toggle">收起</a>
        </div>
      </template>
    </TodoList>

    <div
      style="display: flex; flex-direction: column; gap: 8px; font-size: 13px"
    >
      <span>展开的行：{{ expandedKeys.join(", ") || "（无）" }}</span>
      <a-space>
        <a-button size="small" @click="expandedKeys = ['1', '2', '3']"
          >全部展开</a-button
        >
        <a-button size="small" @click="expandedKeys = []">全部收起</a-button>
        <a-button size="small" @click="toggle('2')">切换 Plan panel</a-button>
      </a-space>
    </div>
  </div>
</template>
