<script setup lang="ts">
import { XStream } from "@antdv-next/x-sdk";
import { ref } from "vue";

const chunks = ref<string[]>([]);
const running = ref(false);

const SEPARATOR = "|";

function createPipeTransform(separator = "|") {
  let buffer = "";

  return new TransformStream<string, { text: string }>({
    transform(chunk, controller) {
      buffer += chunk;
      const parts = buffer.split(separator);
      const completed = parts.slice(0, -1);
      buffer = parts[parts.length - 1] || "";

      completed.forEach(part => {
        const text = part.trim();
        if (text) controller.enqueue({ text });
      });
    },
    flush(controller) {
      const text = buffer.trim();
      if (text) controller.enqueue({ text });
    },
  });
}

async function run() {
  chunks.value = [];
  running.value = true;

  const parts = ["custom|", "protocol|", "stream|", "demo|"];
  const encoder = new TextEncoder();

  let index = 0;
  const readableStream = new ReadableStream<Uint8Array>({
    start(controller) {
      const timer = setInterval(() => {
        if (index >= parts.length) {
          clearInterval(timer);
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(parts[index]));
        index += 1;
      }, 150);
    },
  });

  for await (const chunk of XStream<{ text: string }>({
    readableStream,
    transformStream: createPipeTransform(SEPARATOR),
  })) {
    chunks.value.push(chunk.text);
  }

  running.value = false;
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-alert
      type="info"
      show-icon
      message="Custom protocol: parse plain stream with separator"
    />
    <a-button type="primary" :loading="running" @click="run">
      Parse Custom Stream
    </a-button>
    <a-card size="small" title="Result">
      <pre style="margin: 0; white-space: pre-wrap">{{
        chunks.join("") || "-"
      }}</pre>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
自定义协议示例：通过 `transformStream` 解析非 SSE 数据。
</docs>

<docs lang="en-US">
Custom protocol demo: parse non-SSE data with `transformStream`.
</docs>
