<script setup lang="ts">
import type { ConversationsProps } from "@antdv-next/x";

import { Conversations } from "@antdv-next/x";
import { useXConversations } from "@antdv-next/x-sdk";
import { Button, Flex, theme } from "antdv-next";
import { computed } from "vue";

import { useLocale } from "@/composables/use-locale";

const { token } = theme.useToken();
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    addConversation: isCN ? "新建会话" : "New Conversation",
    conversation: isCN ? "会话" : "Conversation",
    activeKey: isCN ? "当前激活：" : "Active key:",
  };
});

const {
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
} = useXConversations({
  defaultConversations: [
    { key: "conv_1", label: "Conversation 1" },
    { key: "conv_2", label: "Conversation 2" },
    { key: "conv_3", label: "Conversation 3" },
  ],
  defaultActiveConversationKey: "conv_1",
});

const conversationStyle = computed(() => ({
  width: "256px",
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}));

const conversationItems = computed<ConversationsProps["items"]>(() =>
  conversations.value.map(c => ({ key: c.key, label: c.label })),
);

let counter = 4;

function handleAdd() {
  addConversation({
    key: `conv_${counter}`,
    label: `${locale.value.conversation} ${counter}`,
  });
  counter++;
}
</script>

<template>
  <Flex vertical gap="middle">
    <Flex align="center" gap="small">
      <Button type="primary" @click="handleAdd">
        {{ locale.addConversation }}
      </Button>
      <span>{{ locale.activeKey }} {{ activeConversationKey }}</span>
    </Flex>
    <Conversations
      :items="conversationItems"
      :active-key="activeConversationKey"
      :style="conversationStyle"
      :on-active-change="setActiveConversationKey"
    />
  </Flex>
</template>

<docs lang="zh-CN">
使用 `useXConversations` 管理会话列表，配合 `Conversations` 组件展示和切换会话。
</docs>

<docs lang="en-US">
Use `useXConversations` to manage conversation lists, combined with the `Conversations` component for displaying and switching conversations.
</docs>
