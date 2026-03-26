<script setup lang="ts">
import type { ConversationsProps } from "@antdv-next/x";

import { Conversations } from "@antdv-next/x";
import { useXConversations } from "@antdv-next/x-sdk";
import { Flex, theme } from "antdv-next";
import { computed } from "vue";

import { useLocale } from "@/composables/use-locale";

const { token } = theme.useToken();
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    conversationItem1: isCN ? "会话项目 1" : "Conversation Item 1",
    conversationItem2: isCN ? "会话项目 2" : "Conversation Item 2",
    conversationItem3: isCN
      ? "会话项目 3，这是一个超长示例，你可以点击我！"
      : "This's Conversation Item 3, you can click me!",
    conversationItem4: isCN ? "会话项目 4" : "Conversation Item 4",
  };
});

const items = computed<ConversationsProps["items"]>(() => [
  {
    key: "item1",
    label: locale.value.conversationItem1,
  },
  {
    key: "item2",
    label: locale.value.conversationItem2,
  },
  {
    key: "item3",
    label: locale.value.conversationItem3,
  },
  {
    key: "item4",
    label: locale.value.conversationItem4,
    disabled: true,
  },
]);

const { conversations } = useXConversations({
  defaultConversations: items.value,
});

const containerStyle = computed(() => ({
  width: "256px",
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}));
</script>

<template>
  <Flex vertical gap="small" align="flex-start">
    <Conversations
      :items="conversations as ConversationsProps['items']"
      default-active-key="item1"
      :style="containerStyle"
    />
  </Flex>
</template>

<docs lang="zh-CN">
使用 `useXConversations` 管理会话列表，配合 `Conversations` 组件展示基本的会话列表。
</docs>

<docs lang="en-US">
Use `useXConversations` to manage conversation lists, combined with the `Conversations` component to display a basic conversation list.
</docs>
