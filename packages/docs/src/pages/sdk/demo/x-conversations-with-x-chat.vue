<script setup lang="ts">
import type { ConversationItemType, SenderRef } from "@antdv-next/x";
import type {
  DefaultMessageInfo,
  SSEFields,
  XModelMessage,
  XModelParams,
  XModelResponse,
} from "@antdv-next/x-sdk";

import { BubbleList, Conversations, Sender } from "@antdv-next/x";
import {
  DeepSeekChatProvider,
  useXChat,
  useXConversations,
  XRequest,
} from "@antdv-next/x-sdk";
import { Flex, theme } from "antdv-next";
import { computed, ref, watch } from "vue";

import { useLocale } from "@/composables/use-locale";

const senderRef = ref<SenderRef>();
const providerCaches = new Map<string, DeepSeekChatProvider>();
const { token } = theme.useToken();
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    conversationItem1: isCN ? "会话项目 1" : "Conversation Item 1",
    conversationItem2: isCN ? "会话项目 2" : "Conversation Item 2",
    conversationItem3: isCN
      ? "会话项目 3，你可以点击我！"
      : "This's Conversation Item 3, you can click me!",
    conversationItem4: isCN ? "会话项目 4" : "Conversation Item 4",
    helloConversation1: isCN
      ? "你好，这是会话 1！"
      : "Hello, this is Conversation 1!",
    welcomeConversation1: isCN
      ? "你好！这是会话 1 的欢迎消息。我可以帮助你回答各种问题。"
      : "Hello! This is the welcome message for Conversation 1. I can help you answer various questions.",
    conversation2Started: isCN ? "会话 2 已启动" : "Conversation 2 has started",
    welcomeConversation2: isCN
      ? "欢迎来到会话 2！在这里我们可以讨论与技术相关的话题。"
      : "Welcome to Conversation 2! Here we can discuss technology-related topics.",
    clickedConversation3: isCN ? "点击了会话 3" : "Clicked on Conversation 3",
    specialConversation3: isCN
      ? "你选择了会话 3！这是一个特殊的会话。我该如何帮助你？"
      : "You selected Conversation 3! This is a special conversation. How can I help you?",
    conversation4Initialized: isCN
      ? "会话 4 已初始化"
      : "Conversation 4 initialized",
    conversation4Disabled: isCN
      ? "这是会话 4。虽然它被禁用了，但你仍然可以查看历史消息。"
      : "This is Conversation 4. Although it is disabled, you can still view historical messages.",
    helloDefault: isCN ? "你好！" : "hello!",
    howCanAssist: isCN
      ? "你好！我今天能为你做些什么？"
      : "Hello! How can I assist you today?",
    thinking: isCN ? "思考中" : "Thinking",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    somethingWrong: isCN ? "出了点问题" : "Something went wrong",
  };
});

const defaultItems = computed<ConversationItemType[]>(() => [
  { key: "item1_1", label: locale.value.conversationItem1 },
  { key: "item1_2", label: locale.value.conversationItem2 },
  { key: "item1_3", label: locale.value.conversationItem3 },
  { key: "item1_4", label: locale.value.conversationItem4, disabled: true },
]);

function providerFactory(conversationKey: string) {
  if (!providerCaches.has(conversationKey)) {
    providerCaches.set(
      conversationKey,
      new DeepSeekChatProvider({
        request: XRequest<
          XModelParams,
          Partial<Record<SSEFields, XModelResponse>>
        >("https://api.x.ant.design/api/big_model_glm-4.5-flash", {
          manual: true,
          params: {
            thinking: { type: "disabled" },
            stream: true,
            model: "glm-4.5-flash",
          },
        }),
      }),
    );
  }
  return providerCaches.get(conversationKey)!;
}

const { activeConversationKey, setActiveConversationKey } = useXConversations({
  defaultConversations: defaultItems,
  defaultActiveConversationKey: "item1_1",
});

const defaultMessages = async (info: {
  conversationKey?: string;
}): Promise<DefaultMessageInfo<XModelMessage>[]> => {
  const l = locale.value;

  // 会话消息映射：为每个会话定义独特的欢迎消息
  // Conversation message mapping: define unique welcome messages for each conversation
  const messagesMap: Record<string, DefaultMessageInfo<XModelMessage>[]> = {
    item1_1: [
      {
        message: { role: "user", content: l.helloConversation1 },
        status: "success",
      },
      {
        message: { role: "assistant", content: l.welcomeConversation1 },
        status: "success",
      },
    ],
    item1_2: [
      {
        message: { role: "user", content: l.conversation2Started },
        status: "success",
      },
      {
        message: { role: "assistant", content: l.welcomeConversation2 },
        status: "success",
      },
    ],
    item1_3: [
      {
        message: { role: "user", content: l.clickedConversation3 },
        status: "success",
      },
      {
        message: { role: "assistant", content: l.specialConversation3 },
        status: "success",
      },
    ],
    item1_4: [
      {
        message: { role: "user", content: l.conversation4Initialized },
        status: "success",
      },
      {
        message: { role: "assistant", content: l.conversation4Disabled },
        status: "success",
      },
    ],
  };

  const key = info.conversationKey;
  if (key && messagesMap[key]) {
    return messagesMap[key];
  }
  return [
    {
      message: { role: "user", content: l.helloDefault },
      status: "success",
    },
    {
      message: { role: "assistant", content: l.howCanAssist },
      status: "success",
    },
  ];
};

const { onRequest, messages, isRequesting, abort } = useXChat({
  provider: computed(() => providerFactory(activeConversationKey.value)),
  conversationKey: activeConversationKey,
  defaultMessages: defaultMessages,
  requestPlaceholder: () => ({
    content: locale.value.thinking,
    role: "assistant",
  }),
  requestFallback: (_, { error, errorInfo, messageInfo }) => {
    if (error.name === "AbortError") {
      return {
        content: messageInfo?.message?.content || locale.value.requestAborted,
        role: "assistant",
      };
    }
    return {
      content: errorInfo?.error?.message || locale.value.somethingWrong,
      role: "assistant",
    };
  },
});

watch(activeConversationKey, () => {
  senderRef.value?.clear();
});

const conversationStyle = computed(() => ({
  width: "256px",
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}));

const bubbleItems = computed(() =>
  messages.value.map(i => ({
    ...i.message,
    key: i.id,
    status: i.status,
    loading: i.status === "loading",
    extraInfo: i.extraInfo,
  })),
);

const roleConfig = {
  assistant: { placement: "start" as const },
  user: { placement: "end" as const },
};

function handleSubmit(value: string) {
  if (!value) return;
  onRequest({ messages: [{ role: "user", content: value }] });
  senderRef.value?.clear();
}
</script>

<template>
  <Flex gap="small" align="flex-start">
    <Conversations
      :items="defaultItems"
      :active-key="activeConversationKey"
      :style="conversationStyle"
      :on-active-change="setActiveConversationKey"
    />

    <Flex vertical gap="small" align="flex-start" :style="{ width: '500px' }">
      <div
        :style="{
          width: '100%',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
        }"
      >
        <BubbleList
          :items="bubbleItems"
          :role="roleConfig"
          :styles="{ bubble: { maxWidth: '840px' } }"
          :style="{ height: '100%' }"
        />
      </div>
      <Sender
        ref="senderRef"
        :loading="isRequesting"
        :on-submit="handleSubmit"
        :on-cancel="abort"
      />
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
结合 useXConversations 和 useXChat 实现会话管理与聊天功能的完整集成，支持多会话独立聊天和上下文切换。
</docs>

<docs lang="en-US">
Integrate useXConversations and useXChat to achieve complete integration of conversation management and chat functionality, supporting multi-conversation independent chatting and context switching.
</docs>
