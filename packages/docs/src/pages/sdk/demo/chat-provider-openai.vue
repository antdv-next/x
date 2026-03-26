<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import {
  OpenAIChatProvider,
  useXChat,
  type XModelParams,
  type XModelResponse,
  XRequest,
} from "@antdv-next/x-sdk";
import { Button, Divider, Flex, Typography } from "antdv-next";
import { computed, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

const { Title } = Typography;

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
    newUserMessage: isCN ? "添加新用户消息" : "Add a new user message",
    newAIMessage: isCN ? "添加新AI回复" : "Add a new AI response",
    editMessage: isCN ? "编辑消息" : "Edit a message",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    requestFailed: isCN ? "请求失败" : "Request failed",
    waiting: isCN ? "等待中..." : "Waiting...",
  };
});

const provider = new OpenAIChatProvider({
  request: XRequest<XModelParams, XModelResponse>(
    "https://api.x.ant.design/api/big_model_glm-4.5-flash",
    {
      manual: true,
      params: {
        stream: true,
      },
    },
  ),
});

const { onRequest, messages, abort, isRequesting, setMessages, setMessage } =
  useXChat({
    provider,
    requestPlaceholder: () => {
      return {
        content: locale.value.waiting,
        role: "assistant",
      };
    },
    requestFallback: (_, { error, errorInfo, messageInfo }) => {
      if (error.name === "AbortError") {
        return {
          content: messageInfo?.message?.content || locale.value.requestAborted,
          role: "assistant",
        };
      }
      return {
        content: errorInfo?.error?.message || locale.value.requestFailed,
        role: "assistant",
      };
    },
  });

function addUserMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "user", content: locale.value.newUserMessage },
      status: "success",
    },
  ]);
}

function addAIMessage() {
  setMessages([
    ...messages.value,
    {
      id: Date.now(),
      message: { role: "assistant", content: locale.value.newAIMessage },
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

  if (!lastMessage) {
    return;
  }

  setMessage(lastMessage.id, {
    message: {
      role: lastMessage.message.role,
      content: locale.value.editMessage,
    },
  });
}

function handleChange(value: string) {
  content.value = value;
}

function handleSubmit(nextContent: string) {
  onRequest({
    messages: [
      {
        role: "user",
        content: nextContent,
      },
    ],
    frequency_penalty: 0,
    max_tokens: 1024,
    thinking: {
      type: "disabled",
    },
  });
  content.value = "";
}
</script>

<template>
  <Flex vertical gap="middle">
    <Flex vertical gap="small">
      <Title :level="4">
        {{ locale.messages }}
      </Title>
      <div>{{ locale.requesting }}：{{ `${isRequesting}` }}</div>
      <div>{{ locale.length }}：{{ `${messages.length}` }}</div>
      <div>{{ locale.details }}：</div>
      <div :style="{ height: '500px', overflow: 'auto' }">
        {{ JSON.stringify(messages) }}
      </div>
    </Flex>
    <Divider />
    <Flex vertical gap="small">
      <Title :level="4">
        {{ locale.operations }}
      </Title>
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
OpenAIChatProvider 配合 useXChat 进行数据操作。
</docs>

<docs lang="en-US">
OpenAIChatProvider works with useXChat for data operations.
</docs>
