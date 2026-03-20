<script setup lang="ts">
import type { SSEOutput } from "@antdv-next/x-sdk";

import { XStream } from "@antdv-next/x-sdk";
import { ref } from "vue";

const chunks = ref<string[]>([]);
const running = ref(false);

const STREAM_SEP = "\n\n";
const PART_SEP = "\n";
const KV_SEP = ":";

function createSSEFrames(text: string, step = 6) {
  const frames: string[] = [];
  for (let i = 0; i < text.length; i += step) {
    const content = text.slice(i, Math.min(i + step, text.length));
    const id = Math.floor(i / step) + 1;
    frames.push(
      `id${KV_SEP} ${id}${PART_SEP}event${KV_SEP} delta${PART_SEP}data${KV_SEP} ${JSON.stringify({ content })}${STREAM_SEP}`,
    );
  }
  return frames;
}

async function run() {
  chunks.value = [];
  running.value = true;

  const text = "x-stream default protocol demo.";
  const step = 6;
  const interval = 160;

  const frames = createSSEFrames(text, step);
  const encoder = new TextEncoder();

  let index = 0;
  const readableStream = new ReadableStream<Uint8Array>({
    start(controller) {
      const timer = setInterval(() => {
        if (index >= frames.length) {
          clearInterval(timer);
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(frames[index]));
        index += 1;
      }, interval);
    },
  });

  for await (const chunk of XStream<SSEOutput>({ readableStream })) {
    const content =
      typeof chunk.data === "string"
        ? JSON.parse(chunk.data)?.content || chunk.data
        : "";
    chunks.value.push(content);
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
