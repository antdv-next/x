<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import { SyncOutlined } from "@antdv-next/icons";
import { BubbleList, Sender } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  OpenAIChatProvider,
  useXChat,
  type XModelParams,
  type XModelResponse,
  XRequest,
} from "@antdv-next/x-sdk";
import { Button, Divider, Flex, Tooltip } from "antdv-next";
import { computed, h, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

const BASE_URL =
  "https://api.x.ant.design/api/llm_siliconflow_THUDM_glm-4-9b-chat";
const MODEL = "THUDM/glm-4-9b-chat";

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
    editSystemPrompt: isCN ? "编辑系统提示" : "Edit system prompt",
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
    currentSystemPrompt: isCN ? "当前系统提示：" : "Current system prompt:",
    none: isCN ? "无" : "None",
    hello: isCN ? "你好！" : "Hello!",
    helloResponse: isCN ? "你好，我是一个聊天机器人" : "Hello, I am a chatbot",
    systemPrompt: isCN
      ? "你是一个有用的聊天机器人"
      : "You are a helpful chatbot",
    newUserMessage: isCN ? "添加新的用户消息" : "Add a new user message",
    newAIResponse: isCN ? "添加新的AI回复" : "Add a new AI response",
    newSystemMessage: isCN ? "添加新的系统消息" : "Add a new system message",
    editMessage: isCN ? "编辑消息" : "Edit a message",
    modifiedSystemPrompt: isCN ? "修改后的系统提示" : "Modified system prompt",
  };
});

const provider = new OpenAIChatProvider({
  request: XRequest<XModelParams, XModelResponse>(BASE_URL, {
    manual: true,
    params: {
      model: MODEL,
      stream: true,
    },
  }),
});

const {
  onRequest,
  messages,
  setMessages,
  setMessage,
  isRequesting,
  abort,
  onReload,
} = useXChat({
  provider,
  defaultMessages: [
    {
      id: "developer",
      message: { role: "developer", content: locale.value.systemPrompt },
      status: "success",
    },
    {
      id: "0",
      message: { role: "user", content: locale.value.hello },
      status: "success",
    },
    {
      id: "1",
      message: { role: "assistant", content: locale.value.helloResponse },
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

const chatMessages = computed(() =>
  messages.value.filter(
    messageInfo => messageInfo.message.role !== "developer",
  ),
);

function addUserMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "user", content: locale.value.newUserMessage },
      status: "success",
    },
  ]);
}

function addAIMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "assistant", content: locale.value.newAIResponse },
      status: "success",
    },
  ]);
}

function addSystemMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "system", content: locale.value.newSystemMessage },
      status: "success",
    },
  ]);
}

function editLastMessage() {
  const lastMessage = chatMessages.value[chatMessages.value.length - 1];

  if (!lastMessage) {
    return;
  }

  setMessage(lastMessage.id, {
    message: {
      role: lastMessage.message.role,
      content: locale.value.editMessage,
    },
  });
}

function editDeveloper() {
  setMessage("developer", {
    message: {
      role: "developer",
      content: locale.value.modifiedSystemPrompt,
    },
  });
}

const currentStatus = computed(() => {
  if (isRequesting.value) {
    return locale.value.requesting;
  }

  if (chatMessages.value.length === 0) {
    return locale.value.noMessages;
  }

  return locale.value.qaCompleted;
});

const currentDeveloperPrompt = computed(
  () =>
    messages.value.find(messageInfo => messageInfo.message.role === "developer")
      ?.message.content || locale.value.none,
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
  chatMessages.value.map(({ id, message, status }) => ({
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

function handleSubmit(nextContent: string) {
  onRequest({
    messages: [
      {
        role: "user",
        content: nextContent,
      },
    ],
  });
  content.value = "";
}
</script>

<template>
  <Flex vertical gap="middle">
    <Flex vertical gap="middle">
      <div>{{ locale.currentStatus }} {{ currentStatus }}</div>
      <div>{{ locale.currentSystemPrompt }} {{ currentDeveloperPrompt }}</div>
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
        <Button :disabled="!chatMessages.length" @click="editLastMessage">
          {{ locale.editLastMessage }}
        </Button>
        <Button :disabled="!chatMessages.length" @click="editDeveloper">
          {{ locale.editSystemPrompt }}
        </Button>
      </Flex>
    </Flex>

    <Divider />

    <BubbleList
      :style="{ maxHeight: '300px' }"
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
可使用 `defaultMessages` 设置系统提示词。
</docs>

<docs lang="en-US">
You can use `defaultMessages` to set system prompts.
</docs>
