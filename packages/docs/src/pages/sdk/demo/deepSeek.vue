<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";
import type { ComponentProps } from "@antdv-next/x-markdown";

import { SyncOutlined } from "@antdv-next/icons";
import { BubbleList, Sender, Think } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  DeepSeekChatProvider,
  useXChat,
  type XModelParams,
  type XModelResponse,
  XRequest,
} from "@antdv-next/x-sdk";
import { Button, Divider, Flex, Tooltip } from "antdv-next";
import {
  computed,
  defineComponent,
  h,
  ref,
  watch,
  type VNodeArrayChildren,
} from "vue";

import { useLocale } from "@/composables/use-locale";

/**
 * 🔔 请替换 BASE_URL、PATH、MODEL、API_KEY 为您自己的值
 * 🔔 Please replace the BASE_URL, PATH, MODEL, API_KEY with your own values.
 */
const BASE_URL = "https://api.x.ant.design/api/big_model_glm-4.5-flash";

/**
 * 🔔 当前请求中 MODEL 是固定的，请替换为您自己的 BASE_URL 和 MODEL
 * 🔔 The MODEL is fixed in the current request, please replace it with your BASE_URL and MODEL
 */
const MODEL = "glm-4.5-flash";

const content = ref("");
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    deepThinking: isCN ? "深度思考中..." : "Deep thinking...",
    completeThinking: isCN ? "思考完成" : "Complete thinking",
    abort: isCN ? "中止" : "abort",
    addUserMessage: isCN ? "添加用户消息" : "Add a user message",
    addAIMessage: isCN ? "添加AI消息" : "Add an AI message",
    addSystemMessage: isCN ? "添加系统消息" : "Add a system message",
    editLastMessage: isCN ? "编辑最后一条消息" : "Edit the last message",
    placeholder: isCN
      ? "请输入内容，按下 Enter 发送消息"
      : "Please enter content and press Enter to send message",
    waiting: isCN ? "请稍候..." : "Please wait...",
    requestAborted: isCN ? "请求已中止" : "Request is aborted",
    requestFailed: isCN
      ? "请求失败，请重试！"
      : "Request failed, please try again!",
    currentStatus: isCN ? "当前状态：" : "Current status:",
    requesting: isCN ? "请求中" : "Requesting",
    noMessages: isCN
      ? "暂无消息，请输入问题并发送"
      : "No messages yet, please enter a question and send",
    qaCompleted: isCN ? "问答完成" : "Q&A completed",
    retry: isCN ? "重试" : "Retry",
  };
});

const ThinkComponent = defineComponent<ComponentProps>({
  name: "DeepSeekThinkComponent",
  props: {
    streamStatus: String,
  },
  setup(props, { slots, attrs }) {
    const title = ref(locale.value.deepThinking);
    const loading = ref(true);

    watch(
      [() => props.streamStatus, locale],
      () => {
        if (props.streamStatus === "done") {
          title.value = locale.value.completeThinking;
          loading.value = false;
          return;
        }

        title.value = locale.value.deepThinking;
        loading.value = true;
      },
      { immediate: true },
    );

    return () =>
      h(
        Think,
        {
          ...attrs,
          title: title.value,
          loading: loading.value,
        },
        {
          default: () => slots.default?.() as VNodeArrayChildren,
        },
      );
  },
});

const provider = new DeepSeekChatProvider({
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

function addUserMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "user", content: locale.value.addUserMessage },
      status: "success",
    },
  ]);
}

function addAIMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "assistant", content: locale.value.addAIMessage },
      status: "success",
    },
  ]);
}

function addSystemMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "system", content: locale.value.addSystemMessage },
      status: "success",
    },
  ]);
}

function editLastMessage() {
  const lastMessage = messages.value[messages.value.length - 1];

  if (!lastMessage) {
    return;
  }

  setMessage(lastMessage.id, {
    message: {
      role: lastMessage.message.role,
      content: locale.value.editLastMessage,
    },
  });
}

const currentStatus = computed(() => {
  if (isRequesting.value) {
    return locale.value.requesting;
  }

  if (messages.value.length === 0) {
    return locale.value.noMessages;
  }

  return locale.value.qaCompleted;
});

const roleConfig = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    placement: "start" as const,
    contentRender(value: string) {
      return h(XMarkdown, {
        content: value,
        components: {
          think: ThinkComponent,
        },
      });
    },
  },
  user: {
    placement: "end" as const,
  },
}));

const bubbleItems = computed(() =>
  messages.value.map(({ id, message }) => ({
    key: id,
    role: message.role,
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
      <div>{{ locale.currentStatus }}{{ currentStatus }}</div>
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
        <Button :disabled="!messages.length" @click="editLastMessage">
          {{ locale.editLastMessage }}
        </Button>
      </Flex>
    </Flex>

    <Divider />

    <BubbleList
      :style="{ height: '500px' }"
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
使用 DeepSeekChatProvider，接入思考模型，可发送消息、处理数据、终止消息。
</docs>

<docs lang="en-US">
Use DeepSeekChatProvider to integrate thinking models, enabling message sending, data processing, and message termination.
</docs>
