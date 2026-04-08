<script setup lang="ts">
import { RedoOutlined, UserOutlined } from "@antdv-next/icons";
import { computed, onBeforeUnmount, ref } from "vue";

const text = "Antd Next X - Better UI toolkit for your AI Chat WebApp. ".repeat(
  5,
);
const loading = ref(true);
const source = ref("");
const streamContent = ref("");
const streaming = ref(false);
const typing = ref(false);
const disableStreaming = ref(false);
const count = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const bubbleStreaming = computed(() =>
  disableStreaming.value ? false : streaming.value,
);

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function clear() {
  clearTimer();
  loading.value = false;
  source.value = "";
  streamContent.value = "";
  streaming.value = false;
}

function start(step: number, interval: number) {
  clearTimer();
  loading.value = false;
  count.value = 0;
  source.value = `${Math.floor(Math.random() * 10)} - ${text}`;
  streamContent.value = "";
  streaming.value = true;

  timer = setInterval(() => {
    const nextLen = streamContent.value.length + step;
    if (nextLen < source.value.length) {
      streamContent.value = source.value.slice(0, nextLen);
      return;
    }

    streamContent.value = source.value;
    streaming.value = false;
    clearTimer();
  }, interval);
}

onBeforeUnmount(() => clearTimer());
</script>

<template>
  <a-space direction="vertical" style="display: flex; width: 100%" :size="10">
    <a-space align="center" wrap>
      <span>Streaming data:</span>
      <a-button type="primary" @click="start(2, 100)">
        <RedoOutlined />
        load slowly
      </a-button>
      <a-button @click="start(10, 50)">
        <RedoOutlined />
        load quickly
      </a-button>
      <a-button type="link" @click="clear"> clear </a-button>
    </a-space>

    <a-space align="center">
      <span>Force close streaming:</span>
      <a-switch v-model:checked="disableStreaming" />
    </a-space>

    <a-space align="center">
      <span>Enable typing animation:</span>
      <a-switch v-model:checked="typing" />
    </a-space>

    <a-space align="center">
      <span>onTypingComplete trigger times:</span>
      <a-typography-text type="danger">
        {{ count }}
      </a-typography-text>
    </a-space>

    <a-divider style="margin: 4px 0" />

    <ax-bubble
      :loading="loading"
      :content="streamContent"
      :streaming="bubbleStreaming"
      :typing="
        typing
          ? { effect: 'typing', step: 5, interval: 50, keepPrefix: true }
          : false
      "
      header="ADX"
      :on-typing-complete="
        () => {
          count += 1;
        }
      "
    >
      <template #avatar>
        <a-avatar size="small">
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </template>
    </ax-bubble>
  </a-space>
</template>

<docs lang="zh-CN">
流式传输。可以传递 `streaming` 来通知 Bubble 当前的 `content` 是否属于流式输入的。
</docs>

<docs lang="en-US">
Stream. `streaming` can be passed to tell Bubble if the current `content` is a streaming input.
</docs>
