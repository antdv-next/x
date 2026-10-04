<docs lang="zh-CN">
消息导航导轨：`navigation="rail"` 配合 `items` 元数据，刻度按距离衰减，预览卡片单例滑动；选中项会触发 `railItemSelect`。
</docs>

<docs lang="en-US">
Message navigation rail: `navigation="rail"` with `items` metadata. Ticks attenuate by distance, the preview card slides as a singleton, and selection emits `railItemSelect`.
</docs>

<script setup lang="ts">
import type { MessageScrollerItem } from "@antdv-next/x-pro";

import { MessageScroller } from "@antdv-next/x-pro";
import { ref } from "vue";

const turns = [
  {
    question: "What should the first release include?",
    answer: "Start with the smallest workflow that still feels complete.",
  },
  {
    question: "Include streaming and recovery states too.",
    answer: "Yes. Those states make the first version feel dependable.",
  },
  {
    question: "How should we present tool results?",
    answer: "Keep results close to the action that produced them.",
  },
  {
    question: "What about actions that need confirmation?",
    answer: "Pause the run, explain the impact, and ask before continuing.",
  },
  {
    question: "Can the transcript stay easy to navigate?",
    answer: "Use the rail to jump between turns without losing your place.",
  },
];

const messages = turns.flatMap((turn, index) => [
  {
    id: `message-${index * 2 + 1}`,
    from: "user" as const,
    content: turn.question,
    title: turn.question,
    description: turn.answer,
  },
  {
    id: `message-${index * 2 + 2}`,
    from: "assistant" as const,
    content: turn.answer,
    title: turn.answer,
    description: turn.question,
  },
]);

const items: MessageScrollerItem[] = messages.map(message => ({
  id: message.id,
  title: message.title,
  description: message.description,
}));

const selected = ref<string | number>();

function handleSelect(id: string | number) {
  selected.value = id;
}
</script>

<template>
  <div>
    <a-flex justify="space-between" align="center" style="margin-bottom: 12px">
      <a-typography-text type="secondary">
        Rail item selected: {{ selected ?? "none" }}
      </a-typography-text>
      <a-typography-text type="secondary">
        Click a tick to jump, hover to preview.
      </a-typography-text>
    </a-flex>

    <MessageScroller
      navigation="rail"
      :items="items"
      :style="{
        height: '320px',
        border: '1px solid var(--ant-color-border)',
        borderRadius: '14px',
        background: 'var(--ant-color-bg-container)',
      }"
      @rail-item-select="handleSelect"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        :data-message-id="message.id"
        :data-from="message.from"
        style="padding: 8px 16px"
      >
        <div
          style="max-width: 82%; padding: 8px 12px; border-radius: 12px"
          :style="
            message.from === 'user'
              ? {
                  marginLeft: 'auto',
                  background: 'var(--ant-color-primary-bg)',
                }
              : { background: 'var(--ant-color-fill-secondary)' }
          "
        >
          <a-typography-text>{{ message.content }}</a-typography-text>
        </div>
      </div>
    </MessageScroller>
  </div>
</template>
