<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";
import type { ComponentProps } from "@antdv-next/x-markdown";
import type {
  SSEFields,
  XModelMessage,
  XModelParams,
  XRequestOptions,
} from "@antdv-next/x-sdk";

import { SyncOutlined } from "@antdv-next/icons";
import { BubbleList, Sender, Think } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { DeepSeekChatProvider, useXChat, XRequest } from "@antdv-next/x-sdk";
import { Button, Divider, Flex, Tooltip } from "antdv-next";
import { computed, defineComponent, h, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

type DemoLocale = {
  deepThinking: string;
  completeThinking: string;
  abort: string;
  addUserMessage: string;
  addAIMessage: string;
  addSystemMessage: string;
  editLastMessage: string;
  placeholder: string;
  waiting: string;
  requestFailed: string;
  requestAborted: string;
  currentStatus: string;
  requesting: string;
  noMessages: string;
  qaCompleted: string;
  retry: string;
};

const locales: Record<"zh-CN" | "en-US", DemoLocale> = {
  "zh-CN": {
    deepThinking: "深度思考中...",
    completeThinking: "思考完成",
    abort: "中止",
    addUserMessage: "添加用户消息",
    addAIMessage: "添加AI消息",
    addSystemMessage: "添加系统消息",
    editLastMessage: "编辑最后一条消息",
    placeholder: "请输入内容，按下 Enter 发送消息",
    waiting: "请稍候...",
    requestFailed: "请求失败，请重试！",
    requestAborted: "请求已中止",
    currentStatus: "当前状态：",
    requesting: "请求中",
    noMessages: "暂无消息，请输入问题并发送",
    qaCompleted: "问答完成",
    retry: "重试",
  },
  "en-US": {
    deepThinking: "Deep thinking...",
    completeThinking: "Complete thinking",
    abort: "Abort",
    addUserMessage: "Add a user message",
    addAIMessage: "Add an AI message",
    addSystemMessage: "Add a system message",
    editLastMessage: "Edit the last message",
    placeholder: "Please enter content and press Enter to send message",
    waiting: "Please wait...",
    requestFailed: "Request failed, please try again!",
    requestAborted: "Request is aborted",
    currentStatus: "Current status:",
    requesting: "Requesting",
    noMessages: "No messages yet, please enter a question and send",
    qaCompleted: "Q&A completed",
    retry: "Retry",
  },
};

// 用本地 locale hook 驱动 demo 文案，避免依赖 URL 造成语言切换不生效。
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
    const messages = (options.params?.messages || []) as XModelMessage[];
    const lastUserMessage = [...messages]
      .reverse()
      .find(message => message.role === "user");
    const question =
      typeof lastUserMessage?.content === "string"
        ? lastUserMessage.content
        : demoLocale.value.noMessages;
    const reasoning = splitText(
      `${demoLocale.value.deepThinking} ${question} ${demoLocale.value.completeThinking}`,
      16,
    ).map(
      (piece, index) =>
        `id: ${index + 1}\nevent: delta\ndata: ${JSON.stringify({
          choices: [{ delta: { reasoning_content: piece } }],
        })}\n\n`,
    );
    const contentFrames = splitText(question).map(
      (piece, index) =>
        `id: ${reasoning.length + index + 1}\nevent: delta\ndata: ${JSON.stringify(
          {
            choices: [{ delta: { role: "assistant", content: piece } }],
          },
        )}\n\n`,
    );
    const frames = [...reasoning, ...contentFrames];
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
  >("mock://deepseek", {
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
  onRequest,
  messages,
  setMessages,
  setMessage,
  isRequesting,
  abort,
  onReload,
} = useXChat({
  provider,
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

const ThinkComponent = defineComponent({
  name: "UseXChatDeepSeekThink",
  props: {
    streamStatus: {
      type: String as () => ComponentProps["streamStatus"],
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const title = computed(() =>
      props.streamStatus === "done"
        ? demoLocale.value.completeThinking
        : demoLocale.value.deepThinking,
    );
    const loading = computed(() => props.streamStatus !== "done");

    return () =>
      h(
        Think,
        {
          title: title.value,
          loading: loading.value,
        },
        {
          default: () => slots.default?.(),
        },
      );
  },
});

const role = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    placement: "start",
    contentRender(content: string) {
      return h(XMarkdown, {
        content,
        components: {
          think: ThinkComponent,
        },
      });
    },
  },
  user: {
    placement: "end",
  },
}));

const statusText = computed(() => {
  if (isRequesting.value) return demoLocale.value.requesting;
  if (!messages.value.length) return demoLocale.value.noMessages;
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
  const lastMessage = messages.value[messages.value.length - 1];
  if (!lastMessage) return;

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
  if (!value) return;

  onRequest({
    messages: [
      {
        role: "user",
        content: value,
      },
    ],
    thinking: {
      type: "disabled",
    },
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
        <Button @click="addMessage('user', demoLocale.addUserMessage)">
          {{ demoLocale.addUserMessage }}
        </Button>
        <Button @click="addMessage('assistant', demoLocale.addAIMessage)">
          {{ demoLocale.addAIMessage }}
        </Button>
        <Button @click="addMessage('system', demoLocale.addSystemMessage)">
          {{ demoLocale.addSystemMessage }}
        </Button>
        <Button :disabled="!messages.length" @click="editLastMessage">
          {{ demoLocale.editLastMessage }}
        </Button>
      </Flex>
    </Flex>

    <Divider style="margin: 0" />

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
对齐 antdx `deepSeek.tsx`：展示 `DeepSeekChatProvider` 输出思考过程与最终回答，并保留消息追加、编辑和重试操作。
</docs>

<docs lang="en-US">
Aligned with antdx `deepSeek.tsx`: shows `DeepSeekChatProvider` reasoning plus final answer, while keeping append/edit/retry message actions.
</docs>
