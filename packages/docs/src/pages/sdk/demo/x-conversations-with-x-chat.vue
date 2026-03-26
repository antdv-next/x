<script setup lang="ts">
import type { ConversationsProps, SenderRef } from "@antdv-next/x";
import type {
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
    conversationItem3: isCN ? "会话项目 3" : "Conversation Item 3",
    conversationItem4: isCN ? "会话项目 4" : "Conversation Item 4",
    helloConversation1: isCN
      ? "你好，这是会话 1！"
      : "Hello, this is conversation 1!",
    welcomeConversation1: isCN
      ? "欢迎来到会话 1！有什么我可以帮你的吗？"
      : "Welcome to conversation 1! How can I help you?",
    conversation2Started: isCN ? "会话 2 已启动" : "Conversation 2 started",
    welcomeConversation2: isCN
      ? "欢迎来到会话 2！有什么我可以帮你的吗？"
      : "Welcome to conversation 2! How can I help you?",
    clickedConversation3: isCN ? "点击了会话 3" : "Clicked conversation 3",
    specialConversation3: isCN
      ? "这是会话 3 的特别消息！"
      : "This is a special message for conversation 3!",
    conversation4Initialized: isCN
      ? "会话 4 已初始化"
      : "Conversation 4 initialized",
    conversation4Disabled: isCN
      ? "会话 4 已禁用，无法发送消息。"
      : "Conversation 4 is disabled and cannot send messages.",
    helloDefault: isCN ? "你好！" : "Hello!",
    howCanAssist: isCN
      ? "你好！我今天能为你做些什么？"
      : "Hello! What can I do for you today?",
    thinking: isCN ? "思考中..." : "Thinking...",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    somethingWrong: isCN ? "出了点问题" : "Something went wrong",
  };
});

const defaultItems = computed<ConversationsProps["items"]>(() => [
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
  defaultConversations: defaultItems.value,
  defaultActiveConversationKey: "item1_1",
});

const defaultMessages = computed<
  (info: { conversationKey?: string }) => XModelMessage[]
>(() => {
  const l = locale.value;

  const messagesMap: Record<string, XModelMessage[]> = {
    item1_1: [
      { role: "user", content: l.helloConversation1 },
      { role: "assistant", content: l.welcomeConversation1 },
    ],
    item1_2: [
      { role: "user", content: l.conversation2Started },
      { role: "assistant", content: l.welcomeConversation2 },
    ],
    item1_3: [
      { role: "user", content: l.clickedConversation3 },
      { role: "assistant", content: l.specialConversation3 },
    ],
    item1_4: [
      { role: "user", content: l.conversation4Initialized },
      { role: "assistant", content: l.conversation4Disabled },
    ],
  };

  return (info: { conversationKey?: string }) => {
    const key = info.conversationKey;
    if (key && messagesMap[key]) {
      return messagesMap[key];
    }
    return [
      { role: "user", content: l.helloDefault },
      { role: "assistant", content: l.howCanAssist },
    ];
  };
});

const { onRequest, messages, isRequesting, abort } = useXChat({
  provider: computed(() => providerFactory(activeConversationKey.value)).value,
  conversationKey: activeConversationKey,
  defaultMessages: defaultMessages.value,
  requestPlaceholder: () => ({
    content: locale.value.thinking,
    role: "assistant",
  }),
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
  <Flex gap="small" align="start">
    <Conversations
      :items="defaultItems"
      :active-key="activeConversationKey"
      :style="conversationStyle"
      :on-active-change="setActiveConversationKey"
    />

    <Flex vertical gap="small" :style="{ width: '500px' }">
      <div :style="{ height: '300px' }">
        <BubbleList
          :items="bubbleItems"
          :role="roleConfig"
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
将 `useXConversations` 与 `useXChat` 结合，通过 `defaultMessages` 为每个会话预置初始消息。切换会话时自动加载对应的消息记录。
</docs>

<docs lang="en-US">
Combine `useXConversations` with `useXChat`, using `defaultMessages` to preset initial messages for each conversation. Messages are automatically loaded when switching conversations.
</docs>
