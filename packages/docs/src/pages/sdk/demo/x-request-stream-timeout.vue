<script setup lang="ts">
import type { SSEOutput } from "@antdv-next/x-sdk";

import { XRequest } from "@antdv-next/x-sdk";
import { computed, ref } from "vue";

import { createMockSSEFetch, parseChunkContent } from "./shared";

const chunks = ref<string[]>([]);
const errorMessage = ref("");
const requesting = ref(false);

const request = XRequest<Record<string, string>, SSEOutput>("/api/mock/sse", {
  manual: true,
  streamTimeout: 300,
  fetch: createMockSSEFetch({
    interval: 900,
  }),
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

const text = computed(() => chunks.value.join(""));

function run() {
  chunks.value = [];
  errorMessage.value = "";
  requesting.value = true;
  request.run({ message: "stream timeout demo" });
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-alert
      type="warning"
      show-icon
      message="streamTimeout=300ms, mock chunk interval=900ms"
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
      <pre style="margin: 0; white-space: pre-wrap">{{ text || "-" }}</pre>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
`streamTimeout` 示例：当 chunk 间隔超过阈值时触发超时错误。
</docs>

<docs lang="en-US">
`streamTimeout` demo: triggers timeout when chunk interval exceeds the threshold.
</docs>
