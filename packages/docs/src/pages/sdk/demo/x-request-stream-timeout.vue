<script setup lang="ts">
import type { SSEOutput } from "@antdv-next/x-sdk";

import { XRequest } from "@antdv-next/x-sdk";
import { computed, ref } from "vue";

const chunks = ref<string[]>([]);
const errorMessage = ref("");
const requesting = ref(false);
const requestStatus = ref("");

// streamTimeout=300ms, mock chunk interval=900ms
const STREAM_TIMEOUT = 300;
const CHUNK_INTERVAL = 900;

const request = XRequest<Record<string, string>, SSEOutput>("/api/mock/sse", {
  manual: true,
  streamTimeout: STREAM_TIMEOUT,
  fetch: async (_baseURL, options) => {
    const text = "stream timeout demo.";
    const step = 6;
    const encoder = new TextEncoder();

    const parts: string[] = [];
    for (let i = 0; i < text.length; i += step) {
      const piece = text.slice(i, Math.min(i + step, text.length));
      const frame = `id: ${Math.floor(i / step) + 1}\nevent: delta\ndata: ${JSON.stringify({ content: piece })}\n\n`;
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
          }, CHUNK_INTERVAL);
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
      errorMessage.value = error.message;
    },
  },
});

const text = computed(() => chunks.value.join(""));

function run() {
  chunks.value = [];
  errorMessage.value = "";
  requesting.value = true;
  requestStatus.value = "pending";
  request.run({ message: "stream timeout demo" });
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-alert
      type="warning"
      show-icon
      :message="`streamTimeout=${STREAM_TIMEOUT}ms, mock chunk interval=${CHUNK_INTERVAL}ms`"
    />
    <a-button type="primary" :loading="requesting" @click="run">
      Trigger Stream Timeout
    </a-button>
    <a-alert
      v-if="errorMessage"
      type="error"
      show-icon
      :message="errorMessage"
    />
    <a-card size="small" title="Received Before Timeout">
      <a-typography-paragraph style="margin-bottom: 8px">
        {{ text || "-" }}
      </a-typography-paragraph>
      <a-typography-text type="secondary">
        chunks: {{ chunks.length }} | status: {{ requestStatus }}
      </a-typography-text>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
`streamTimeout` 示例：当 chunk 间隔超过阈值时触发超时错误。
</docs>

<docs lang="en-US">
`streamTimeout` demo: triggers timeout when chunk interval exceeds the threshold.
</docs>
