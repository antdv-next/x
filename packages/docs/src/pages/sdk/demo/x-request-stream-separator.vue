<script setup lang="ts">
import type { SSEOutput } from "@antdv-next/x-sdk";

import { XRequest } from "@antdv-next/x-sdk";
import { computed, ref } from "vue";

import { createMockSSEFetch, parseChunkContent } from "./shared";

const chunks = ref<string[]>([]);
const requesting = ref(false);

const separators = {
  streamSeparator: "<END>",
  partSeparator: "<PART>",
  kvSeparator: "=",
};

const request = XRequest<Record<string, string>, SSEOutput>("/api/mock/sse", {
  manual: true,
  fetch: createMockSSEFetch(separators),
  ...separators,
  callbacks: {
    onUpdate(chunk) {
      chunks.value.push(parseChunkContent(chunk));
    },
    onSuccess() {
      requesting.value = false;
    },
    onError() {
      requesting.value = false;
    },
  },
});

const text = computed(() => chunks.value.join(""));

function run() {
  chunks.value = [];
  requesting.value = true;
  request.run({ message: "separator config works with custom protocol." });
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-alert
      type="info"
      show-icon
      message="streamSeparator=<END>, partSeparator=<PART>, kvSeparator=="
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
