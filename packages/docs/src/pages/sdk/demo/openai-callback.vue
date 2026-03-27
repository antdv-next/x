<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import { SyncOutlined } from "@antdv-next/icons";
import { BubbleList, Sender } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  OpenAIChatProvider,
  useXChat,
  type XModelMessage,
  type XModelParams,
  type XModelResponse,
  XRequest,
} from "@antdv-next/x-sdk";
import { Button, Flex, Tooltip } from "antdv-next";
import { computed, h, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

const BASE_URL = "https://api.x.ant.design/api/big_model_glm-4.5-flash";
const MODEL = "THUDM/glm-4-9b-chat";

const content = ref("");
const callbackMessage = ref("");
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
    waiting: isCN ? "请稍候..." : "Please wait...",
    requestFailed: isCN
      ? "请求失败，请重试！"
      : "Request failed, please try again!",
    requestAborted: isCN ? "请求已中止" : "Request is aborted",
    noMessages: isCN
      ? "暂无消息，请输入问题并发送"
      : "No messages yet, please enter a question and send",
    requesting: isCN ? "请求中" : "Requesting",
    qaCompleted: isCN ? "问答完成" : "Q&A completed",
    retry: isCN ? "重试" : "Retry",
    currentStatus: isCN ? "当前状态：" : "Current status:",
    historyUserMessage: isCN
      ? "这是一条历史消息"
      : "This is a historical message",
    historyAIResponse: isCN
      ? "这是一条历史回答消息，请发送新消息。"
      : "This is a historical response message, please send a new message.",
    deleteFirstMessage: isCN ? "删除第一条消息" : "Delete the first message",
    noCallbackData: isCN ? "暂无数据" : "No data available",
    callbackMessage: isCN ? "回调消息：" : "Callback Message:",
  };
});

const provider = new OpenAIChatProvider({
  request: XRequest<XModelParams, XModelResponse, XModelMessage>(BASE_URL, {
    manual: true,
    callbacks: {
      onSuccess: (_chunks, _responseHeaders, message) => {
        callbackMessage.value = `onSuccess: ${JSON.stringify(message)}`;
      },
      onError: (_error, _errorInfo, _responseHeaders, message) => {
        callbackMessage.value = `onError: ${JSON.stringify(message)}`;
      },
      onUpdate: (_chunk, _responseHeaders, message) => {
        callbackMessage.value = `onUpdate: ${JSON.stringify(message)}`;
      },
    },
    params: {
      model: MODEL,
      stream: true,
    },
  }),
});

const {
  onRequest,
  messages,
  removeMessage,
  setMessages,
  setMessage,
  isRequesting,
  abort,
  onReload,
} = useXChat({
  provider,
  defaultMessages: [
    {
      id: "1",
      message: { role: "user", content: locale.value.historyUserMessage },
      status: "success",
    },
    {
      id: "2",
      message: { role: "assistant", content: locale.value.historyAIResponse },
      status: "success",
    },
  ],
  requestFallback: (_, { error, errorInfo, messageInfo }) => {
    if (error.name === "AbortError") {
      return {
        content:
          typeof messageInfo?.message?.content === "string"
            ? messageInfo.message.content
            : locale.value.requestAborted,
        role: "assistant",
      };
    }

    return {
      content: errorInfo?.error?.message || locale.value.requestFailed,
      role: "assistant",
    };
  },
  requestPlaceholder: () => ({
    content: locale.value.waiting,
    role: "assistant",
  }),
});

function addUserMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "user", content: locale.value.addUserMessage },
      status: "success",
    },
  ]);
}

function addAIMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "assistant", content: locale.value.addAIMessage },
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

  if (!lastMessage) {
    return;
  }

  setMessage(lastMessage.id, {
    message: {
      role: lastMessage.message.role,
      content: locale.value.editLastMessage,
    },
  });
}

const currentStatus = computed(() => {
  if (isRequesting.value) {
    return locale.value.requesting;
  }

  if (messages.value.length === 0) {
    return locale.value.noMessages;
  }

  return locale.value.qaCompleted;
});

const callbackText = computed(
  () => callbackMessage.value || locale.value.noCallbackData,
);

const roleConfig = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    placement: "start" as const,
    contentRender(value: string) {
      return h(XMarkdown, {
        content: value.replace(/\n\n/g, "<br/><br/>"),
      });
    },
  },
  user: {
    placement: "end" as const,
  },
}));

const bubbleItems = computed(() =>
  messages.value.map(({ id, message, status }) => ({
    key: id,
    role: message.role,
    status,
    loading: status === "loading",
    content: message.content,
    footer:
      message.role === "assistant"
        ? () =>
            h(
              Tooltip,
              { title: locale.value.retry },
              {
                default: () => [
                  h(Button, {
                    size: "small",
                    type: "text",
                    icon: h(SyncOutlined),
                    style: { marginInlineEnd: "auto" },
                    onClick: () => onReload(id, { userAction: "retry" }),
                  }),
                ],
              },
            )
        : undefined,
  })),
);

function removeFirstMessage() {
  const firstMessageId = messages.value[0]?.id;

  if (firstMessageId === undefined) {
    return;
  }

  removeMessage(firstMessageId);
}

function handleSubmit(nextContent: string) {
  onRequest({
    messages: [
      {
        role: "user",
        content: nextContent,
      },
    ],
    frequency_penalty: 0,
    max_tokens: 1024,
    thinking: {
      type: "disabled",
    },
  });
  content.value = "";
}
</script>

<template>
  <Flex vertical gap="middle">
    <Flex vertical gap="middle">
      <div>{{ locale.currentStatus }}{{ currentStatus }}</div>
      <div>{{ locale.callbackMessage }} {{ callbackText }}</div>
      <Flex align="center" gap="middle" wrap>
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
        <Button :disabled="!messages.length" @click="removeFirstMessage">
          {{ locale.deleteFirstMessage }}
        </Button>
      </Flex>
    </Flex>

    <BubbleList
      :style="{ height: '500px' }"
      :role="roleConfig"
      :items="bubbleItems"
    />

    <Sender
      :loading="isRequesting"
      :value="content"
      :placeholder="locale.placeholder"
      :on-cancel="abort"
      :on-change="(value: string) => (content = value)"
      :on-submit="handleSubmit"
    />
  </Flex>
</template>

<docs lang="zh-CN">
与 Chat Provider 协作时，XRequest 的 callback 回调可获取组装好的 Chat Message 数据。
</docs>

<docs lang="en-US">
When working with Chat Provider, the XRequest callback can obtain the assembled Chat Message data.
</docs>
