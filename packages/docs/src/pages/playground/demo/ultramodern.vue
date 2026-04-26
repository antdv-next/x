<script setup lang="ts">
import type {
  BubbleListProps,
  BubbleListRef,
  ConversationItemType,
  ConversationsProps,
  SenderProps,
  SenderRef,
  XProviderProps,
} from "@antdv-next/x";
import type {
  ConversationData,
  DefaultMessageInfo,
  SSEFields,
  XModelMessage,
  XModelParams,
  XModelResponse,
} from "@antdv-next/x-sdk";

import {
  DeleteOutlined,
  OpenAIOutlined,
  SyncOutlined,
} from "@antdv-next/icons";
import {
  Actions,
  BubbleList,
  Conversations,
  Sender,
  XProvider,
} from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  DeepSeekChatProvider,
  useXChat,
  useXConversations,
  XRequest,
} from "@antdv-next/x-sdk";
import { Flex, message } from "antdv-next";
import enUS from "antdv-next/dist/locale/en_US";
import zhCN from "antdv-next/dist/locale/zh_CN";
import { createStyles } from "antdv-style";
import dayjs from "dayjs";
import { computed, h, nextTick, onMounted, ref, watch } from "vue";
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/dark.css";
import "@antdv-next/x-markdown/themes/light.css";
import { useDarkMode } from "@/composables/use-dark-mode";
import { useLocale } from "@/composables/use-locale";

const useStyles = createStyles(({ token, css }) => ({
  layout: css`
    width: 100%;
    height: 760px;
    display: flex;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    overflow: hidden;
  `,
  side: css`
    width: 280px;
    display: flex;
    flex-direction: column;
    padding: 0 12px;
    box-sizing: border-box;
    background: ${token.colorBgLayout};
    border-inline-end: 1px solid ${token.colorBorderSecondary};
  `,
  logo: css`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 24px;
    gap: 8px;
    margin: 24px 0;

    span {
      font-weight: 600;
      color: ${token.colorText};
      font-size: 16px;
    }
  `,
  conversations: css`
    overflow-y: auto;
    margin-top: 12px;
    padding: 0;
    flex: 1;

    .ant-conversations-list {
      padding-inline-start: 0;
    }
  `,
  chat: css`
    flex: 1;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .ant-bubble-content-updating {
      background-image: linear-gradient(
        90deg,
        #ff6b23 0%,
        #af3cb8 31%,
        #53b6ff 89%
      );
      background-size: 100% 2px;
      background-repeat: no-repeat;
      background-position: bottom;
    }
  `,
  chatList: css`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-top: ${token.margin}px;
  `,
  chatSender: css`
    padding: ${token.paddingSM}px;
  `,
  chatEmpty: css`
    display: flex;
    justify-content: center;
  `,
  startPage: css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 320px;
  `,
  agentName: css`
    text-align: center;
    font-size: 32px;
    margin-bottom: 38px;
    font-weight: 600;
    line-height: 1.25;
  `,
}));

const { locale: docsLocale } = useLocale();
const { isDark } = useDarkMode();

const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const xProviderLocale = computed<XProviderProps["locale"]>(() =>
  docsLocale.value === "zh-CN" ? zhCN : enUS,
);

const t = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    title: "Antdv Next X",
    whatIsAntDesignX: isCN ? "Antdv Next X 是什么？" : "What is Antdv Next X?",
    installAndImport: isCN
      ? "如何快速安装和导入组件？"
      : "How to quickly install and import components?",
    newAgiHybrid: isCN ? "新的 AGI 混合界面" : "New AGI Hybrid Interface",
    today: isCN ? "今天" : "Today",
    yesterday: isCN ? "昨天" : "Yesterday",
    currentConversation: isCN ? "当前对话" : "Current",
    newConversation: isCN ? "新对话" : "New Conversation",
    retry: isCN ? "重试" : "Retry",
    delete: isCN ? "删除" : "Delete",
    placeholder: isCN ? "问我任何问题..." : "Ask me anything...",
    slotTextStart: isCN
      ? "请帮我介绍 Antdv Next X 中"
      : "Please help me introduce the usage of ",
    slotTextEnd: isCN ? "的用法。" : "in Antdv Next X.",
    deepThink: isCN ? "深度思考" : "Deep Think",
    noData: isCN ? "暂无数据" : "No data",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    requestFailed: isCN
      ? "请求失败，请稍后重试"
      : "Request failed, please try again",
    newConversationWarn: isCN
      ? "当前已经是新会话"
      : "Already in a new conversation",
    agentName: isCN ? "你好，我是 Antv Next X" : "Hi, I'm Antv Next X",
    aiMessage1: isCN
      ? "我们推出了新的 AGI 混合界面范式，支持多模态交互、结构化操作和可扩展代理能力。"
      : "We released a new AGI hybrid interface pattern with multimodal interaction, structured actions, and extensible agent capabilities.",
    aiMessage2: isCN
      ? "你可以先安装 `@antdv-next/x`，再按需引入组件，例如 `Sender`、`BubbleList`、`Conversations`。"
      : "You can install `@antdv-next/x` first, then import components on demand like `Sender`, `BubbleList`, and `Conversations`.",
  };
});

const defaultConversations = computed<ConversationItemType[]>(() => [
  {
    key: "default-0",
    label: t.value.whatIsAntDesignX,
    group: t.value.today,
  },
  {
    key: "default-1",
    label: t.value.installAndImport,
    group: t.value.today,
  },
  {
    key: "default-2",
    label: t.value.newAgiHybrid,
    group: t.value.yesterday,
  },
]);

const historyMessages = computed<
  Record<string, DefaultMessageInfo<XModelMessage>[]>
>(() => ({
  "default-1": [
    {
      message: { role: "user", content: t.value.installAndImport },
      status: "success",
    },
    {
      message: { role: "assistant", content: t.value.aiMessage2 },
      status: "success",
    },
  ],
  "default-2": [
    {
      message: { role: "user", content: t.value.newAgiHybrid },
      status: "success",
    },
    {
      message: { role: "assistant", content: t.value.aiMessage1 },
      status: "success",
    },
  ],
}));

function historyMessageFactory(conversationKey: string) {
  return historyMessages.value[conversationKey] || [];
}

const conversationActivity = ref<Record<string, boolean>>({
  "default-0": false,
  "default-1": true,
  "default-2": true,
});

const providerCaches = new Map<string, DeepSeekChatProvider>();

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
          stream: true,
          model: "glm-4.5-flash",
        },
      },
    ),
  });

  providerCaches.set(conversationKey, provider);
  return provider;
}

const { styles } = useStyles();
const senderRef = ref<SenderRef>();
const listRef = ref<BubbleListRef>();
const deepThink = ref(true);
const curConversation = ref<string>("default-0");
const activeConversation = ref<string>();
const senderSlotConfig = computed<NonNullable<SenderProps["slotConfig"]>>(
  () => [
    { type: "text", value: t.value.slotTextStart },
    {
      type: "select",
      key: "destination",
      props: {
        defaultValue: "X SDK",
        options: ["X SDK", "X Markdown", "Bubble"],
      },
    },
    { type: "text", value: t.value.slotTextEnd },
  ],
);

const { conversations, addConversation, setConversations } = useXConversations({
  defaultConversations: defaultConversations.value,
});

const { onRequest, messages, isRequesting, abort, onReload } = useXChat({
  provider: computed(() => providerFactory(curConversation.value)),
  conversationKey: curConversation,
  defaultMessages: (info?: { conversationKey?: ConversationData["key"] }) =>
    historyMessageFactory(String(info?.conversationKey || "")),
  requestPlaceholder: () => ({
    content: t.value.noData,
    role: "assistant",
  }),
  requestFallback: (_, { error, errorInfo, messageInfo }) => {
    if (error.name === "AbortError") {
      return {
        content:
          typeof messageInfo?.message?.content === "string"
            ? messageInfo.message.content
            : t.value.requestAborted,
        role: "assistant",
      };
    }

    return {
      content: errorInfo?.error?.message || t.value.requestFailed,
      role: "assistant",
    };
  },
});

function switchConversation(nextConversationKey: string) {
  if (nextConversationKey === curConversation.value) {
    return;
  }

  curConversation.value = nextConversationKey;
}

watch(
  curConversation,
  () => {
    nextTick(() => {
      senderRef.value?.focus({ cursor: "end" });
    });
  },
  { immediate: true },
);

onMounted(() => {
  senderRef.value?.focus({ cursor: "end" });
});

const roleConfig = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    placement: "start",
    footer: (content: string, info: any) => {
      if (info.status === "updating" || info.status === "loading") {
        return null;
      }

      return h(Actions, {
        items: [
          {
            key: "retry",
            label: t.value.retry,
            icon: h(SyncOutlined),
            onItemClick: () => {
              if (info.key != null) {
                onReload(info.key, { userAction: "retry" });
              }
            },
          },
          {
            key: "copy",
            actionRender: () => h(Actions.Copy, { text: content }),
          },
        ],
      });
    },
    contentRender: (content: string, info: any) =>
      h(XMarkdown, {
        content: content || "",
        className: markdownClass.value,
        paragraphTag: "div",
        streaming: {
          hasNextChunk: info.status === "updating",
          enableAnimation: true,
        },
      }),
  },
  user: {
    placement: "end",
  },
}));

const bubbleItems = computed<BubbleListProps["items"]>(() =>
  messages.value.map(item => ({
    ...item.message,
    key: item.id,
    status: item.status,
    loading: item.status === "loading",
    extraInfo: item.extraInfo,
  })),
);

const displayConversations = computed<ConversationsProps["items"]>(() =>
  conversations.value.map(item => ({
    ...item,
    label:
      item.key === activeConversation.value
        ? `[${t.value.currentConversation}]${String(item.label || "")}`
        : item.label,
  })),
);

const menuConfig: ConversationsProps["menu"] = conversation => ({
  items: [
    {
      label: t.value.delete,
      key: "delete",
      icon: h(DeleteOutlined),
      danger: true,
    },
  ],
  onClick: info => {
    info.domEvent?.stopPropagation?.();
    const next = conversations.value.filter(
      item => item.key !== conversation.key,
    );
    const nextKey = String(next[0]?.key || "");
    setConversations(next);

    if (conversation.key === curConversation.value) {
      curConversation.value = nextKey;
    }
  },
});

function handleSubmit(value: string) {
  if (!value) {
    return;
  }

  conversationActivity.value[curConversation.value] = true;

  onRequest({
    messages: [{ role: "user", content: value }],
    thinking: {
      type: "disabled",
    },
  });

  activeConversation.value = curConversation.value;
  senderRef.value?.clear();
  nextTick(() => {
    listRef.value?.scrollTo({ top: "bottom" });
  });
}

function handleCreateConversation() {
  if (!conversationActivity.value[curConversation.value]) {
    message.error(t.value.newConversationWarn);
    return;
  }

  const key = dayjs().valueOf().toString();
  conversationActivity.value[key] = false;
  addConversation({
    key,
    label: `${t.value.newConversation} ${conversations.value.length + 1}`,
    group: t.value.today,
  });
  switchConversation(key);
}
</script>

<template>
  <XProvider :locale="xProviderLocale">
    <div :class="styles.layout">
      <div :class="styles.side">
        <div :class="styles.logo">
          <img
            src="https://x.antdv-next.com/x.svg"
            draggable="false"
            :alt="t.title"
            width="24"
            height="24"
          />
          <span>{{ t.title }}</span>
        </div>

        <Conversations
          :creation="{ onClick: handleCreateConversation }"
          :items="displayConversations"
          :class="styles.conversations"
          :active-key="curConversation"
          :on-active-change="
            (value: string | number) => switchConversation(String(value))
          "
          :menu="menuConfig"
          groupable
          :styles="{ item: { padding: '0 8px' } }"
        />
      </div>

      <section
        :class="[styles.chat, bubbleItems.length === 0 && styles.chatEmpty]"
      >
        <div v-if="bubbleItems.length > 0" :class="styles.chatList">
          <BubbleList
            v-if="bubbleItems.length"
            ref="listRef"
            :items="bubbleItems"
            :role="roleConfig"
            :styles="{
              root: {
                maxWidth: '940px',
                marginBlockEnd: '24px',
              },
            }"
          />
        </div>

        <div
          :class="[styles.chatSender, !bubbleItems.length && styles.startPage]"
        >
          <div v-if="!bubbleItems.length" :class="styles.agentName">
            {{ t.agentName }}
          </div>

          <Sender
            ref="senderRef"
            :key="curConversation"
            :suffix="false"
            :slot-config="senderSlotConfig"
            :loading="isRequesting"
            :placeholder="t.placeholder"
            :auto-size="{ minRows: 3, maxRows: 6 }"
            :on-submit="handleSubmit"
            :on-cancel="abort"
          >
            <template #footer="{ components }">
              <Flex justify="space-between" align="center">
                <Flex gap="small" align="center">
                  <Sender.Switch
                    :value="deepThink"
                    :on-change="(checked: boolean) => (deepThink = checked)"
                  >
                    <template #icon>
                      <OpenAIOutlined />
                    </template>
                    {{ t.deepThink }}
                  </Sender.Switch>
                </Flex>
                <Flex align="center">
                  <component
                    :is="
                      isRequesting
                        ? components.LoadingButton
                        : components.SendButton
                    "
                  />
                </Flex>
              </Flex>
            </template>
          </Sender>
        </div>
      </section>
    </div>
  </XProvider>
</template>

<docs lang="zh-CN">
更现代的多会话聊天样板，基于 `@antdv-next/x` 构建。
</docs>

<docs lang="en-US">
Ultramodern multi-conversation chat sample built with `@antdv-next/x`.
</docs>
