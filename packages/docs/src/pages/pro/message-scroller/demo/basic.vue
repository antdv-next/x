<docs lang="zh-CN">
基础用法：视口承载会话内容，流式推入时自动贴底，右侧导轨随消息增长同步生成刻度；点击「发送」可以看到内容逐字流入。
</docs>

<docs lang="en-US">
Basic usage: the viewport hosts the transcript and pins itself to the bottom while content streams in, and the rail grows with every new message. Click "Send" to see a reply stream in.
</docs>

<script setup lang="ts">
import type { MessageScrollerItem } from "@antdv-next/x-pro";

import { MessageScroller } from "@antdv-next/x-pro";
import { computed, ref } from "vue";

interface DemoMessage {
  id: string;
  from: "user" | "assistant";
  content: string;
}

const messages = ref<DemoMessage[]>([
  {
    id: "message-1",
    from: "user",
    content: "What should the first release include?",
  },
  {
    id: "message-2",
    from: "assistant",
    content: "Start with the smallest workflow that still feels complete.",
  },
  {
    id: "message-3",
    from: "user",
    content: "Include streaming and recovery states too.",
  },
  {
    id: "message-4",
    from: "assistant",
    content: "Yes. Those states make the first version feel dependable.",
  },
  {
    id: "message-5",
    from: "user",
    content: "How should we present tool results?",
  },
  {
    id: "message-6",
    from: "assistant",
    content: "Keep results close to the action that produced them.",
  },
]);

const replies = [
  "The viewport follows while you stay at the live edge. Scroll upward while this response streams and it will leave your reading position alone.",
  "Navigation stays cheap because the rail measures rendered message nodes instead of duplicating their content.",
  "Detaching is explicit: wheel, touch, keyboard, and native scrollbar drags all release follow mode.",
];

const busy = ref(false);
let seed = messages.value.length;
let replyIndex = 0;
let timer: number | undefined;

const items = computed<MessageScrollerItem[]>(() =>
  messages.value.map(message => ({
    id: message.id,
    title: message.content || "…",
  })),
);

function send() {
  if (timer !== undefined) {
    window.clearInterval(timer);
  }

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
    cursor += 6;
    const content = reply.slice(0, cursor);
    messages.value = messages.value.map(message =>
      message.id === replyId ? { ...message, content } : message,
    );

    if (cursor >= reply.length) {
      window.clearInterval(timer);
      timer = undefined;
      busy.value = false;
    }
  }, 50);
}
</script>

<template>
  <div>
    <a-flex justify="space-between" align="center" style="margin-bottom: 12px">
      <a-typography-text type="secondary">
        {{ busy ? "Streaming…" : "Streaming stopped" }}
      </a-typography-text>
      <a-space>
        <a-button type="primary" :disabled="busy" @click="send">
          Send
        </a-button>
      </a-space>
    </a-flex>

    <MessageScroller
      navigation="rail"
      :items="items"
      :busy="busy"
      back-to-bottom
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
        :data-from="message.from"
        style="padding: 8px 16px"
      >
        <div
          style="max-width: 78%; padding: 8px 12px; border-radius: 12px"
          :style="
            message.from === 'user'
              ? {
                  marginLeft: 'auto',
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
