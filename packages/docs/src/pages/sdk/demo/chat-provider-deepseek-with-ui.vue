<script setup lang="ts">
import { DeepSeekChatProvider, XRequest } from "@antdv-next/x-sdk";
import { ref } from "vue";

const provider = new DeepSeekChatProvider({
  request: XRequest("/api/mock/chat-provider/deepseek-with-ui", {
    manual: true,
  }),
});

const thinking = ref("");
const answer = ref("");

function run() {
  const step1 = provider.transformMessage({
    originMessage: {
      role: "assistant",
      content: "",
    },
    chunk: {
      data: '{"choices":[{"delta":{"reasoning_content":"Analyzing the prompt..."}}]}',
    },
    chunks: [],
    status: "loading",
    responseHeaders: new Headers({
      "content-type": "text/event-stream",
    }),
  } as any);

  const step2 = provider.transformMessage({
    originMessage: step1,
    chunk: {
      data: '{"choices":[{"delta":{"content":"Done. This is the final response."}}]}',
    },
    chunks: [],
    status: "loading",
    responseHeaders: new Headers({
      "content-type": "text/event-stream",
    }),
  } as any);

  thinking.value = step1.content;
  answer.value = step2.content;
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-button type="primary" @click="run">Run Think Workflow</a-button>

    <a-card size="small" title="Thinking Stage">
      <pre style="margin: 0; white-space: pre-wrap">{{ thinking || "-" }}</pre>
    </a-card>

    <a-card size="small" title="Completed Stage">
      <pre style="margin: 0; white-space: pre-wrap">{{ answer || "-" }}</pre>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
演示 DeepSeek Provider 的思考阶段与回答阶段衔接。
</docs>

<docs lang="en-US">
Demonstrates DeepSeek provider thinking stage and final answer stage.
</docs>
