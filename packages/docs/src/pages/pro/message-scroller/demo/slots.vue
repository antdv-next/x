<docs lang="zh-CN">
自定义插槽：`railItem` 接管刻度外观（`scale` 即距离衰减比例），`preview` 接管预览卡片内容，`backToBottom` 接管回到最新按钮。
</docs>

<docs lang="en-US">
Custom slots: `railItem` owns the tick appearance (`scale` is the attenuation ratio), `preview` owns the card content, and `backToBottom` owns the back-to-latest button.
</docs>

<script setup lang="ts">
import { MessageScroller } from "@antdv-next/x-pro";

const messages = Array.from({ length: 10 }, (_, index) => ({
  id: `message-${index + 1}`,
  from: index % 2 === 0 ? "user" : "assistant",
  content: `Message ${index + 1}: slot-driven navigation keeps the rail readable at any density.`,
}));

const items = messages.map((message, index) => ({
  id: message.id,
  title: `#${index + 1} ${message.from}`,
  description: message.content,
}));
</script>

<template>
  <MessageScroller
    navigation="rail"
    back-to-bottom
    :items="items"
    :style="{
      height: '320px',
      border: '1px solid var(--ant-color-border)',
      borderRadius: '14px',
      background: 'var(--ant-color-bg-container)',
    }"
  >
    <template #railItem="{ item, active, scale }">
      <span
        :title="item.title"
        :style="{
          display: 'block',
          width: '18px',
          height: active ? '3px' : '2px',
          borderRadius: '2px',
          background: 'currentColor',
          opacity: active ? 1 : 0.35 + scale * 0.6,
          transform: `scaleX(${scale})`,
          transformOrigin: 'right center',
          transition:
            'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms',
        }"
      />
    </template>

    <template #preview="{ item, index }">
      <div style="display: flex; flex-direction: column; gap: 4px">
        <a-tag color="processing" style="align-self: flex-start">
          {{ index + 1 }}
        </a-tag>
        <strong>{{ item.title }}</strong>
        <a-typography-text type="secondary" style="font-size: 12px">
          {{ item.description }}
        </a-typography-text>
      </div>
    </template>

    <template #backToBottom="{ scrollToEnd }">
      <a-button type="primary" size="small" @click="scrollToEnd">
        Jump to latest
      </a-button>
    </template>

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
