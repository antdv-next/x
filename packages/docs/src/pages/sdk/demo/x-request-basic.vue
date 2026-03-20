<script setup lang="ts">
import type { SSEOutput } from "@antdv-next/x-sdk";

import { XRequest } from "@antdv-next/x-sdk";
import { computed, ref } from "vue";

const chunks = ref<string[]>([]);
const errorMessage = ref("");
const requesting = ref(false);
const requestStatus = ref("");

const request = XRequest<Record<string, string>, SSEOutput>("/api/mock/sse", {
  manual: true,
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
      errorMessage.value = error.message;
    },
  },
  fetch: async (_baseURL, options) => {
    const text = "XRequest basic streaming demo.";
    const step = 6;
    const interval = 160;

    const parts: string[] = [];
    for (let i = 0; i < text.length; i += step) {
      const piece = text.slice(i, Math.min(i + step, text.length));
      const frame = `id: ${Math.floor(i / step) + 1}\nevent: delta\ndata: ${JSON.stringify({ content: piece })}\n\n`;
      parts.push(frame);
    }

    const encoder = new TextEncoder();
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
});

const reply = computed(() => chunks.value.join(""));

function run() {
  chunks.value = [];
  errorMessage.value = "";
  requestStatus.value = "pending";
  requesting.value = true;
  request.run({ message: "hello" });
}

function abort() {
  request.abort();
  requesting.value = false;
  requestStatus.value = "aborted";
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-space>
      <a-button type="primary" :loading="requesting" @click="run">
        Run Request
      </a-button>
      <a-button :disabled="!requesting" @click="abort">Abort</a-button>
    </a-space>

    <a-alert
      v-if="errorMessage"
      type="error"
      show-icon
      :message="errorMessage"
    />

    <a-card size="small" title="Streaming Result">
      <a-typography-paragraph style="margin-bottom: 8px">
        {{ reply || "No data yet." }}
      </a-typography-paragraph>
      <a-typography-text type="secondary">
        chunks: {{ chunks.length }} | status: {{ requestStatus }}
      </a-typography-text>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
`XRequest` 基础流式请求示例：展示 `manual` 模式、`onUpdate`、`onSuccess`、`onError` 回调的基本用法。
</docs>

<docs lang="en-US">
Basic `XRequest` streaming demo: shows `manual` mode with `onUpdate`, `onSuccess`, and `onError` callbacks.
</docs>
