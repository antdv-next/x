<script setup lang="ts">
import { XRequest } from "@antdv-next/x-sdk";
import { computed, ref } from "vue";

import { createPipeProtocolFetch, createPipeTransform } from "./shared";

const prompt = ref("custom transformer in XRequest");
const chunks = ref<string[]>([]);
const requesting = ref(false);

const request = XRequest<Record<string, string>, { text: string }>(
  "/api/mock/custom",
  {
    manual: true,
    fetch: createPipeProtocolFetch(),
    transformStream: () => createPipeTransform("|"),
    callbacks: {
      onUpdate(chunk) {
        chunks.value.push(chunk.text);
      },
      onSuccess() {
        requesting.value = false;
      },
      onError() {
        requesting.value = false;
      },
    },
  },
);

const merged = computed(() => chunks.value.join(""));

function run() {
  chunks.value = [];
  requesting.value = true;
  request.run({ message: prompt.value, separator: "|" });
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-input
      v-model:value="prompt"
      placeholder="Input plain stream text"
      :disabled="requesting"
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
