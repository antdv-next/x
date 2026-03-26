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
    thinking: isCN ? "思考中..." : "Thinking...",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    somethingWrong: isCN ? "出了点问题" : "Something went wrong",
    loadingHistory: isCN ? "加载历史消息中..." : "Loading history...",
  };
});

const defaultItems = computed<ConversationsProps["items"]>(() => [
  { key: "item2_1", label: locale.value.conversationItem1 },
  { key: "item2_2", label: locale.value.conversationItem2 },
  { key: "item2_3", label: locale.value.conversationItem3 },
  { key: "item2_4", label: locale.value.conversationItem4, disabled: true },
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

const getHistoryMessageList = async (info: {
  conversationKey?: string;
}): Promise<DefaultMessageInfo<XModelMessage>[]> => {
  const conversationKey = info.conversationKey;

  if (!conversationKey) {
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

const { activeConversationKey, setActiveConversationKey } = useXConversations({
  defaultConversations: defaultItems.value,
  defaultActiveConversationKey: "item2_1",
});

const {
  onRequest,
  messages,
  isDefaultMessagesRequesting,
  isRequesting,
  abort,
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

    <Flex vertical gap="small" :style="{ flex: 1, minWidth: 0 }">
      <div :style="{ height: '350px' }">
        <template v-if="isDefaultMessagesRequesting">
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
