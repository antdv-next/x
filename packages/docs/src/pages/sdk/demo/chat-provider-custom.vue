<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import { BubbleList, FileCard, Sender } from "@antdv-next/x";
import {
  AbstractChatProvider,
  useXChat,
  XRequest,
  type XRequestOptions,
} from "@antdv-next/x-sdk";
import { Button, Flex } from "antdv-next";
import { computed, h, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

// Type definitions: custom chat system input/output and message structure
interface CustomInput {
  query: string;
  role: "user";
  stream: boolean;
  model: string;
}

interface CustomOutput {
  data: {
    content: string;
    attachments?: {
      name: string;
      url: string;
      type: string;
      size?: number;
    }[];
  };
}

interface CustomMessage {
  content: string;
  role: "user" | "assistant" | "system";
  attachments?: {
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
}

// Custom Provider implementation: extend AbstractChatProvider to implement custom chat logic
class CustomProvider<
  ChatMessage extends CustomMessage = CustomMessage,
  Input extends CustomInput = CustomInput,
  Output extends CustomOutput = CustomOutput,
> extends AbstractChatProvider<ChatMessage, Input, Output> {
  // Transform request parameters: convert user input to standard format
  transformParams(
    requestParams: Partial<Input>,
    options: XRequestOptions<Input, Output, ChatMessage>,
  ): Input {
    if (typeof requestParams !== "object") {
      throw new Error("requestParams must be an object");
    }
    return {
      ...options?.params,
      ...requestParams,
    } as Input;
  }

  // Transform local message: convert request parameters to local message format
  transformLocalMessage(requestParams: Partial<Input>): ChatMessage {
    return {
      content: requestParams.query || "",
      role: "user",
    } as ChatMessage;
  }

  // Transform message: process streaming response data
  transformMessage(info: any): ChatMessage {
    const { originMessage, chunk } = info || {};

    // Handle completion marker or empty data
    if (!chunk || !chunk?.data || chunk?.data?.includes("[DONE]")) {
      return {
        content: originMessage?.content || "",
        role: "assistant",
        attachments: originMessage?.attachments || [],
      } as ChatMessage;
    }

    try {
      // Process streaming data: parse JSON format
      const data = JSON.parse(chunk.data);
      const content = originMessage?.content || "";

      // Merge attachment information to avoid data loss
      const existingAttachments = originMessage?.attachments || [];
      const newAttachments: CustomMessage["attachments"] =
        data.attachments || [];
      const mergedAttachments = [...existingAttachments];

      // Only add new attachments to avoid duplicates
      newAttachments?.forEach(
        (newAttach: NonNullable<CustomMessage["attachments"]>[0]) => {
          if (
            !mergedAttachments.some(existing => existing.url === newAttach.url)
          ) {
            mergedAttachments.push(newAttach);
          }
        },
      );

      return {
        content: `${content}${data.content || ""}`,
        role: "assistant",
        attachments: mergedAttachments,
      } as ChatMessage;
    } catch {
      // If parsing fails, use raw data directly
      return {
        content: `${originMessage?.content || ""}${chunk.data || ""}`,
        role: "assistant",
        attachments: originMessage?.attachments || [],
      } as ChatMessage;
    }
  }
}

const content = ref("");
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    abort: isCN ? "中止" : "abort",
    addUserMessage: isCN ? "添加用户消息" : "Add a user message",
    addAIMessage: isCN ? "添加AI消息" : "Add an AI message",
    addSystemMessage: isCN ? "添加系统消息" : "Add a system message",
    editLastMessage: isCN ? "编辑最后一条消息" : "Edit the last message",
    placeholder: isCN
      ? "请输入内容，按下 Enter 发送消息"
      : "Please enter content and press Enter to send message",
    waiting: isCN ? "等待中..." : "Waiting...",
    mockFailed: isCN
      ? "模拟失败返回，请稍后再试。"
      : "Mock failed return. Please try again later.",
    historyUserMessage: isCN
      ? "这是一条历史消息"
      : "This is a historical message",
    historyAIResponse: isCN
      ? "这是一条历史回答消息，请发送新消息。"
      : "This is a historical response message, please send a new message.",
    editSystemMessage: isCN ? "编辑系统消息" : "Edit a system message",
    editUserMessage: isCN ? "编辑用户消息" : "Edit a user message",
    editAIResponse: isCN ? "编辑AI回复" : "Edit an AI response",
  };
});

// Use custom provider: create custom chat provider instance
const provider = new CustomProvider<CustomMessage, CustomInput, CustomOutput>({
  request: XRequest("https://api.x.ant.design/api/attachment_stream", {
    manual: true,
    params: {
      stream: true,
      model: "qwen2.5-7b-instruct",
    },
  }),
});

// Chat message management: use chat hook to manage messages and requests
const { onRequest, messages, abort, isRequesting, setMessages, setMessage } =
  useXChat({
    provider,
    // Default messages: historical messages displayed on initialization
    defaultMessages: [
      {
        id: "1",
        message: {
          content: locale.value.historyUserMessage,
          role: "user",
        },
        status: "local",
      },
      {
        id: "2",
        message: {
          content: locale.value.historyAIResponse,
          role: "assistant",
        },
        status: "success",
      },
    ],
    requestPlaceholder: {
      content: locale.value.waiting,
      role: "assistant",
    },
    requestFallback: {
      content: locale.value.mockFailed,
      role: "assistant",
    },
  });

// Message role configuration: define layout and styles for different role messages
const roleConfig = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    placement: "start" as const,
    contentRender(contentValue: CustomMessage) {
      return h("div", null, [
        contentValue.content ? h("div", null, contentValue.content) : null,
        contentValue.attachments && contentValue.attachments.length > 0
          ? h(
              "div",
              {
                style: {
                  marginTop: contentValue.content ? "8px" : "0",
                },
              },
              contentValue.attachments.map(attachment =>
                h(
                  "div",
                  {
                    key: attachment.url,
                    style: { marginBottom: "8px" },
                  },
                  [h(FileCard, { type: "file", name: attachment.name })],
                ),
              ),
            )
          : null,
      ]);
    },
  },
  user: {
    placement: "end" as const,
    contentRender(contentValue: CustomMessage) {
      return contentValue.content;
    },
  },
  system: {
    variant: "borderless" as const,
    contentRender(contentValue: CustomMessage) {
      return contentValue.content;
    },
  },
}));

const bubbleItems = computed(() =>
  messages.value.map(({ id, message, status }) => ({
    key: id,
    loading: status === "loading",
    role: message.role,
    content: message,
  })),
);

function addUserMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { content: locale.value.addUserMessage, role: "user" as const },
      status: "local" as const,
    },
  ]);
}

function addAIMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: {
        content: locale.value.addAIMessage,
        role: "assistant" as const,
      },
      status: "success" as const,
    },
  ]);
}

function addSystemMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: {
        role: "system" as const,
        content: locale.value.addSystemMessage,
      },
      status: "success" as const,
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
      content: locale.value.editSystemMessage,
    },
  });
}

function handleChange(value: string) {
  content.value = value;
}

function handleSubmit(nextContent: string) {
  onRequest({
    stream: true,
    role: "user",
    query: nextContent,
  });
  content.value = "";
}
</script>

<template>
  <Flex vertical gap="middle">
    <Flex gap="small" wrap>
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

    <!-- Message list: display all chat messages -->
    <BubbleList
      :style="{ height: '500px' }"
      :role="roleConfig"
      :items="bubbleItems"
    />

    <!-- Sender: user input area, supports sending messages and aborting requests -->
    <Sender
      :loading="isRequesting"
      :value="content"
      :placeholder="locale.placeholder"
      :on-cancel="abort"
      :on-change="handleChange"
      :on-submit="handleSubmit"
    />
  </Flex>
</template>

<docs lang="zh-CN">
配合 X 组件，使用自定义 Provider 实现消息和历史消息的展示。
</docs>

<docs lang="en-US">
Work with X components using custom provider to display messages and historical messages.
</docs>
