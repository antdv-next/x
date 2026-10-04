<docs lang="zh-CN">
基础用法：跟随与导轨由同一个视口提供，推荐一起开启。内容流入时自动贴底，上滑即脱离跟随并出现「回到最新」，右侧导轨把每条消息变成一个跳转目标。
</docs>

<docs lang="en-US">
Basic usage: follow and the rail are two capabilities of the same viewport and are meant to be enabled together. Streamed content stays pinned to the bottom, scrolling away detaches follow and reveals "back to latest", and the rail turns every message into a jump target.
</docs>

<script setup lang="ts">
import type { MessageScrollerItem } from "@antdv-next/x-pro";

import { MessageScroller } from "@antdv-next/x-pro";
import { computed, onBeforeUnmount, ref } from "vue";

interface DemoMessage {
  id: string;
  from: "user" | "assistant";
  content: string;
}

const turns: Array<[string, string]> = [
  [
    "What should the first release include?",
    "Start with the smallest workflow that still feels complete.",
  ],
  [
    "Include streaming and recovery states too.",
    "Yes — those states are what make a first version feel dependable.",
  ],
  [
    "How should we present tool results?",
    "Keep every result next to the action that produced it.",
  ],
  [
    "What about actions that need confirmation?",
    "Pause the run, explain the impact, and ask before continuing.",
  ],
  [
    "Can the transcript stay easy to navigate?",
    "Follow the live edge by default, and let the rail carry you back through history.",
  ],
];

const messages = ref<DemoMessage[]>(
  turns.flatMap(([question, answer], index) => [
    {
      id: `message-${index * 2 + 1}`,
      from: "user" as const,
      content: question,
    },
    {
      id: `message-${index * 2 + 2}`,
      from: "assistant" as const,
      content: answer,
    },
  ]),
);

/** 导轨元数据：`id` 与消息节点上的 `data-message-id` 一一对应，内容跟随流式更新。 */
const items = computed<MessageScrollerItem[]>(() =>
  messages.value.map((message, index) => ({
    id: message.id,
    title: `${message.from === "user" ? "You" : "Assistant"} · #${index + 1}`,
    description: message.content || "Streaming…",
  })),
);

const replies = [
  "The viewport keeps following while you stay at the live edge. Scroll up while this reply streams and your reading position stays put.",
  "Navigation stays cheap because the rail measures the rendered message nodes instead of duplicating their content.",
  "Detaching is explicit: wheel, touch, keyboard, and native scrollbar drags all release follow mode.",
];

const busy = ref(false);
const following = ref(true);
let seed = messages.value.length;
let replyIndex = 0;
let timer: number | undefined;

function stopStreaming() {
  if (timer !== undefined) {
    window.clearInterval(timer);
    timer = undefined;
  }
}

function send() {
  stopStreaming();

  seed += 1;
  messages.value.push({
    id: `message-${seed}`,
    from: "user",
    content: "Show me the next streaming state.",
  });

  seed += 1;
  const replyId = `message-${seed}`;
  const reply = replies[replyIndex++ % replies.length] ?? "";
  messages.value.push({ id: replyId, from: "assistant", content: "" });
  busy.value = true;

  let cursor = 0;
  timer = window.setInterval(() => {
    cursor += 4;
    const message = messages.value.find(item => item.id === replyId);
    if (message) {
      message.content = reply.slice(0, cursor);
    }

    if (cursor >= reply.length) {
      stopStreaming();
      busy.value = false;
    }
  }, 60);
}

onBeforeUnmount(stopStreaming);
</script>

<template>
  <div>
    <a-flex justify="space-between" align="center" style="margin-bottom: 12px">
      <a-space>
        <a-tag :color="following ? 'success' : 'warning'">
          {{ following ? "Following" : "Detached" }}
        </a-tag>
        <a-typography-text type="secondary">
          {{ busy ? "Streaming…" : "Idle" }}
        </a-typography-text>
      </a-space>
      <a-button type="primary" :disabled="busy" @click="send"> Send </a-button>
    </a-flex>

    <MessageScroller
      navigation="rail"
      back-to-bottom
      :busy="busy"
      :items="items"
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
          <a-typography-text>{{ message.content || "…" }}</a-typography-text>
        </div>
      </div>
    </MessageScroller>
  </div>
</template>
