<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";
import type {
  SSEFields,
  XModelMessage,
  XModelParams,
  XRequestOptions,
} from "@antdv-next/x-sdk";

import { SyncOutlined } from "@antdv-next/icons";
import { BubbleList, Sender } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { OpenAIChatProvider, useXChat, XRequest } from "@antdv-next/x-sdk";
import { Button, Flex, Tooltip } from "antdv-next";
import { computed, h, ref, watch } from "vue";

import { useLocale } from "@/composables/use-locale";

type DemoLocale = {
  abort: string;
  addUserMessage: string;
  addAIMessage: string;
  addSystemMessage: string;
  editLastMessage: string;
  placeholder: string;
  waiting: string;
  requestFailed: string;
  requestAborted: string;
  noMessages: string;
  requesting: string;
  qaCompleted: string;
  retry: string;
  currentStatus: string;
  historyUserMessage: string;
  historyAIResponse: string;
  deleteFirstMessage: string;
  replyPrefix: string;
  systemPromptLabel: string;
  historyLoaded: string;
};

const locales: Record<"zh-CN" | "en-US", DemoLocale> = {
  "zh-CN": {
    abort: "中止",
    addUserMessage: "添加用户消息",
    addAIMessage: "添加AI消息",
    addSystemMessage: "添加系统消息",
    editLastMessage: "编辑最后一条消息",
    placeholder: "请输入内容，按下 Enter 发送消息",
    waiting: "请稍候...",
    requestFailed: "请求失败，请重试！",
    requestAborted: "请求已中止",
    noMessages: "暂无消息，请输入问题并发送",
    requesting: "请求中",
    qaCompleted: "问答完成",
    retry: "重试",
    currentStatus: "当前状态：",
    historyUserMessage: "这是一条历史消息",
    historyAIResponse: "这是一条历史回答消息，请发送新消息。",
    deleteFirstMessage: "删除第一条消息",
    replyPrefix: "模拟回答",
    systemPromptLabel: "系统提示",
    historyLoaded: "历史消息已加载",
  },
  "en-US": {
    abort: "Abort",
    addUserMessage: "Add a user message",
    addAIMessage: "Add an AI message",
    addSystemMessage: "Add a system message",
    editLastMessage: "Edit the last message",
    placeholder: "Please enter content and press Enter to send message",
    waiting: "Please wait...",
    requestFailed: "Request failed, please try again!",
    requestAborted: "Request is aborted",
    noMessages: "No messages yet, please enter a question and send",
    requesting: "Requesting",
    qaCompleted: "Q&A completed",
    retry: "Retry",
    currentStatus: "Current status:",
    historyUserMessage: "This is a historical message",
    historyAIResponse:
      "This is a historical response message, please send a new message.",
    deleteFirstMessage: "Delete the first message",
    replyPrefix: "Mock answer",
    systemPromptLabel: "System prompt",
    historyLoaded: "History loaded",
  },
};

// 这里必须使用文档站本地的 i18n hook，而不是读取 location/pathname。
// 顶部语言切换只会更新 vue-i18n 状态，直接读 URL 会导致 demo 内文案不响应切换。
const { locale } = useLocale();
const demoLocale = computed<DemoLocale>(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const content = ref("");

function splitText(text: string, step = 18) {
  const chunks: string[] = [];

  for (let index = 0; index < text.length; index += step) {
    chunks.push(text.slice(index, Math.min(index + step, text.length)));
  }

  return chunks;
}

function buildSSEFrame(
  data: Partial<Record<SSEFields, unknown>>,
  index: number,
) {
  return `id: ${index}\nevent: delta\ndata: ${JSON.stringify(data)}\n\n`;
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
    const lastDeveloperMessage = [...messages]
      .reverse()
      .find(message => message.role === "developer");
    const localeText = demoLocale.value;
    const reply = [
      `## ${localeText.replyPrefix}`,
      "",
      typeof lastUserMessage?.content === "string"
        ? lastUserMessage.content
        : localeText.noMessages,
      "",
      `- ${localeText.systemPromptLabel}: ${
        typeof lastDeveloperMessage?.content === "string"
          ? lastDeveloperMessage.content
          : "-"
      }`,
      `- ${localeText.historyLoaded}`,
    ].join("\n");

    const frames = splitText(reply).map((piece, index) =>
      buildSSEFrame(
        {
          choices: [
            {
              delta: {
                role: "assistant",
                content: piece,
              },
            },
          ],
        },
        index + 1,
      ),
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

const provider = new OpenAIChatProvider({
  request: XRequest<
    XModelParams,
    Partial<Record<SSEFields, unknown>>,
    XModelMessage
  >("mock://openai", {
    manual: true,
    params: {
      model: "THUDM/glm-4-9b-chat",
      stream: true,
    },
    fetch: createMockFetch(),
  }),
});

const {
  onRequest,
  messages,
  removeMessage,
  setMessages,
  setMessage,
  isRequesting,
  abort,
  onReload,
} = useXChat({
  provider,
  defaultMessages: [
    {
      id: "1",
      message: {
        role: "user",
        content: demoLocale.value.historyUserMessage,
      },
      status: "success",
    },
    {
      id: "2",
      message: {
        role: "assistant",
        content: demoLocale.value.historyAIResponse,
      },
      status: "success",
    },
  ],
  requestPlaceholder: () => ({
    content: demoLocale.value.waiting,
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
      content: errorInfo?.error?.message || demoLocale.value.requestFailed,
      role: "assistant",
    };
  },
});

watch(
  demoLocale,
  localeText => {
    setMessage("1", {
      message: {
        role: "user",
        content: localeText.historyUserMessage,
      },
    });
    setMessage("2", {
      message: {
        role: "assistant",
        content: localeText.historyAIResponse,
      },
    });
  },
  { deep: true },
);

const role = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    placement: "start",
    contentRender(content: string) {
      return h(XMarkdown, {
        content: content.replace(/\n\n/g, "<br/><br/>"),
      });
    },
  },
  user: {
    placement: "end",
  },
}));

const statusText = computed(() => {
  if (isRequesting.value) {
    return demoLocale.value.requesting;
  }

  if (!messages.value.length) {
    return demoLocale.value.noMessages;
  }

  return demoLocale.value.qaCompleted;
});

const items = computed(() =>
  messages.value.map(({ id, message, status }) => ({
    key: id,
    role: message.role,
    status,
    loading: status === "loading",
    content: typeof message.content === "string" ? message.content : "",
    footer:
      message.role === "assistant"
        ? h(
            Tooltip,
            { title: demoLocale.value.retry },
            {
              default: () =>
                h(Button, {
                  size: "small",
                  type: "text",
                  icon: h(SyncOutlined),
                  style: {
                    marginInlineEnd: "auto",
                  },
                  onClick: () => {
                    onReload(id, {
                      userAction: "retry",
                    } as Partial<XModelParams>);
                  },
                }),
            },
          )
        : undefined,
  })),
);

function appendMessage(
  roleName: "user" | "assistant" | "system",
  text: string,
) {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: {
        role: roleName,
        content: text,
      },
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
      content: demoLocale.value.editLastMessage,
    },
  });
}

function onContentChange(value: string) {
  content.value = value;
}

function onSubmit(value: string) {
  if (!value) {
    return;
  }

  onRequest({
    messages: [
      {
        role: "user",
        content: value,
      },
    ],
    frequency_penalty: 0,
    max_completion_tokens: 1024,
  });
  content.value = "";
}
</script>

<template>
  <Flex vertical gap="middle">
    <Flex vertical gap="middle">
      <div>{{ demoLocale.currentStatus }} {{ statusText }}</div>

      <Flex wrap gap="small" align="center">
        <Button :disabled="!isRequesting" @click="abort">
          {{ demoLocale.abort }}
        </Button>
        <Button @click="appendMessage('user', demoLocale.addUserMessage)">
          {{ demoLocale.addUserMessage }}
        </Button>
        <Button @click="appendMessage('assistant', demoLocale.addAIMessage)">
          {{ demoLocale.addAIMessage }}
        </Button>
        <Button @click="appendMessage('system', demoLocale.addSystemMessage)">
          {{ demoLocale.addSystemMessage }}
        </Button>
        <Button :disabled="!messages.length" @click="editLastMessage">
          {{ demoLocale.editLastMessage }}
        </Button>
        <Button
          :disabled="!messages.length"
          @click="removeMessage(messages[0]!.id)"
        >
          {{ demoLocale.deleteFirstMessage }}
        </Button>
      </Flex>
    </Flex>

    <BubbleList style="height: 500px" :role="role" :items="items" />

    <Sender
      :loading="isRequesting"
      :value="content"
      :on-cancel="abort"
      :on-change="onContentChange"
      :placeholder="demoLocale.placeholder"
      :on-submit="onSubmit"
    />
  </Flex>
</template>

<docs lang="zh-CN">
对齐 antdx `openai.tsx`：展示默认历史消息、消息编辑、删除、重试，以及通过 `OpenAIChatProvider + useXChat` 发送流式消息。
</docs>

<docs lang="en-US">
Aligned with antdx `openai.tsx`: shows default history messages, edit/delete/retry actions, and streaming chat with `OpenAIChatProvider + useXChat`.
</docs>
