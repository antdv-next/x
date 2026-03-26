<script setup lang="ts">
import type { ConversationItemType, ConversationsProps } from "@antdv-next/x";

import { DeleteOutlined } from "@antdv-next/icons";
import { Conversations } from "@antdv-next/x";
import { useXConversations } from "@antdv-next/x-sdk";
import { Button, Col, Flex, Row, theme } from "antdv-next";
import { computed, h } from "vue";

import { useLocale } from "@/composables/use-locale";

const { token } = theme.useToken();
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    list1: isCN ? "列表 1" : "List 1",
    list2: isCN ? "列表 2" : "List 2",
    add: isCN ? "添加" : "Add",
    update: isCN ? "更新" : "Update",
    delete: isCN ? "删除" : "Delete",
    conversationItem1: isCN ? "会话项目 1" : "Conversation Item 1",
    conversationItem2: isCN ? "会话项目 2" : "Conversation Item 2",
    conversationItem3: isCN
      ? "会话项目 3，你可以点击我！"
      : "This's Conversation Item 3, you can click me!",
    conversationItem4: isCN ? "会话项目 4" : "Conversation Item 4",
    updatedConversationItem: isCN
      ? "已更新的会话项目"
      : "Updated Conversation Item",
  };
});

const items: ConversationItemType[] = [
  { key: "item1", label: locale.value.conversationItem1 },
  { key: "item2", label: locale.value.conversationItem2 },
  { key: "item3", label: locale.value.conversationItem3 },
  { key: "item4", label: locale.value.conversationItem4, disabled: true },
];

const others: ConversationItemType[] = [
  { key: "other1", label: locale.value.conversationItem1 },
  { key: "other2", label: locale.value.conversationItem2 },
];

let idx = 5;
let otherIdx = 3;

const handler = useXConversations({
  defaultConversations: items,
  defaultActiveConversationKey: "item1",
});

const otherHandler = useXConversations({
  defaultConversations: others,
  defaultActiveConversationKey: "other1",
});

const containerStyle = computed(() => ({
  width: "256px",
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}));

function onAdd(type?: string) {
  const instance = type === "other" ? otherHandler : handler;
  const itemIndex = type === "other" ? otherIdx : idx;
  instance.addConversation({
    key: type === "other" ? `other${itemIndex}` : `item${itemIndex}`,
    label: `${locale.value.conversationItem1.replace("1", String(itemIndex))}`,
  });
  if (type === "other") {
    otherIdx = otherIdx + 1;
  } else {
    idx = idx + 1;
  }
}

function onUpdate(type?: string) {
  const instance = type === "other" ? otherHandler : handler;
  const realActive =
    type === "other"
      ? otherHandler.activeConversationKey.value
      : handler.activeConversationKey.value;
  instance.setConversation(realActive, {
    key: realActive,
    label: locale.value.updatedConversationItem,
  });
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
    handler.removeConversation(conversation.key);
  },
}));

const otherMenuConfig = computed<ConversationsProps["menu"]>(
  () => conversation => ({
    items: [
      {
        label: locale.value.delete,
        key: "delete",
        icon: h(DeleteOutlined),
        danger: true,
      },
    ],
    onClick: () => {
      otherHandler.removeConversation(conversation.key);
    },
  }),
);
</script>

<template>
  <Flex vertical gap="small" align="flex-start">
    <Row :gutter="36">
      <Col>
        <h3>{{ locale.list1 }}</h3>
        <Conversations
          :items="handler.conversations.value as ConversationsProps['items']"
          :active-key="handler.activeConversationKey.value"
          :style="containerStyle"
          :on-active-change="handler.setActiveConversationKey"
          :menu="menuConfig"
        />
        <Flex gap="small">
          <Button @click="onAdd()">{{ locale.add }}</Button>
          <Button @click="onUpdate()">{{ locale.update }}</Button>
        </Flex>
      </Col>
      <Col>
        <h3>{{ locale.list2 }}</h3>
        <Conversations
          :items="
            otherHandler.conversations.value as ConversationsProps['items']
          "
          :active-key="otherHandler.activeConversationKey.value"
          :style="containerStyle"
          :on-active-change="otherHandler.setActiveConversationKey"
          :menu="otherMenuConfig"
        />
        <Flex gap="small">
          <Button @click="onAdd('other')">{{ locale.add }}</Button>
          <Button @click="onUpdate('other')">{{ locale.update }}</Button>
        </Flex>
      </Col>
    </Row>
  </Flex>
</template>

<docs lang="zh-CN">
展示多个会话实例的独立管理，支持添加、更新、删除会话项目，实现完全解耦的状态管理。
</docs>

<docs lang="en-US">
Demonstrate independent management of multiple conversation instances, supporting add, update, and delete conversation items with fully decoupled state management.
</docs>
