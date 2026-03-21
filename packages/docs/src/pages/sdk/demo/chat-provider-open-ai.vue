<script setup lang="ts">
import type { XModelParams } from "@antdv-next/x-sdk";

import { OpenAIChatProvider, XRequest } from "@antdv-next/x-sdk";
import { ref } from "vue";

const provider = new OpenAIChatProvider({
  request: XRequest("/api/mock/chat-provider/openai", {
    manual: true,
  }),
});

const paramsText = ref("");
const transformedText = ref("");

function run() {
  provider.injectGetMessages(
    () =>
      [
        {
          role: "user",
          content: "Write one sentence about chat providers.",
        },
      ] as any,
  );

  const params = provider.transformParams(
    {
      temperature: 0.2,
    } as Partial<XModelParams>,
    {
      params: {
        model: "gpt-4o-mini",
      },
    } as any,
  );

  const transformed = provider.transformMessage({
    originMessage: {
      role: "assistant",
      content: "",
    },
    chunk: {
      data: '{"choices":[{"delta":{"role":"assistant","content":"OpenAI provider parsed this SSE chunk."}}]}',
    },
    chunks: [],
    status: "loading",
    responseHeaders: new Headers({
      "content-type": "text/event-stream",
    }),
  } as any);

  paramsText.value = JSON.stringify(params, null, 2);
  transformedText.value = JSON.stringify(transformed, null, 2);
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-button type="primary" @click="run">Run OpenAIChatProvider Demo</a-button>

    <a-card size="small" title="transformParams()">
      <pre style="margin: 0; white-space: pre-wrap">{{
        paramsText || "-"
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
`OpenAIChatProvider` 示例：展示参数合并和 OpenAI SSE 增量消息转换。
</docs>

<docs lang="en-US">
`OpenAIChatProvider` demo showing param merging and OpenAI SSE chunk transformation.
</docs>
