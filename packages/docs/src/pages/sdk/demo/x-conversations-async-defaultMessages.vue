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
    thinking: isCN ? "思考中..." : "Thinking...",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    somethingWrong: isCN ? "出了点问题" : "Something went wrong",
  };
});

const defaultItems = computed<ConversationItemType[]>(() => [
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
  defaultConversations: defaultItems,
  defaultActiveConversationKey: "item2_1",
});

const {
  onRequest,
  messages,
  isDefaultMessagesRequesting,
  isRequesting,
  abort,
} = useXChat({
  provider: computed(() => providerFactory(activeConversationKey.value)),
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
  <Flex gap="small" align="flex-start">
    <Conversations
      :items="defaultItems"
      :active-key="activeConversationKey"
      :style="conversationStyle"
      :on-active-change="setActiveConversationKey"
    />

    <Flex :style="{ width: '500px' }" vertical gap="small" align="flex-start">
      <div
        :style="{
          width: '100%',
          height: '350px',
          display: 'flex',
          flexDirection: 'column',
        }"
      >
        <BubbleList
          :items="bubbleItems"
          :styles="{ bubble: { maxWidth: '840px' } }"
          :role="roleConfig"
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
将 `defaultMessages` 设置为异步方法，可以在初始化时加载历史消息，该方法常与 `useXConversations` hook 配合使用，实现会话数据的动态管理和状态同步，适用于会话列表的消息更新和会话内容的初始化场景。
</docs>

<docs lang="en-US">
Set `defaultMessages` as an asynchronous method to load historical messages during initialization. This method is commonly used with the `useXConversations` hook to achieve dynamic management of conversation data and state synchronization, suitable for scenarios involving message updates in conversation lists and initialization of conversation content.
</docs>
