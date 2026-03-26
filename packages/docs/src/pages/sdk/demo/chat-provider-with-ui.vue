<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import { BubbleList, Sender } from "@antdv-next/x";
import { DefaultChatProvider, useXChat, XRequest } from "@antdv-next/x-sdk";
import { Button, Flex } from "antdv-next";
import { computed, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

interface ChatInput {
  query: string;
  role: "user";
  stream?: boolean;
}

interface ChatOutput {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

interface SystemMessage {
  role: "system";
  content: string;
}

const content = ref("");
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";
  return {
    abort: isCN ? "中止" : "abort",
    addUserMessage: isCN ? "添加用户消息" : "Add a user message",
    addAIMessage: isCN ? "添加AI消息" : "Add an AI message",
    addSystemMessage: isCN ? "添加系统消息" : "Add a system message",
    editLastMessage: isCN ? "编辑最后一条消息" : "Edit the last message",
    placeholder: isCN
      ? "请输入内容，按下 Enter 发送消息"
      : "Please enter content and press Enter to send message",
    waiting: isCN ? "等待中..." : "Waiting...",
    mockFailed: isCN
      ? "模拟失败返回，请稍后再试。"
      : "Mock failed return. Please try again later.",
    historyUserMessage: isCN
      ? "这是一条历史消息"
      : "This is a historical message",
    historyAIResponse: isCN
      ? "这是一条历史回答消息，请发送新消息。"
      : "This is a historical response message, please send a new message.",
    editSystemMessage: isCN ? "编辑系统消息" : "Edit a system message",
    editUserMessage: isCN ? "编辑用户消息" : "Edit a user message",
    editAIResponse: isCN ? "编辑AI回复" : "Edit an AI response",
  };
});

const roleConfig = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    placement: "start" as const,
    contentRender(msg: ChatOutput) {
      return msg?.choices?.[0]?.message?.content;
    },
  },
  user: {
    placement: "end" as const,
    contentRender(msg: ChatInput) {
      return msg?.query;
    },
  },
  system: {
    variant: "borderless" as const,
    contentRender(msg: SystemMessage) {
      return msg?.content;
    },
  },
}));

const provider = new DefaultChatProvider<
  ChatOutput | ChatInput | SystemMessage,
  ChatInput,
  ChatOutput
>({
  request: XRequest(
    "https://api.x.ant.design/api/default_chat_provider_stream",
    {
      manual: true,
    },
  ),
});

const { onRequest, messages, abort, isRequesting, setMessages, setMessage } =
  useXChat({
    provider,
    defaultMessages: [
      {
        id: "1",
        message: {
          query: locale.value.historyUserMessage,
          role: "user",
        },
        status: "local",
      },
      {
        id: "2",
        message: {
          choices: [
            {
              message: {
                content: locale.value.historyAIResponse,
                role: "assistant",
              },
            },
          ],
        },
        status: "success",
      },
    ],
    requestPlaceholder: {
      choices: [
        { message: { content: locale.value.waiting, role: "assistant" } },
      ],
    },
    requestFallback: {
      choices: [
        { message: { content: locale.value.mockFailed, role: "assistant" } },
      ],
    },
  });

function addUserMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { query: locale.value.addUserMessage, role: "user" },
      status: "local",
    },
  ]);
}

function addAIMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: {
        choices: [
          {
            message: {
              content: locale.value.addAIMessage,
              role: "assistant",
            },
          },
        ],
      },
      status: "success",
    },
  ]);
}

function addSystemMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "system", content: locale.value.addSystemMessage },
      status: "success",
    },
  ]);
}

function editLastMessage() {
  const lastMessage = messages.value[messages.value.length - 1];
  if (!lastMessage) return;

  const isSystem = (lastMessage.message as SystemMessage).role === "system";
  const isUser = !!(lastMessage.message as ChatInput).query;
  const isAI = !!(lastMessage.message as ChatOutput).choices;

  if (isSystem) {
    setMessage(lastMessage.id, {
      message: { role: "system", content: locale.value.editSystemMessage },
    });
  } else if (isUser) {
    setMessage(lastMessage.id, {
      message: { role: "user", query: locale.value.editUserMessage },
    });
  } else if (isAI) {
    setMessage(lastMessage.id, {
      message: {
        choices: [
          {
            message: {
              content: locale.value.editAIResponse,
              role: "assistant",
            },
          },
        ],
      },
    });
  }
}

function handleChange(value: string) {
  content.value = value;
}

function handleSubmit(nextContent: string) {
  onRequest({
    stream: false,
    role: "user",
    query: nextContent,
  });
  content.value = "";
}

const bubbleItems = computed(() =>
  messages.value.map(({ id, message, status }) => ({
    key: id,
    loading: status === "loading",
    role: (message as SystemMessage | ChatInput).role
      ? (message as SystemMessage | ChatInput).role
      : (message as ChatOutput)?.choices?.[0]?.message?.role,
    content: message,
  })),
);
</script>

<template>
  <Flex vertical gap="middle">
    <Flex gap="small">
      <Button :disabled="!isRequesting" @click="abort">
        {{ locale.abort }}
      </Button>
      <Button @click="addUserMessage">
        {{ locale.addUserMessage }}
      </Button>
      <Button @click="addAIMessage">
        {{ locale.addAIMessage }}
      </Button>
      <Button @click="addSystemMessage">
        {{ locale.addSystemMessage }}
      </Button>
      <Button :disabled="!messages.length" @click="editLastMessage">
        {{ locale.editLastMessage }}
      </Button>
    </Flex>
    <BubbleList
      :role="roleConfig"
      :style="{ height: '500px' }"
      :items="bubbleItems"
    />
    <Sender
      :loading="isRequesting"
      :value="content"
      :placeholder="locale.placeholder"
      :on-cancel="abort"
      :on-change="handleChange"
      :on-submit="handleSubmit"
    />
  </Flex>
</template>

<docs lang="zh-CN">
配合 X 组件，实现消息和历史消息的展示。
</docs>

<docs lang="en-US">
Work with X components to display messages and historical messages.
</docs>
