<script setup lang="ts">
import type {
  ConversationItemType,
  ConversationsProps,
  SenderRef,
} from "@antdv-next/x";
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
import { Flex, Typography, theme } from "antdv-next";
import { computed, ref, watch } from "vue";

import { useLocale } from "@/composables/use-locale";

const DEFAULT_KEY = "DEFAULT_KEY";
const senderRef = ref<SenderRef>();
const providerCaches = new Map<string, DeepSeekChatProvider>();
const { token } = theme.useToken();
const { locale: docsLocale } = useLocale();
const { Title, Text } = Typography;

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    conversationItem1: isCN ? "会话项目 1" : "Conversation Item 1",
    conversationItem2: isCN ? "会话项目 2" : "Conversation Item 2",
    conversationItem3: isCN
      ? "会话项目 3，你可以点击我！"
      : "This's Conversation Item 3, you can click me!",
    conversationItem4: isCN ? "会话项目 4" : "Conversation Item 4",
    thinking: isCN ? "思考中" : "Thinking",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    somethingWrong: isCN ? "出了点问题" : "Something went wrong",
    welcomeTitle: "Hello, I'm Ant Design X",
    welcomeDescription: isCN
      ? "基于 Ant Design 的 AGI 产品界面解决方案，构建更好的智能交互体验。"
      : "Base on Ant Design, AGI product interface solution, create a better intelligent vision~",
  };
});

const defaultItems = computed<ConversationItemType[]>(() => [
  { key: DEFAULT_KEY },
  { key: "sessionId_1", label: locale.value.conversationItem1 },
  { key: "sessionId_2", label: locale.value.conversationItem2 },
  { key: "sessionId_3", label: locale.value.conversationItem3 },
  {
    key: "sessionId_4",
    label: locale.value.conversationItem4,
    disabled: true,
  },
]);

function isHistorySessionId(sessionId: string) {
  return defaultItems.value.some(item => item.key === sessionId);
}

function providerFactory(conversationKey: string) {
  const cached = providerCaches.get(conversationKey);

  if (cached) {
    return cached;
  }

  const provider = new DeepSeekChatProvider({
    request: XRequest<XModelParams, Partial<Record<SSEFields, XModelResponse>>>(
      "https://api.x.ant.design/api/big_model_glm-4.5-flash",
      {
        manual: true,
        params: {
          thinking: {
            type: "disabled",
          },
          stream: true,
          model: "glm-4.5-flash",
        },
      },
    ),
  });

  providerCaches.set(conversationKey, provider);
  return provider;
}

const {
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
} = useXConversations({
  defaultConversations: defaultItems,
  defaultActiveConversationKey: DEFAULT_KEY,
});

const conversationStyle = computed(() => ({
  width: "280px",
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}));

const getHistoryMessageList = async (info: {
  conversationKey?: string;
}): Promise<DefaultMessageInfo<XModelMessage>[]> => {
  const conversationKey = info.conversationKey;

  try {
    if (
      !conversationKey ||
      conversationKey === DEFAULT_KEY ||
      !isHistorySessionId(conversationKey)
    ) {
      return [];
    }

    const response = await fetch(
      `https://api.x.ant.design/api/history_messages?isZH_CN=${docsLocale.value === "zh-CN"}&sessionId=${conversationKey}`,
      { method: "GET" },
    );
    const responseJson = await response.json();

    if (responseJson?.success) {
      return responseJson?.data || [];
    }
  } catch (error) {
    console.warn("Failed to load history messages:", error);
  }

  return [];
};

const {
  onRequest,
  messages,
  isDefaultMessagesRequesting,
  isRequesting,
  abort,
  queueRequest,
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

const conversationItems = computed<ConversationItemType[]>(() =>
  conversations.value
    .filter(item => item.key !== DEFAULT_KEY)
    .slice()
    .reverse(),
);

const bubbleItems = computed(() =>
  messages.value.map(messageInfo => ({
    ...messageInfo.message,
    key: messageInfo.id,
    status: messageInfo.status,
    loading: messageInfo.status === "loading",
    extraInfo: messageInfo.extraInfo,
  })),
);

const roleConfig = {
  assistant: {
    placement: "start" as const,
  },
  user: {
    placement: "end" as const,
  },
};

function handleAdd() {
  setActiveConversationKey(DEFAULT_KEY);
}

function handleSubmit(value: string) {
  if (!value) {
    return;
  }

  if (activeConversationKey.value !== DEFAULT_KEY) {
    onRequest({ messages: [{ role: "user", content: value }] });
  } else {
    const newConversationKey = `session_${Date.now()}`;

    addConversation({
      key: newConversationKey,
      label: value,
    });
    setActiveConversationKey(newConversationKey);
    queueRequest(newConversationKey, {
      messages: [{ role: "user", content: value }],
    });
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
        activeConversationKey === DEFAULT_KEY
          ? undefined
          : activeConversationKey
      "
      :style="conversationStyle"
      :on-active-change="setActiveConversationKey"
    />

    <Flex vertical gap="small" align="start" :style="{ width: '500px' }">
      <div
        :style="{
          width: '100%',
          height: '350px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }"
      >
        <template v-if="activeConversationKey === DEFAULT_KEY">
          <Flex gap="small" :style="{ maxWidth: '426px' }">
            <img
              src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
              alt="Ant Design X"
              :style="{ width: '64px', height: '64px' }"
            />
            <Flex vertical gap="small">
              <Title :level="3" :style="{ margin: 0, lineHeight: '32px' }">
                {{ locale.welcomeTitle }}
              </Title>
              <Text>{{ locale.welcomeDescription }}</Text>
            </Flex>
          </Flex>
        </template>
        <BubbleList
          v-else
          :items="bubbleItems"
          :role="roleConfig"
          :styles="{ bubble: { maxWidth: '840px' } }"
        />
      </div>

      <Sender
        ref="senderRef"
        :disabled="isDefaultMessagesRequesting"
        :loading="isRequesting"
        :on-submit="handleSubmit"
        :on-cancel="abort"
      />
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
结合 useXConversations 和 queueRequest 实现基于 sessionId 的智能请求排队机制，确保多会话场景下消息按会话有序发送且上下文准确。
</docs>

<docs lang="en-US">
Integrate useXConversations and queueRequest to implement intelligent request queuing based on sessionId, ensuring messages are sent orderly by conversation and context remains accurate in multi-conversation scenarios.
</docs>
