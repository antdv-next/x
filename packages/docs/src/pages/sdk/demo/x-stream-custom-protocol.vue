<script setup lang="ts">
import { XStream } from "@antdv-next/x-sdk";
import { ref } from "vue";

import { createPipeTransform, createTimedStream } from "./shared";

const chunks = ref<string[]>([]);
const running = ref(false);

async function run() {
  chunks.value = [];
  running.value = true;

  const readableStream = createTimedStream(
    ["custom|", "protocol|", "stream|", "demo|"],
    150,
  );

  for await (const chunk of XStream<{ text: string }>({
    readableStream,
    transformStream: createPipeTransform("|"),
  })) {
    chunks.value.push(chunk.text);
  }

  running.value = false;
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
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
