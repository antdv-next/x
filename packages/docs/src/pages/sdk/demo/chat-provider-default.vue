<script setup lang="ts">
import { DefaultChatProvider, XRequest } from "@antdv-next/x-sdk";
import { ref } from "vue";

const provider = new DefaultChatProvider<any, any, any>({
  request: XRequest("/api/mock/chat-provider/default", {
    manual: true,
  }),
});

const paramsText = ref("");
const localMessageText = ref("");
const transformedText = ref("");

function run() {
  const params = provider.transformParams(
    {
      query: "Hello from request",
    },
    {
      params: {
        language: "zh-CN",
      },
    } as any,
  );

  const localMessage = provider.transformLocalMessage({
    role: "user",
    content: "Hello from local message",
  });

  const transformed = provider.transformMessage({
    originMessage: {
      role: "assistant",
      content: "",
    },
    chunk: {
      role: "assistant",
      content: "This content is transformed by DefaultChatProvider.",
    },
    chunks: [],
    status: "loading",
    responseHeaders: new Headers(),
  } as any);

  paramsText.value = JSON.stringify(params, null, 2);
  localMessageText.value = JSON.stringify(localMessage, null, 2);
  transformedText.value = JSON.stringify(transformed, null, 2);
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-button type="primary" @click="run"
      >Run DefaultChatProvider Demo</a-button
    >

    <a-card size="small" title="transformParams()">
      <pre style="margin: 0; white-space: pre-wrap">{{
        paramsText || "-"
      }}</pre>
    </a-card>

    <a-card size="small" title="transformLocalMessage()">
      <pre style="margin: 0; white-space: pre-wrap">{{
        localMessageText || "-"
      }}</pre>
    </a-card>

    <a-card size="small" title="transformMessage()">
      <pre style="margin: 0; white-space: pre-wrap">{{
        transformedText || "-"
      }}</pre>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
`DefaultChatProvider` 基础示例：展示 `transformParams`、`transformLocalMessage`、`transformMessage` 的最小行为。
</docs>

<docs lang="en-US">
`DefaultChatProvider` basic demo showing `transformParams`, `transformLocalMessage`, and `transformMessage`.
</docs>
