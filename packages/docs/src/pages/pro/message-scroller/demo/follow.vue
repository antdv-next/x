<docs lang="zh-CN">
跟随状态：用 `v-model:follow` 接管状态，`followChange` 实时上报每次变化。脱离跟随后继续流入的内容不会推动视口，宿主可据此累计未读——点击导轨中的历史刻度会脱离，点到最新一条则回到跟随。
</docs>

<docs lang="en-US">
Following state: take over the state with `v-model:follow` and observe every transition through `followChange`. While detached, incoming content never moves the viewport, which is what makes an unread counter possible — clicking a historical rail tick detaches, clicking the newest one resumes following.
</docs>

<script setup lang="ts">
import type {
  MessageScrollerItem,
  MessageScrollerRef,
} from "@antdv-next/x-pro";

import { MessageScroller } from "@antdv-next/x-pro";
import { computed, onBeforeUnmount, ref } from "vue";

interface DemoMessage {
  id: string;
  from: "user" | "assistant";
  content: string;
}

const turns: Array<[string, string]> = [
  [
    "Draft the release checklist.",
    "Ship the smallest complete loop: send, stream, recover, navigate.",
  ],
  [
    "Where does recovery live?",
    "Recovery belongs to the host: retry the request, then push the failed turn back in.",
  ],
  [
    "How do we keep reading history calm?",
    "Never move the viewport while the reader is detached — that is the whole contract.",
  ],
  [
    "What drives the unread badge?",
    "Count every message that arrives while you are detached, and clear it on re-entry.",
  ],
  [
    "Do we need our own scrollbar?",
    "No. The viewport is native, so drag, inertia, and keyboard all work for free.",
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

const items = computed<MessageScrollerItem[]>(() =>
  messages.value.map((message, index) => ({
    id: message.id,
    title: `${message.from === "user" ? "You" : "Assistant"} · #${index + 1}`,
    description: message.content || "Streaming…",
  })),
);

const replies = [
  "This reply keeps streaming while the viewport stays exactly where you left it, so you can finish the paragraph you were reading.",
  "Every streamed chunk grows the content box; with follow detached the growth is measured but never applied to the scroll position.",
  "Resuming is a single call: the viewport jumps to the live edge and the unread counter goes back to zero.",
];

const scrollerRef = ref<MessageScrollerRef>();
const busy = ref(false);
const following = ref(true);
const unread = ref(0);
const changeCount = ref(0);
let seed = messages.value.length;
let replyIndex = 0;
let timer: number | undefined;

function stopStreaming() {
  if (timer !== undefined) {
    window.clearInterval(timer);
    timer = undefined;
  }
}

/** 脱离跟随时到达的消息计入未读，回到跟随态后清零。 */
function append(message: DemoMessage) {
  messages.value.push(message);
  if (!following.value) {
    unread.value += 1;
  }
}

function send() {
  stopStreaming();

  seed += 1;
  append({
    id: `message-${seed}`,
    from: "user",
    content: "Stream another reply while I read the history.",
  });

  seed += 1;
  const replyId = `message-${seed}`;
  const reply = replies[replyIndex++ % replies.length] ?? "";
  append({ id: replyId, from: "assistant", content: "" });
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

/**
 * 状态只有组件一个写入方：按钮与导轨都调用实例方法，每次跳变都会回到 `followChange`。
 */
function handleFollowChange(value: boolean) {
  following.value = value;
  changeCount.value += 1;
  if (value) {
    unread.value = 0;
  }
}

function detach() {
  scrollerRef.value?.setFollowing(false);
}

function resume() {
  scrollerRef.value?.setFollowing(true);
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
        <a-tag v-if="!following" color="error">{{ unread }} unread</a-tag>
        <a-typography-text type="secondary">
          followChange × {{ changeCount }}
        </a-typography-text>
      </a-space>
      <a-space>
        <a-button v-if="following" @click="detach"> Detach </a-button>
        <a-button v-else @click="resume"> Resume follow </a-button>
        <a-button type="primary" :disabled="busy" @click="send">
          Send
        </a-button>
      </a-space>
    </a-flex>

    <MessageScroller
      ref="scrollerRef"
      v-model:follow="following"
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
      @follow-change="handleFollowChange"
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
