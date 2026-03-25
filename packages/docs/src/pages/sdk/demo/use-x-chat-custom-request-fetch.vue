<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

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
  request: XRequest<ChatInput, ChatOutput>("mock://default-chat-provider", {
    manual: true,
    fetch: async (_url, options) => {
      const query = options.params?.query || "Hello";

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                role: "assistant",
                content: `Custom fetch reply: ${query}`,
              },
            },
          ],
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    },
  }),
});

const { onRequest, messages, isRequesting } = useXChat({
  provider,
});

const role = {
  assistant: {
    placement: "start",
    contentRender: (value: ChatOutput) =>
      value?.choices?.[0]?.message?.content || "",
  },
  user: {
    placement: "end",
    contentRender: (value: ChatInput) => value.query,
  },
} satisfies BubbleListProps["role"];

const items = computed(() =>
  messages.value.map(({ id, message, status }) => ({
    key: id,
    status,
    loading: status === "loading",
    content: message,
    role:
      "role" in message && message.role
        ? message.role
        : (message as ChatOutput)?.choices?.[0]?.message?.role,
  })),
);

const onContentChange = (value: string) => {
  content.value = value;
};

const onSubmit = (value: string) => {
  if (!value) {
    return;
  }

  onRequest({
    query: value,
    stream: false,
    role: "user",
  });
  content.value = "";
};
</script>

<template>
  <Flex vertical gap="middle">
    <BubbleList style="height: 500px" :role="role" :items="items" />

    <Sender
      :loading="isRequesting"
      :value="content"
      :on-change="onContentChange"
      :on-submit="onSubmit"
      placeholder="Type here"
    />
  </Flex>
</template>

<docs lang="zh-CN">
对齐 antdx `custom-request-fetch.tsx`：通过自定义 `XRequest.fetch` 发送普通 JSON 请求，并配合 `DefaultChatProvider` 显示消息。
</docs>

<docs lang="en-US">
Aligned with antdx `custom-request-fetch.tsx`: send a normal JSON request with custom `XRequest.fetch`, then render messages through `DefaultChatProvider`.
</docs>
