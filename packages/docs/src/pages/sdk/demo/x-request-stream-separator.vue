<script setup lang="ts">
import type { SSEOutput } from "@antdv-next/x-sdk";

import { XRequest } from "@antdv-next/x-sdk";
import { computed, ref } from "vue";

const chunks = ref<string[]>([]);
const requesting = ref(false);
const requestStatus = ref("");

// 自定义分隔符
const STREAM_SEP = "<END>";
const PART_SEP = "<PART>";
const KV_SEP = "=";

const request = XRequest<Record<string, string>, SSEOutput>("/api/mock/sse", {
  manual: true,
  streamSeparator: STREAM_SEP,
  partSeparator: PART_SEP,
  kvSeparator: KV_SEP,
  fetch: async (_baseURL, options) => {
    const text = "separator config works with custom protocol.";
    const step = 6;
    const interval = 160;
    const encoder = new TextEncoder();

    const parts: string[] = [];
    for (let i = 0; i < text.length; i += step) {
      const piece = text.slice(i, Math.min(i + step, text.length));
      const id = Math.floor(i / step) + 1;
      // 使用自定义分隔符构建 SSE 帧
      const frame =
        [
          `id${KV_SEP} ${id}`,
          `event${KV_SEP} delta`,
          `data${KV_SEP} ${JSON.stringify({ content: piece })}`,
        ].join(PART_SEP) + STREAM_SEP;
      parts.push(frame);
    }

    let index = 0;
    return new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          const timer = setInterval(() => {
            if (index >= parts.length) {
              clearInterval(timer);
              controller.close();
              return;
            }
            controller.enqueue(encoder.encode(parts[index]));
            index += 1;
          }, interval);
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
        },
      },
    );
  },
  callbacks: {
    onUpdate(chunk) {
      const content =
        typeof chunk.data === "string"
          ? JSON.parse(chunk.data)?.content || chunk.data
          : "";
      chunks.value.push(content);
    },
    onSuccess() {
      requesting.value = false;
      requestStatus.value = "success";
    },
    onError(error) {
      requesting.value = false;
      requestStatus.value = "error";
    },
  },
});

const text = computed(() => chunks.value.join(""));

function run() {
  chunks.value = [];
  requesting.value = true;
  requestStatus.value = "pending";
  request.run({ message: "separator config works with custom protocol." });
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-alert
      type="info"
      show-icon
      :message="`streamSeparator=${STREAM_SEP}, partSeparator=${PART_SEP}, kvSeparator=${KV_SEP}`"
    />
    <a-button type="primary" :loading="requesting" @click="run">
      Run With Custom Separators
    </a-button>

    <a-card size="small" title="Parsed Text">
      <pre style="margin: 0; white-space: pre-wrap">{{ text || "-" }}</pre>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
展示 `streamSeparator`、`partSeparator`、`kvSeparator` 的配置方式。
</docs>

<docs lang="en-US">
Shows how to configure `streamSeparator`, `partSeparator`, and `kvSeparator`.
</docs>
