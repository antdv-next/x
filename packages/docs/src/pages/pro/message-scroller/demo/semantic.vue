<docs lang="zh-CN">
语义化样式：通过 `classes` 与 `styles` 精细控制视口、导轨与预览卡片。
</docs>

<docs lang="en-US">
Semantic styling: use `classes` and `styles` to fine-tune the viewport, the rail, and the preview card.
</docs>

<script setup lang="ts">
import type { MessageScrollerProps } from "@antdv-next/x-pro";

import { MessageScroller } from "@antdv-next/x-pro";

const messages = Array.from({ length: 10 }, (_, index) => ({
  id: `message-${index + 1}`,
  from: index % 2 === 0 ? "user" : "assistant",
  content: `Message ${index + 1}: semantic slots make the transcript match any product theme.`,
}));

const items = messages.map((message, index) => ({
  id: message.id,
  title: `Message ${index + 1}`,
  description: message.content,
}));

const classes: MessageScrollerProps["classes"] = {
  viewport: "demo-message-scroller-viewport",
  rail: "demo-message-scroller-rail",
  preview: "demo-message-scroller-preview",
};

const styles: MessageScrollerProps["styles"] = {
  viewport: { padding: "4px 0" },
  railTick: { background: "var(--ant-color-primary)" },
  preview: { borderColor: "var(--ant-color-primary-border)" },
};
</script>

<template>
  <MessageScroller
    navigation="rail"
    :items="items"
    :classes="classes"
    :styles="styles"
    :style="{
      height: '320px',
      border: '1px solid var(--ant-color-border)',
      borderRadius: '14px',
      background: 'var(--ant-color-bg-container)',
    }"
  >
    <div
      v-for="message in messages"
      :key="message.id"
      :data-message-id="message.id"
      style="padding: 8px 16px"
    >
      <div
        style="
          padding: 8px 12px;
          border-radius: 12px;
          background: var(--ant-color-fill-secondary);
        "
      >
        <a-typography-text>{{ message.content }}</a-typography-text>
      </div>
    </div>
  </MessageScroller>
</template>

<style scoped>
:deep(.demo-message-scroller-viewport) {
  scroll-behavior: smooth;
}

:deep(.demo-message-scroller-rail) {
  inset-inline-end: 6px;
}

:deep(.demo-message-scroller-preview) {
  border-width: 2px;
}
</style>
