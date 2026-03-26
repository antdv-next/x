<script setup lang="ts">
import type { ConversationsProps, SenderRef } from "@antdv-next/x";
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

const DEFAULT_KEY = "DEFAULT_KEY";
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
    placeholder: isCN ? "请输入消息..." : "Enter a message...",
    thinking: isCN ? "思考中..." : "Thinking...",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    somethingWrong: isCN ? "出了点问题" : "Something went wrong",
    welcomeTitle: "Hello, I'm Ant Design X",
    welcomeDescription: isCN
      ? "基于 Ant Design 的 AGI 产品界面解决方案"
      : "AGI product interface solution based on Ant Design",
    loadingHistory: isCN ? "加载历史消息中..." : "Loading history...",
  };
});

const defaultItems = computed(() => [
  { key: DEFAULT_KEY },
  { key: "sessionId_1", label: locale.value.conversationItem1 },
  { key: "sessionId_2", label: locale.value.conversationItem2 },
  { key: "sessionId_3", label: locale.value.conversationItem3 },
]);

function isHistorySession(sessionId: string) {
  return defaultItems.value.some(item => item.key === sessionId);
}

function providerFactory(conversationKey: string) {
  if (!providerCaches.has(conversationKey)) {
    providerCaches.set(
      conversationKey,
      new DeepSeekChatProvider({
        request: XRequest<XModelParams, Partial<Record<SSEFields, XModelResponse>>>(
          "https://api.x.ant.design/api/big_model_glm-4.5-flash",
          {
            manual: true,
            params: {
              thinking: { type: "disabled" },
              stream: true,
              model: "glm-4.5-flash",
            },
          },
        ),
      }),
    );
  }
  return providerCaches.get(conversationKey)!;
}

const getHistoryMessageList = async (info: {
  conversationKey?: string;
}): Promise<DefaultMessageInfo<XModelMessage>[]> => {
  const conversationKey = info.conversationKey;

  if (
    !conversationKey ||
    conversationKey === DEFAULT_KEY ||
    !isHistorySession(conversationKey)
  ) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.x.ant.design/api/history_messages?isZH_CN=${docsLocale.value === "zh-CN"}&sessionId=${conversationKey}`,
      { method: "GET" },
    );
    const json = await response.json();
    if (json?.success) {
      return json?.data || [];
    }
  } catch (error) {
    console.warn("Failed to load history messages:", error);
  }

  return [];
};

const {
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
} = useXConversations({
  defaultConversations: defaultItems.value,
  defaultActiveConversationKey: DEFAULT_KEY,
});

const {
  onRequest,
  messages,
  isDefaultMessagesRequesting,
  isRequesting,
  abort,
  queueRequest,
} = useXChat({
  provider: computed(() => providerFactory(activeConversationKey.value)).value,
  conversationKey: activeConversationKey,
  defaultMessages: getHistoryMessageList,
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
  width: "220px",
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}));

const conversationItems = computed<ConversationsProps["items"]>(() =>
  conversations.value.filter(c => c.key !== DEFAULT_KEY),
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
        <template v-else-if="isDefaultMessagesRequesting">
          <Flex :style="{ padding: '16px' }">
            {{ locale.loadingHistory }}
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
        :disabled="isDefaultMessagesRequesting"
        :placeholder="locale.placeholder"
        :on-submit="handleSubmit"
        :on-cancel="abort"
      />
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
将 `defaultMessages` 设为异步函数，在会话初始化时远程拉取历史消息。切换到预置会话时，自动加载该会话的历史记录。
</docs>

<docs lang="en-US">
Set `defaultMessages` as an async function to fetch remote history when a conversation is initialized. Switching to a preset session automatically loads its history.
</docs>
