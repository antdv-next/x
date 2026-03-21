<script setup lang="ts">
import { OpenAIChatProvider, XRequest } from "@antdv-next/x-sdk";
import { ref } from "vue";

const provider = new OpenAIChatProvider({
  request: XRequest("/api/mock/chat-provider/openai-with-ui", {
    manual: true,
  }),
});

const input = ref("");
const output = ref("");

function submit() {
  const text = input.value.trim();
  if (!text) return;

  provider.injectGetMessages(
    () =>
      [
        {
          role: "user",
          content: text,
        },
      ] as any,
  );

  const transformed = provider.transformMessage({
    originMessage: {
      role: "assistant",
      content: "",
    },
    chunk: {
      data: JSON.stringify({
        choices: [
          {
            delta: {
              role: "assistant",
              content: `Reply for: ${text}`,
            },
          },
        ],
      }),
    },
    chunks: [],
    status: "loading",
    responseHeaders: new Headers({
      "content-type": "text/event-stream",
    }),
  } as any);

  output.value = transformed.content;
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-space compact style="width: 100%">
      <a-input
        v-model:value="input"
        placeholder="Ask something"
        @press-enter="submit"
      />
      <a-button type="primary" @click="submit">Submit</a-button>
    </a-space>

    <a-card size="small" title="Assistant Output">
      <a-typography-text>{{ output || "-" }}</a-typography-text>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
配合输入框的 OpenAI Provider 示例。
</docs>

<docs lang="en-US">
OpenAI provider demo with a simple input UI.
</docs>
