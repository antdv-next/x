<script setup lang="ts">
import type { ConversationsProps } from "@antdv-next/x";

import { DeleteOutlined } from "@antdv-next/icons";
import { Conversations } from "@antdv-next/x";
import { useXConversations } from "@antdv-next/x-sdk";
import { Button, Flex, Typography, theme } from "antdv-next";
import { computed, h } from "vue";

import { useLocale } from "@/composables/use-locale";

const { Paragraph } = Typography;

const { token } = theme.useToken();
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    add: isCN ? "添加" : "Add",
    update: isCN ? "更新" : "Update",
    reset: isCN ? "重置" : "Reset",
    delete: isCN ? "删除" : "Delete",
    conversationItem1: isCN ? "会话项目 1" : "Conversation Item 1",
    conversationItem2: isCN ? "会话项目 2" : "Conversation Item 2",
    conversationItem3: isCN
      ? "会话项目 3，这是一个超长示例，你可以点击我！"
      : "This's Conversation Item 3, you can click me!",
    conversationItem4: isCN ? "会话项目 4" : "Conversation Item 4",
    updatedConversationItem: isCN
      ? "已更新的会话项目"
      : "Updated Conversation Item",
    currentConversationData: isCN
      ? "当前会话数据："
      : "Current Conversation Data:",
    addConversation: isCN ? "添加会话" : "Add Conversation",
  };
});

function createItems(): ConversationsProps["items"] {
  return [
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
  ];
}

let idx = 5;

const {
  conversations,
  addConversation,
  activeConversationKey,
  setActiveConversationKey,
  setConversation,
  removeConversation,
  getConversation,
  setConversations,
} = useXConversations({
  defaultConversations: createItems(),
  defaultActiveConversationKey: "item1",
});

const containerStyle = computed(() => ({
  width: "256px",
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}));

function onAdd() {
  addConversation({
    key: `item${idx}`,
    label: `${locale.value.conversationItem1.replace("1", String(idx))}`,
  });
  idx = idx + 1;
}

function onUpdate() {
  setConversation(activeConversationKey.value, {
    key: activeConversationKey.value,
    label: locale.value.updatedConversationItem,
  });
}

function onReset() {
  setConversations(createItems());
  setActiveConversationKey("item1");
}

const menuConfig = computed<ConversationsProps["menu"]>(() => conversation => ({
  items: [
    {
      label: locale.value.delete,
      key: "delete",
      icon: h(DeleteOutlined),
      danger: true,
    },
  ],
  onClick: () => {
    removeConversation(conversation.key);
  },
}));

const currentData = computed(() =>
  JSON.stringify(getConversation(activeConversationKey.value), null, 2),
);
</script>

<template>
  <Flex vertical gap="small" align="flex-start">
    <Conversations
      :creation="{ onClick: onAdd }"
      :items="conversations as ConversationsProps['items']"
      :active-key="activeConversationKey"
      :style="containerStyle"
      :on-active-change="setActiveConversationKey"
      :menu="menuConfig"
    />
    <Flex gap="small">
      <Button @click="onAdd">{{ locale.add }}</Button>
      <Button @click="onUpdate">{{ locale.update }}</Button>
      <Button @click="onReset">{{ locale.reset }}</Button>
    </Flex>
    <Paragraph>
      {{ locale.currentConversationData }}
      <pre>{{ currentData }}</pre>
    </Paragraph>
  </Flex>
</template>

<docs lang="zh-CN">
通过 `addConversation`、`removeConversation`、`setConversation` 等方法实现会话的增删改操作，配合 `menu` 属性提供右键操作菜单，使用 `creation` 属性添加新建会话按钮。
</docs>

<docs lang="en-US">
Use `addConversation`, `removeConversation`, and `setConversation` for CRUD operations on conversations, combined with the `menu` property for context menu actions and `creation` for an add conversation button.
</docs>
