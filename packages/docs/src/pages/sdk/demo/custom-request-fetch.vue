<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";
import type { XRequestOptions } from "@antdv-next/x-sdk";

import { BubbleList, Sender } from "@antdv-next/x";
import { DefaultChatProvider, useXChat, XRequest } from "@antdv-next/x-sdk";
import { Flex } from "antdv-next";
import { computed, ref } from "vue";

interface ChatInput {
  query: string;
  stream: false;
  role: "user";
}

interface ChatOutput {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

type MessageType = ChatInput | ChatOutput;

const content = ref("");

const provider = new DefaultChatProvider<MessageType, ChatInput, ChatOutput>({
  request: XRequest<ChatInput, ChatOutput>(
    "https://api.x.ant.design/api/default_chat_provider_stream",
    {
      manual: true,
      fetch: async (
        url: Parameters<typeof fetch>[0],
        options: XRequestOptions<ChatInput, ChatOutput>,
      ) => {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options.params || {}),
        });

        return response;
      },
    },
  ),
});

const { onRequest, messages, isRequesting } = useXChat({
  provider,
});

const roleConfig = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    placement: "start" as const,
    contentRender(contentValue) {
      return contentValue?.choices?.[0]?.message?.content || "";
    },
  },
  user: {
    placement: "end" as const,
    contentRender(contentValue) {
      return contentValue.query;
    },
  },
}));

const bubbleItems = computed(() =>
  messages.value.map(({ id, message, status }) => ({
    key: id,
    loading: status === "loading",
    content: message,
    role:
      "role" in message ? message.role : message?.choices?.[0]?.message?.role,
    status,
  })),
);

function handleSubmit(nextContent: string) {
  onRequest({
    query: nextContent,
    stream: false,
    role: "user",
  });
  content.value = "";
}
</script>

<template>
  <Flex vertical gap="middle">
    <BubbleList
      :style="{ height: '500px' }"
      :role="roleConfig"
      :items="bubbleItems"
    />
    <Sender
      :loading="isRequesting"
      :value="content"
      :on-change="(value: string) => (content = value)"
      :on-submit="handleSubmit"
    />
  </Flex>
</template>

<docs lang="zh-CN">
自定义 XRequest.fetch。
</docs>

<docs lang="en-US">
Custom XRequest.fetch.
</docs>
