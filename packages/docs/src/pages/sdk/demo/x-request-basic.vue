<script setup lang="ts">
import type { SSEOutput } from "@antdv-next/x-sdk";

import { XRequest } from "@antdv-next/x-sdk";
import { computed, ref } from "vue";

import { createMockSSEFetch, parseChunkContent } from "./shared";

const prompt = ref("Antdv Next X SDK request stream demo.");
const chunks = ref<string[]>([]);
const errorMessage = ref("");
const requesting = ref(false);

const request = XRequest<Record<string, string>, SSEOutput>("/api/mock/sse", {
  manual: true,
  fetch: createMockSSEFetch(),
  callbacks: {
    onUpdate(chunk) {
      chunks.value.push(parseChunkContent(chunk));
    },
    onSuccess() {
      requesting.value = false;
    },
    onError(error) {
      requesting.value = false;
      errorMessage.value = error.message;
    },
  },
});

const reply = computed(() => chunks.value.join(""));

function run() {
  chunks.value = [];
  errorMessage.value = "";
  requesting.value = true;
  request.run({ message: prompt.value });
}

function abort() {
  request.abort();
  requesting.value = false;
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-input
      v-model:value="prompt"
      placeholder="Input message"
      :disabled="requesting"
    />
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
        chunks: {{ chunks.length }}
      </a-typography-text>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
`XRequest` 基础流式请求示例，展示 `onUpdate` 与 `onSuccess` 的常见用法。
</docs>

<docs lang="en-US">
Basic `XRequest` streaming demo showing common usage of `onUpdate` and `onSuccess`.
</docs>
