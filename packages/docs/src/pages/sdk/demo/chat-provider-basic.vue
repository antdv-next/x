<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { DefaultChatProvider, useXChat, XRequest } from "@antdv-next/x-sdk";
import { Button, Divider, Flex, Typography } from "antdv-next";
import { computed, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

const { Title } = Typography;

interface ChatInput {
  query: string;
  stream?: boolean;
}

interface ChatOutput {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

interface SystemMessage {
  role: "system";
  content: string;
}

const content = ref("");
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";
  return {
    messages: isCN ? "消息数据（messages）" : "Messages Data",
    requesting: isCN ? "是否在请求中" : "Is Requesting",
    length: isCN ? "数据长度" : "Data Length",
    details: isCN ? "数据详情" : "Data Details",
    operations: isCN ? "数据操作" : "Data Operations",
    sendRequest: isCN ? "发送请求" : "Send Request",
    placeholder: isCN
      ? "请输入内容，按下 Enter 发送消息"
      : "Please enter content and press Enter to send message",
    abort: isCN ? "中止" : "Abort",
    addUserMsg: isCN ? "添加用户消息" : "Add User Message",
    addAIMsg: isCN ? "添加AI消息" : "Add AI Message",
    addSystemMsg: isCN ? "添加系统消息" : "Add System Message",
    editLastMsg: isCN ? "编辑最后一条消息" : "Edit Last Message",
    waiting: isCN ? "等待中..." : "Waiting...",
    mockFailed: isCN ? "模拟失败" : "Mock failed",
  };
});

const provider = new DefaultChatProvider<
  ChatOutput | ChatInput | SystemMessage,
  ChatInput,
  ChatOutput
>({
  request: XRequest(
    "https://api.x.ant.design/api/default_chat_provider_stream",
    {
      manual: true,
    },
  ),
});

const { onRequest, messages, abort, isRequesting, setMessages, setMessage } =
  useXChat({
    provider,
    requestPlaceholder: {
      choices: [
        { message: { content: locale.value.waiting, role: "assistant" } },
      ],
    },
    requestFallback: {
      choices: [
        { message: { content: locale.value.mockFailed, role: "assistant" } },
      ],
    },
  });

function addUserMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { query: locale.value.addUserMsg },
      status: "local",
    },
  ]);
}

function addAIMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: {
        choices: [
          {
            message: {
              content: locale.value.addAIMsg,
              role: "assistant",
            },
          },
        ],
      },
      status: "success",
    },
  ]);
}

function addSystemMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "system", content: locale.value.addSystemMsg },
      status: "success",
    },
  ]);
}

function editLastMessage() {
  const lastMessage = messages.value[messages.value.length - 1];
  if (!lastMessage) return;

  const isSystem = (lastMessage.message as SystemMessage).role === "system";
  const isUser = !!(lastMessage.message as ChatInput).query;
  const isAI = !!(lastMessage.message as ChatOutput).choices;

  if (isSystem) {
    setMessage(lastMessage.id, {
      message: { role: "system", content: locale.value.editLastMsg },
    });
  } else if (isUser) {
    setMessage(lastMessage.id, {
      message: { query: locale.value.editLastMsg },
    });
  } else if (isAI) {
    setMessage(lastMessage.id, {
      message: {
        choices: [
          {
            message: {
              content: locale.value.editLastMsg,
              role: "assistant",
            },
          },
        ],
      },
    });
  }
}

function handleChange(value: string) {
  content.value = value;
}

function handleSubmit(nextContent: string) {
  onRequest({
    stream: false,
    query: nextContent,
  });
  content.value = "";
}
</script>

<template>
  <Flex vertical gap="middle">
    <Flex vertical gap="small">
      <Title :level="4">{{ locale.messages }}</Title>
      <div>{{ locale.requesting }}：{{ `${isRequesting}` }}</div>
      <div>{{ locale.length }}：{{ `${messages.length}` }}</div>
      <div>{{ locale.details }}：</div>
      <div :style="{ height: '500px', overflow: 'auto' }">
        {{ JSON.stringify(messages) }}
      </div>
    </Flex>
    <Divider />
    <Flex vertical gap="small">
      <Title :level="4">{{ locale.operations }}</Title>
      <div>{{ locale.sendRequest }}</div>
      <Sender
        :loading="isRequesting"
        :value="content"
        :placeholder="locale.placeholder"
        :on-cancel="abort"
        :on-change="handleChange"
        :on-submit="handleSubmit"
      />
      <Flex gap="small">
        <Button :disabled="!isRequesting" @click="abort">
          {{ locale.abort }}
        </Button>
        <Button @click="addUserMessage">
          {{ locale.addUserMsg }}
        </Button>
        <Button @click="addAIMessage">
          {{ locale.addAIMsg }}
        </Button>
        <Button @click="addSystemMessage">
          {{ locale.addSystemMsg }}
        </Button>
        <Button :disabled="!messages.length" @click="editLastMessage">
          {{ locale.editLastMsg }}
        </Button>
      </Flex>
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
DefaultChatProvider 配合 useXChat 进行数据操作。
</docs>

<docs lang="en-US">
DefaultChatProvider works with useXChat for data operations.
</docs>
