<docs lang="zh-CN">
命令式滚动控制：宿主通过组件 `ref` 从外部进入会话——跳到被引用的历史消息、贴底、或恢复自动跟随。`scrollToItem` 定位后视口停在目标消息上，需要继续跟随再调用 `setFollowing(true)`。
</docs>

<docs lang="en-US">
Imperative scroll control: the host enters the transcript from outside through the component `ref` — jump to a quoted message, pin to the bottom, or restore auto-follow. `scrollToItem` leaves the viewport on the target message, and `setFollowing(true)` hands it back to the live edge.
</docs>

<script setup lang="ts">
import type { MessageScrollerRef } from "@antdv-next/x-pro";

import { MessageScroller } from "@antdv-next/x-pro";
import { ref } from "vue";

const messages = Array.from({ length: 12 }, (_, index) => ({
  id: `message-${index + 1}`,
  from: (index % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
  content: `Message ${index + 1}: this turn can be reached from outside the transcript, without rendering a rail.`,
}));

const scrollerRef = ref<MessageScrollerRef>();
const following = ref(true);

function jumpToQuoted() {
  scrollerRef.value?.scrollToItem("message-5");
}

function scrollToEnd() {
  scrollerRef.value?.scrollToEnd();
}

function resumeFollow() {
  scrollerRef.value?.setFollowing(true);
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
          Quoted "Message 5" lives above the current position.
        </a-typography-text>
      </a-space>
      <a-space>
        <a-button @click="jumpToQuoted"> scrollToItem('message-5') </a-button>
        <a-button @click="scrollToEnd"> scrollToEnd() </a-button>
        <a-button type="primary" @click="resumeFollow">
          setFollowing(true)
        </a-button>
      </a-space>
    </a-flex>

    <MessageScroller
      ref="scrollerRef"
      back-to-bottom
      :style="{
        height: '320px',
        border: '1px solid var(--ant-color-border)',
        borderRadius: '14px',
        background: 'var(--ant-color-bg-container)',
      }"
      @follow-change="following = $event"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        :data-message-id="message.id"
        style="padding: 8px 16px"
      >
        <div
          style="max-width: 78%; padding: 8px 12px; border-radius: 12px"
          :style="
            message.from === 'user'
              ? {
                  marginInlineStart: 'auto',
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
