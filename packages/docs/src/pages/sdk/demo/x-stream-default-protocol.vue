<script setup lang="ts">
import type { SSEOutput } from "@antdv-next/x-sdk";

import { XStream } from "@antdv-next/x-sdk";
import { ref } from "vue";

import { createTimedStream, parseChunkContent } from "./shared";

const chunks = ref<string[]>([]);
const running = ref(false);

function createSSEFrames(text: string, step = 6) {
  const frames: string[] = [];
  for (let index = 0; index < text.length; index += step) {
    const content = text.slice(index, Math.min(index + step, text.length));
    frames.push(
      `id: ${Math.floor(index / step) + 1}\n` +
        "event: delta\n" +
        `data: ${JSON.stringify({ content })}\n\n`,
    );
  }
  return frames;
}

async function run() {
  chunks.value = [];
  running.value = true;

  const readableStream = createTimedStream(
    createSSEFrames("x-stream default protocol demo."),
    160,
  );

  for await (const chunk of XStream<SSEOutput>({ readableStream })) {
    chunks.value.push(parseChunkContent(chunk));
  }

  running.value = false;
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-button type="primary" :loading="running" @click="run">
      Parse SSE Stream
    </a-button>
    <a-card size="small" title="Result">
      <pre style="margin: 0; white-space: pre-wrap">{{
        chunks.join("") || "-"
      }}</pre>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
默认协议示例：将 SSE `ReadableStream` 转为可迭代输出。
</docs>

<docs lang="en-US">
Default protocol demo: parse SSE `ReadableStream` into async iterable output.
</docs>
