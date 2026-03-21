<script setup lang="ts">
import { DeepSeekChatProvider, XRequest } from "@antdv-next/x-sdk";
import { ref } from "vue";

const provider = new DeepSeekChatProvider({
  request: XRequest("/api/mock/chat-provider/deepseek", {
    manual: true,
  }),
});

const transformedText = ref("");

function run() {
  const transformed = provider.transformMessage({
    originMessage: {
      role: "assistant",
      content: "",
    },
    chunk: {
      data: '{"choices":[{"delta":{"role":"assistant","reasoning_content":"I should think carefully.","content":"Here is the final answer."}}]}',
    },
    chunks: [],
    status: "loading",
    responseHeaders: new Headers({
      "content-type": "text/event-stream",
    }),
  } as any);

  transformedText.value = JSON.stringify(transformed, null, 2);
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-button type="primary" @click="run"
      >Run DeepSeekChatProvider Demo</a-button
    >

    <a-card size="small" title="transformMessage()">
      <pre style="margin: 0; white-space: pre-wrap">{{
        transformedText || "-"
      }}</pre>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
`DeepSeekChatProvider` 示例：展示 `reasoning_content` 到 `<think>` 内容的转换。
</docs>

<docs lang="en-US">
`DeepSeekChatProvider` demo showing `reasoning_content` to `<think>` conversion.
</docs>
