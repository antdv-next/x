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
import { Button, Divider, Flex, Tooltip } from "antdv-next";
import { computed, h, ref } from "vue";

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
  newUserMessage: string;
  newAIResponse: string;
  newSystemMessage: string;
  editMessage: string;
  historyUserMessage: string;
  historyAIResponse: string;
  systemPrompt: string;
  historyLoading: string;
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
    newUserMessage: "添加新的用户消息",
    newAIResponse: "添加新的AI回复",
    newSystemMessage: "添加新的系统消息",
    editMessage: "编辑消息",
    historyUserMessage: "这是一条历史消息",
    historyAIResponse: "这是一条历史回答消息，请发送新消息。",
    systemPrompt: "你是一个有用的聊天机器人",
    historyLoading: "正在加载远程历史消息...",
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
    newUserMessage: "Add a new user message",
    newAIResponse: "Add a new AI response",
    newSystemMessage: "Add a new system message",
    editMessage: "Edit a message",
    historyUserMessage: "This is a historical message",
    historyAIResponse:
      "This is a historical response message, please send a new message.",
    systemPrompt: "You are a helpful chatbot.",
    historyLoading: "Loading remote history messages...",
  },
};

// 使用本地 locale hook，让异步默认消息加载完后和语言切换后的文案保持一致。
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

function createMockFetch() {
  return async (
    _baseURL: Parameters<typeof fetch>[0],
    options: XRequestOptions<XModelParams, Partial<Record<SSEFields, unknown>>>,
  ) => {
    const lastUserMessage = (
      (options.params?.messages || []) as XModelMessage[]
    )
      .reverse()
      .find(message => message.role === "user");
    const reply =
      typeof lastUserMessage?.content === "string"
        ? lastUserMessage.content
        : demoLocale.value.noMessages;
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

const provider = new OpenAIChatProvider({
  request: XRequest<
    XModelParams,
    Partial<Record<SSEFields, unknown>>,
    XModelMessage
  >("mock://async-default-messages", {
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
  isDefaultMessagesRequesting,
  messages,
  setMessages,
  setMessage,
  isRequesting,
  abort,
  onReload,
} = useXChat({
  provider,
  defaultMessages: async ({ conversationKey }) => {
    await new Promise(resolve => setTimeout(resolve, 260));

    return [
      {
        id: `${conversationKey || "history"}_developer`,
        message: {
          role: "developer",
          content: demoLocale.value.systemPrompt,
        },
        status: "success",
      },
      {
        id: `${conversationKey || "history"}_user`,
        message: {
          role: "user",
          content: demoLocale.value.historyUserMessage,
        },
        status: "success",
      },
      {
        id: `${conversationKey || "history"}_assistant`,
        message: {
          role: "assistant",
          content: demoLocale.value.historyAIResponse,
        },
        status: "success",
      },
    ];
  },
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

const visibleMessages = computed(() =>
  messages.value.filter(message => message.message.role !== "developer"),
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
  if (isDefaultMessagesRequesting.value) return demoLocale.value.historyLoading;
  if (isRequesting.value) return demoLocale.value.requesting;
  if (!visibleMessages.value.length) return demoLocale.value.noMessages;
  return demoLocale.value.qaCompleted;
});

const items = computed(() =>
  visibleMessages.value.map(({ id, message, status }) => ({
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

function addMessage(roleName: "user" | "assistant" | "system", text: string) {
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
  const lastMessage = visibleMessages.value[visibleMessages.value.length - 1];
  if (!lastMessage) return;

  setMessage(lastMessage.id, {
    message: {
      role: lastMessage.message.role,
      content: demoLocale.value.editMessage,
    },
  });
}

function onContentChange(value: string) {
  content.value = value;
}

function onSubmit(value: string) {
  if (!value) return;

  onRequest({
    messages: [
      {
        role: "user",
        content: value,
      },
    ],
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
        <Button @click="addMessage('user', demoLocale.newUserMessage)">
          {{ demoLocale.addUserMessage }}
        </Button>
        <Button @click="addMessage('assistant', demoLocale.newAIResponse)">
          {{ demoLocale.addAIMessage }}
        </Button>
        <Button @click="addMessage('system', demoLocale.newSystemMessage)">
          {{ demoLocale.addSystemMessage }}
        </Button>
        <Button :disabled="!visibleMessages.length" @click="editLastMessage">
          {{ demoLocale.editLastMessage }}
        </Button>
      </Flex>
    </Flex>

    <Divider style="margin: 0" />

    <BubbleList style="height: 500px" :role="role" :items="items" />

    <Sender
      :disabled="isDefaultMessagesRequesting"
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
对齐 antdx `async-defaultMessages.tsx`：初始消息异步加载，并继续支持后续消息追加、编辑和请求发送。
</docs>

<docs lang="en-US">
Aligned with antdx `async-defaultMessages.tsx`: load initial messages asynchronously, then keep appending, editing, and sending new requests.
</docs>
