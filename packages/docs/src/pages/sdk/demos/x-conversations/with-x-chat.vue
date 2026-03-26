<script setup lang="ts">
import type { ConversationsProps, SenderRef } from "@antdv-next/x";
import type { XModelParams, XModelResponse } from "@antdv-next/x-sdk";

import { BubbleList, Conversations, Sender } from "@antdv-next/x";
import {
  OpenAIChatProvider,
  useXChat,
  useXConversations,
  XRequest,
} from "@antdv-next/x-sdk";
import { Flex, theme } from "antdv-next";
import { computed, ref, watch } from "vue";

import { useLocale } from "@/composables/use-locale";

const BASE_URL = "https://api.x.ant.design/api/big_model_glm-4.5-flash";
const MODEL = "glm-4.5-flash";

const DEFAULT_KEY = "DEFAULT_KEY";
const senderRef = ref<SenderRef>();
const { token } = theme.useToken();
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    placeholder: isCN ? "请输入消息..." : "Enter a message...",
    waiting: isCN ? "请稍候..." : "Please wait...",
    requestFailed: isCN ? "请求失败，请重试！" : "Request failed, please try again!",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    welcomeTitle: "Hello, I'm Ant Design X",
    welcomeDescription: isCN
      ? "基于 Ant Design 的 AGI 产品界面解决方案"
      : "AGI product interface solution based on Ant Design",
  };
});

const providerCaches = new Map<string, OpenAIChatProvider>();

function getOrCreateProvider(conversationKey: string) {
  if (!providerCaches.has(conversationKey)) {
    providerCaches.set(
      conversationKey,
      new OpenAIChatProvider({
        request: XRequest<XModelParams, XModelResponse>(BASE_URL, {
          manual: true,
          params: { model: MODEL, stream: true },
        }),
      }),
    );
  }
  return providerCaches.get(conversationKey)!;
}

const {
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
} = useXConversations({
  defaultConversations: [{ key: DEFAULT_KEY }],
  defaultActiveConversationKey: DEFAULT_KEY,
});

const {
  onRequest,
  messages,
  isRequesting,
  abort,
  queueRequest,
} = useXChat({
  provider: computed(() =>
    getOrCreateProvider(activeConversationKey.value),
  ).value,
  conversationKey: activeConversationKey,
  requestPlaceholder: () => ({
    content: locale.value.waiting,
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
      content: errorInfo?.error?.message || locale.value.requestFailed,
      role: "assistant",
    };
  },
});

watch(activeConversationKey, () => {
  senderRef.value?.clear();
});

const conversationStyle = computed(() => ({
  width: "220px",
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}));

const conversationItems = computed<ConversationsProps["items"]>(() =>
  conversations.value
    .filter(c => c.key !== DEFAULT_KEY)
    .slice()
    .reverse(),
);

const bubbleItems = computed(() =>
  messages.value.map(info => ({
    key: info.id,
    role: info.message.role,
    content: info.message.content,
    loading: info.status === "loading",
  })),
);

const roleConfig = {
  assistant: { placement: "start" as const },
  user: { placement: "end" as const },
};

function handleAdd() {
  setActiveConversationKey(DEFAULT_KEY);
}

function handleSubmit(value: string) {
  if (!value.trim()) return;

  if (activeConversationKey.value !== DEFAULT_KEY) {
    onRequest({ messages: [{ role: "user", content: value }] });
  } else {
    const newKey = `conv_${Date.now()}`;
    addConversation({ key: newKey, label: value.slice(0, 20) });
    setActiveConversationKey(newKey);
    queueRequest(newKey, { messages: [{ role: "user", content: value }] });
  }
  senderRef.value?.clear();
}
</script>

<template>
  <Flex gap="small" align="start">
    <Conversations
      :creation="{ onClick: handleAdd }"
      :items="conversationItems"
      :active-key="
        activeConversationKey === DEFAULT_KEY ? undefined : activeConversationKey
      "
      :style="conversationStyle"
      :on-active-change="setActiveConversationKey"
    />

    <Flex vertical gap="small" :style="{ flex: 1, minWidth: 0 }">
      <div :style="{ height: '360px' }">
        <template v-if="activeConversationKey === DEFAULT_KEY">
          <Flex vertical gap="small" :style="{ padding: '16px' }">
            <strong>{{ locale.welcomeTitle }}</strong>
            <span>{{ locale.welcomeDescription }}</span>
          </Flex>
        </template>
        <BubbleList
          v-else
          :items="bubbleItems"
          :role="roleConfig"
          :style="{ height: '100%' }"
        />
      </div>
      <Sender
        ref="senderRef"
        :loading="isRequesting"
        :placeholder="locale.placeholder"
        :on-submit="handleSubmit"
        :on-cancel="abort"
      />
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
将 `useXConversations` 与 `useXChat` 结合，实现多会话的独立对话管理。每个会话有独立的消息历史，切换会话时无缝切换上下文。
</docs>

<docs lang="en-US">
Combine `useXConversations` with `useXChat` to achieve independent conversation management across multiple sessions. Each session maintains its own message history with seamless context switching.
</docs>
