<script setup lang="ts">
import { DefaultChatProvider, XRequest } from "@antdv-next/x-sdk";
import { ref } from "vue";

const provider = new DefaultChatProvider<any, any, any>({
  request: XRequest("/api/mock/chat-provider/default-with-ui", {
    manual: true,
  }),
});

const input = ref("");
const messages = ref<Array<{ role: string; content: string }>>([]);

function send() {
  const text = input.value.trim();
  if (!text) return;

  const userMessage = provider.transformLocalMessage({
    role: "user",
    content: text,
  });

  const assistantMessage = provider.transformMessage({
    originMessage: {
      role: "assistant",
      content: "",
    },
    chunk: {
      role: "assistant",
      content: `Echo: ${text}`,
    },
    chunks: [],
    status: "loading",
    responseHeaders: new Headers(),
  } as any);

  messages.value.push(userMessage, assistantMessage);
  input.value = "";
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-space compact style="width: 100%">
      <a-input
        v-model:value="input"
        placeholder="Type a message"
        @press-enter="send"
      />
      <a-button type="primary" @click="send">Send</a-button>
    </a-space>

    <a-card size="small" title="Messages">
      <a-empty v-if="!messages.length" description="No messages yet" />
      <a-list v-else :data-source="messages" size="small" bordered>
        <template #renderItem="{ item }">
          <a-list-item>
            <a-typography-text strong>{{ item.role }}:</a-typography-text>
            <a-typography-text style="margin-left: 8px">{{
              item.content
            }}</a-typography-text>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
配合基础 UI 的示例：用户输入消息后，展示默认 Provider 的本地消息和转换结果。
</docs>

<docs lang="en-US">
Default provider with simple UI: enter a message and view local/assistant transformed messages.
</docs>
