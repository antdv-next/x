<docs lang="zh-CN">
流式执行：模拟 Agent 边执行边补齐后续步骤。新增任务时列表平滑贴底，最新一步始终可见；全部完成后面板自动收起，再次执行时新任务把它重新展开。
</docs>

<docs lang="en-US">
Streaming execution: watch an agent fill in the plan as it works. Adding a task smooth-scrolls the list to the bottom so the newest step stays visible; once everything finishes the panel collapses itself, and starting another run re-opens it with the new tasks.
</docs>

<script setup lang="ts">
import type { TodoItem } from "@antdv-next/x-pro";

import { TodoList } from "@antdv-next/x-pro";
import { onBeforeUnmount, ref } from "vue";

const plan = [
  "Parse the request",
  "Search the knowledge base",
  "Rank candidate answers",
  "Draft a response",
  "Verify against sources",
  "Summarize with citations",
  "Attach the sources",
  "Hand back the result",
];

const items = ref<TodoItem[]>([
  { id: "step-1", title: plan[0]!, status: "in-progress" },
]);

const running = ref(false);
let timer: number | undefined;
let cursor = 0;

function stop() {
  if (timer !== undefined) {
    window.clearInterval(timer);
    timer = undefined;
  }

  running.value = false;
}

/** 每轮完成当前步骤，并把下一步追加到计划末尾。 */
function run() {
  stop();
  cursor = 0;
  items.value = [{ id: "step-1", title: plan[0]!, status: "in-progress" }];
  running.value = true;

  timer = window.setInterval(() => {
    const current = items.value[cursor];
    if (current) {
      current.status = "completed";
    }

    cursor += 1;
    const nextTitle = plan[cursor];
    if (nextTitle) {
      items.value = [
        ...items.value,
        { id: `step-${cursor + 1}`, title: nextTitle, status: "in-progress" },
      ];
      return;
    }

    stop();
  }, 700);
}

onBeforeUnmount(stop);
</script>

<template>
  <div>
    <a-flex justify="space-between" align="center" style="margin-bottom: 12px">
      <a-typography-text type="secondary">
        {{ running ? "Agent is working…" : "Idle" }}
      </a-typography-text>
      <a-button type="primary" :disabled="running" @click="run">
        Run plan
      </a-button>
    </a-flex>

    <TodoList
      :items="items"
      :max-height="160"
      :style="{
        maxWidth: '460px',
        padding: '12px 16px',
        border: '1px solid var(--ant-color-border)',
        borderRadius: '14px',
        background: 'var(--ant-color-bg-container)',
      }"
    />
  </div>
</template>
