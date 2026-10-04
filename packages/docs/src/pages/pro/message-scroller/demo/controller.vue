<docs lang="zh-CN">
命令式控制：通过组件 `ref` 定位历史消息、贴底或恢复自动跟随，适合「跳到引用消息」这类外部入口；跳转时导轨刻度同步点亮。
</docs>

<docs lang="en-US">
Imperative control: use the component `ref` to jump to a message, pin to the bottom, or restore auto-follow — handy for "jump to quoted message" entries, with the rail keeping the active tick in sync.
</docs>

<script setup lang="ts">
import type {
  MessageScrollerItem,
  MessageScrollerRef,
} from "@antdv-next/x-pro";

import { MessageScroller } from "@antdv-next/x-pro";
import { ref } from "vue";

const scrollerRef = ref<MessageScrollerRef>();

const messages = Array.from({ length: 12 }, (_, index) => ({
  id: `message-${index + 1}`,
  from: index % 2 === 0 ? "user" : "assistant",
  content: `Message ${index + 1}: the reader can jump here from outside the transcript.`,
}));

const items: MessageScrollerItem[] = messages.map((message, index) => ({
  id: message.id,
  title: `Message ${index + 1}`,
  description: message.content,
}));

function jumpToLast() {
  scrollerRef.value?.scrollToItem(`message-${messages.length}`);
}

function jumpToMiddle() {
  scrollerRef.value?.scrollToItem("message-6");
}

function followLatest() {
  scrollerRef.value?.setFollowing(true);
}
</script>

<template>
  <div>
    <a-space style="margin-bottom: 12px">
      <a-button @click="jumpToMiddle"> scrollToItem('message-6') </a-button>
      <a-button @click="jumpToLast"> scrollToItem(last) </a-button>
      <a-button type="primary" @click="followLatest">
        setFollowing(true)
      </a-button>
    </a-space>

    <MessageScroller
      ref="scrollerRef"
      navigation="rail"
      :items="items"
      back-to-bottom
      :style="{
        height: '300px',
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
