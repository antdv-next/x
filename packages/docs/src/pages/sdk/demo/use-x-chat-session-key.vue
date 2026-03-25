<script setup lang="ts">
import type { ConversationsProps, SenderRef } from "@antdv-next/x";
import type {
  SSEFields,
  XModelMessage,
  XModelParams,
  XRequestOptions,
} from "@antdv-next/x-sdk";

import { BubbleList, Conversations, Sender, Welcome } from "@antdv-next/x";
import {
  DeepSeekChatProvider,
  useXChat,
  useXConversations,
  XRequest,
} from "@antdv-next/x-sdk";
import { Flex, theme } from "antdv-next";
import { computed, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

const DEFAULT_KEY = "DEFAULT_KEY";

type DemoLocale = {
  conversationItem1: string;
  conversationItem2: string;
  conversationItem3: string;
  conversationItem4: string;
  thinking: string;
  requestAborted: string;
  somethingWrong: string;
  historyUserMessage: string;
  historyAIResponse: string;
};

const locales: Record<"zh-CN" | "en-US", DemoLocale> = {
  "zh-CN": {
    conversationItem1: "会话项目 1",
    conversationItem2: "会话项目 2",
    conversationItem3: "会话项目 3，你可以点击我！",
    conversationItem4: "会话项目 4",
    thinking: "思考中",
    requestAborted: "请求已中止",
    somethingWrong: "出了点问题",
    historyUserMessage: "这是一条历史消息",
    historyAIResponse: "这是一条历史回答消息，请发送新消息。",
  },
  "en-US": {
    conversationItem1: "Conversation Item 1",
    conversationItem2: "Conversation Item 2",
    conversationItem3: "This's Conversation Item 3, you can click me!",
    conversationItem4: "Conversation Item 4",
    thinking: "Thinking",
    requestAborted: "Request aborted",
    somethingWrong: "Something went wrong",
    historyUserMessage: "This is a historical message",
    historyAIResponse:
      "This is a historical response message, please send a new message.",
  },
};

// 这里同样依赖文档站的本地 locale hook，确保切换语言时会话标题和占位文案同步更新。
const { locale } = useLocale();
const demoLocale = computed<DemoLocale>(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const { token } = theme.useToken();
const senderRef = ref<SenderRef>();

function splitText(text: string, step = 16) {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += step) {
    chunks.push(text.slice(index, Math.min(index + step, text.length)));
  }
  return chunks;
}

function createMockFetch() {
  return async (
    _baseURL: Parameters<typeof fetch>[0],
    options: XRequestOptions<XModelParams, Partial<Record<SSEFields, unknown>>>,
  ) => {
    const messages = (options.params?.messages || []) as XModelMessage[];
    const lastUserMessage = [...messages]
      .reverse()
      .find(message => message.role === "user");
    const reply =
      typeof lastUserMessage?.content === "string"
        ? lastUserMessage.content
        : demoLocale.value.somethingWrong;
    const frames = splitText(reply).map(
      (piece, index) =>
        `id: ${index + 1}\nevent: delta\ndata: ${JSON.stringify({
          choices: [{ delta: { role: "assistant", content: piece } }],
        })}\n\n`,
    );
    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          let currentIndex = 0;
          const timer = setInterval(() => {
            if (options.signal?.aborted) {
              clearInterval(timer);
              controller.error(new DOMException("Aborted", "AbortError"));
              return;
            }

            if (currentIndex >= frames.length) {
              clearInterval(timer);
              controller.close();
              return;
            }

            controller.enqueue(encoder.encode(frames[currentIndex]));
            currentIndex += 1;
          }, 120);
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
        },
      },
    );
  };
}

const provider = new DeepSeekChatProvider({
  request: XRequest<
    XModelParams,
    Partial<Record<SSEFields, unknown>>,
    XModelMessage
  >("mock://session-key", {
    manual: true,
    params: {
      model: "glm-4.5-flash",
      stream: true,
      thinking: {
        type: "disabled",
      },
    },
    fetch: createMockFetch(),
  }),
});

const {
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
} = useXConversations({
  defaultConversations: [
    {
      key: DEFAULT_KEY,
      label: "New chat",
    },
    {
      key: "sessionId_1",
      label: demoLocale.value.conversationItem1,
    },
    {
      key: "sessionId_2",
      label: demoLocale.value.conversationItem2,
    },
    {
      key: "sessionId_3",
      label: demoLocale.value.conversationItem3,
    },
    {
      key: "sessionId_4",
      label: demoLocale.value.conversationItem4,
      disabled: true,
    },
  ],
  defaultActiveConversationKey: DEFAULT_KEY,
});

const {
  onRequest,
  messages,
  isDefaultMessagesRequesting,
  isRequesting,
  abort,
  queueRequest,
  setMessage,
} = useXChat({
  provider,
  conversationKey: activeConversationKey,
  defaultMessages: async ({ conversationKey }) => {
    if (!conversationKey || conversationKey === DEFAULT_KEY) {
      return [];
    }

    return [
      {
        id: `${conversationKey}_user`,
        message: {
          role: "user",
          content: `${demoLocale.value.historyUserMessage} (${conversationKey})`,
        },
        status: "success",
      },
      {
        id: `${conversationKey}_assistant`,
        message: {
          role: "assistant",
          content: `${demoLocale.value.historyAIResponse} (${conversationKey})`,
        },
        status: "success",
      },
    ];
  },
  requestPlaceholder: () => ({
    content: demoLocale.value.thinking,
    role: "assistant",
  }),
  requestFallback: async (_, { error, errorInfo, messageInfo }) => {
    if (error.name === "AbortError") {
      return {
        content:
          (typeof messageInfo?.message?.content === "string"
            ? messageInfo.message.content
            : "") || demoLocale.value.requestAborted,
        role: "assistant",
      };
    }

    return {
      content: errorInfo?.error?.message || demoLocale.value.somethingWrong,
      role: "assistant",
    };
  },
});

const style = computed(() => ({
  width: "256px",
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}));

const conversationItems = computed<ConversationsProps["items"]>(() =>
  conversations.value
    .filter(item => item.key !== DEFAULT_KEY)
    .reverse()
    .map(item => {
      if (item.key === "sessionId_1") {
        return { ...item, label: demoLocale.value.conversationItem1 };
      }
      if (item.key === "sessionId_2") {
        return { ...item, label: demoLocale.value.conversationItem2 };
      }
      if (item.key === "sessionId_3") {
        return { ...item, label: demoLocale.value.conversationItem3 };
      }
      if (item.key === "sessionId_4") {
        return { ...item, label: demoLocale.value.conversationItem4 };
      }
      return item;
    }),
);

const items = computed(() =>
  messages.value.map(item => ({
    key: item.id,
    role: item.message.role,
    content: item.message.content,
    status: item.status,
    loading: item.status === "loading",
  })),
);

function onSubmit(value: string) {
  if (!value) return;

  if (activeConversationKey.value !== DEFAULT_KEY) {
    onRequest({
      messages: [
        {
          role: "user",
          content: value,
        },
      ],
    });
  } else {
    const nextConversationKey = `session_${Date.now()}`;
    addConversation({
      key: nextConversationKey,
      label: value,
    });
    setActiveConversationKey(nextConversationKey);
    queueRequest(nextConversationKey, {
      messages: [
        {
          role: "user",
          content: value,
        },
      ],
    });
  }

  senderRef.value?.clear();
}
</script>

<template>
  <Flex gap="small" align="flex-start">
    <Conversations
      :creation="{
        onClick: () => {
          setActiveConversationKey(DEFAULT_KEY);
        },
      }"
      :items="conversationItems"
      :active-key="
        activeConversationKey === DEFAULT_KEY
          ? undefined
          : activeConversationKey
      "
      :style="style"
      :on-active-change="setActiveConversationKey"
    />

    <Flex vertical gap="small" style="width: 500px">
      <div style="height: 350px; display: flex; flex-direction: column">
        <Welcome
          v-if="activeConversationKey === DEFAULT_KEY"
          variant="borderless"
          title="Hello, I'm Ant Design X"
          description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
        />

        <BubbleList
          v-else
          :items="items"
          :role="{
            assistant: { placement: 'start' },
            user: { placement: 'end' },
          }"
          :styles="{
            bubble: {
              maxWidth: 840,
            },
          }"
        />
      </div>

      <Sender
        ref="senderRef"
        :disabled="isDefaultMessagesRequesting"
        :loading="isRequesting"
        :on-submit="onSubmit"
        :on-cancel="abort"
      />
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
对齐 antdx `session-key.tsx`：把 `conversationKey` 与会话列表联动，在新建会话后延迟入队发送请求，并按会话隔离历史消息。
</docs>

<docs lang="en-US">
Aligned with antdx `session-key.tsx`: link `conversationKey` with the conversation list, queue the first request for newly created sessions, and isolate history per conversation.
</docs>
