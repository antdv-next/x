<script setup lang="ts">
import { XRequest } from "@antdv-next/x-sdk";
import { computed, ref } from "vue";

const prompt = ref("custom transformer in XRequest");
const chunks = ref<string[]>([]);
const requesting = ref(false);
const requestStatus = ref("");

// 自定义 pipe 协议分隔符
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

const request = XRequest<Record<string, string>, { text: string }>(
  "/api/mock/custom",
  {
    manual: true,
    fetch: async (_baseURL, options) => {
      const params = (options.params ?? {}) as Record<string, string>;
      const text = String(params.message ?? "custom transform stream demo");
      const separator = String(params.separator ?? SEPARATOR);

      const step = 5;
      const interval = 150;
      const encoder = new TextEncoder();

      const parts: string[] = [];
      for (let i = 0; i < text.length; i += step) {
        const piece = text.slice(i, Math.min(i + step, text.length));
        parts.push(piece + separator);
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
            "Content-Type": "text/plain",
          },
        },
      );
    },
    transformStream: () => createPipeTransform(SEPARATOR),
    callbacks: {
      onUpdate(chunk) {
        chunks.value.push(chunk.text);
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
  },
);

const merged = computed(() => chunks.value.join(""));

function run() {
  chunks.value = [];
  requesting.value = true;
  requestStatus.value = "pending";
  request.run({ message: prompt.value, separator: SEPARATOR });
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-input
      v-model:value="prompt"
      placeholder="Input plain stream text"
      :disabled="requesting"
    />
    <a-alert
      type="info"
      show-icon
      message="Using custom transformStream with separator: {{ SEPARATOR }}"
    />
    <a-button type="primary" :loading="requesting" @click="run">
      Run Custom Transform
    </a-button>

    <a-card size="small" title="Transformed Output">
      <a-typography-paragraph style="margin-bottom: 8px">
        {{ merged || "No data yet." }}
      </a-typography-paragraph>
      <a-typography-text type="secondary">
        pieces: {{ chunks.length }}
      </a-typography-text>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
使用 `transformStream` 解析自定义协议（示例使用 `|` 作为分隔符）。
</docs>

<docs lang="en-US">
Use `transformStream` to parse a custom protocol (`|` as separator in this demo).
</docs>
