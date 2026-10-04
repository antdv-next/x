<docs lang="zh-CN">
消息导航导轨：`navigation="rail"` 配合 `items` 元数据。`itemSelector` 可以把刻度挂到任意层级的节点上——这里按「轮次」而不是单条消息生成刻度，预览卡片显示该轮的问答。刻度宽度按与高亮项的距离衰减，卡片始终单例；点击历史刻度会脱离跟随，点击最新一条则回到跟随。
</docs>

<docs lang="en-US">
Message navigation rail: `navigation="rail"` plus `items` metadata. `itemSelector` can anchor ticks to any node level — here one tick per turn rather than per message, with the preview card showing that turn's question and answer. Tick width attenuates with distance to the highlighted entry while the card stays a singleton; clicking history detaches follow, clicking the newest turn resumes it.
</docs>

<script setup lang="ts">
import type { MessageScrollerItem } from "@antdv-next/x-pro";

import { MessageScroller } from "@antdv-next/x-pro";
import { ref } from "vue";

const turns = [
  {
    id: "turn-1",
    question: "What should the first release include?",
    answer: "Start with the smallest workflow that still feels complete.",
  },
  {
    id: "turn-2",
    question: "Include streaming and recovery states too.",
    answer: "Yes. Those states make the first version feel dependable.",
  },
  {
    id: "turn-3",
    question: "How should we present tool results?",
    answer: "Keep results close to the action that produced them.",
  },
  {
    id: "turn-4",
    question: "What about actions that need confirmation?",
    answer: "Pause the run, explain the impact, and ask before continuing.",
  },
  {
    id: "turn-5",
    question: "Can the transcript stay easy to navigate?",
    answer: "Use the rail to jump between turns without losing your place.",
  },
  {
    id: "turn-6",
    question: "Which node should a tick point at?",
    answer:
      "Any node the selector matches — a turn, a tool call, or a single message.",
  },
  {
    id: "turn-7",
    question: "What happens on a touch screen?",
    answer:
      "Tapping a tick pins the preview card until the reader taps outside the rail.",
  },
  {
    id: "turn-8",
    question: "How dense can the rail get?",
    answer:
      "Ticks shrink automatically so the whole conversation always fits the viewport.",
  },
];

/** 一轮即一刻度：`id` 与轮次节点上的 `data-turn-id` 对齐。 */
const items: MessageScrollerItem[] = turns.map((turn, index) => ({
  id: turn.id,
  title: `Turn ${index + 1} · ${turn.question}`,
  description: turn.answer,
}));

const selected = ref<string | number>();
const following = ref(true);

function handleSelect(id: string | number) {
  selected.value = id;
}
</script>

<template>
  <div>
    <a-flex justify="space-between" align="center" style="margin-bottom: 12px">
      <a-space>
        <a-tag :color="following ? 'success' : 'warning'">
          {{ following ? "Following" : "Detached" }}
        </a-tag>
        <a-typography-text type="secondary">
          railItemSelect: {{ selected ?? "none" }}
        </a-typography-text>
      </a-space>
      <a-typography-text type="secondary">
        Hover a tick to preview, click to jump.
      </a-typography-text>
    </a-flex>

    <MessageScroller
      navigation="rail"
      item-selector="[data-turn-id]"
      back-to-bottom
      :items="items"
      :style="{
        height: '320px',
        border: '1px solid var(--ant-color-border)',
        borderRadius: '14px',
        background: 'var(--ant-color-bg-container)',
      }"
      @rail-item-select="handleSelect"
      @follow-change="following = $event"
    >
      <div
        v-for="turn in turns"
        :key="turn.id"
        :data-turn-id="turn.id"
        style="
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px 16px;
        "
      >
        <div
          style="
            max-width: 78%;
            margin-inline-start: auto;
            padding: 8px 12px;
            border-radius: 12px;
            background: var(--ant-color-primary-bg);
          "
        >
          <a-typography-text>{{ turn.question }}</a-typography-text>
        </div>
        <div
          style="
            max-width: 78%;
            padding: 8px 12px;
            border-radius: 12px;
            background: var(--ant-color-fill-secondary);
          "
        >
          <a-typography-text>{{ turn.answer }}</a-typography-text>
        </div>
      </div>
    </MessageScroller>
  </div>
</template>
