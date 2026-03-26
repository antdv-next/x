<script setup lang="ts">
import type { ConversationsProps } from "@antdv-next/x";

import { Conversations } from "@antdv-next/x";
import { useXConversations } from "@antdv-next/x-sdk";
import { Button, Card, Flex, theme } from "antdv-next";
import { computed } from "vue";

import { useLocale } from "@/composables/use-locale";

const { token } = theme.useToken();
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    instance1: isCN ? "实例 A" : "Instance A",
    instance2: isCN ? "实例 B" : "Instance B",
    add: isCN ? "新建" : "New",
    conversation: isCN ? "会话" : "Conversation",
    activeKey: isCN ? "激活：" : "Active:",
  };
});

const instanceA = useXConversations({
  defaultConversations: [
    { key: "a1", label: "A - Conversation 1" },
    { key: "a2", label: "A - Conversation 2" },
  ],
  defaultActiveConversationKey: "a1",
});

const instanceB = useXConversations({
  defaultConversations: [
    { key: "b1", label: "B - Conversation 1" },
    { key: "b2", label: "B - Conversation 2" },
    { key: "b3", label: "B - Conversation 3" },
  ],
  defaultActiveConversationKey: "b1",
});

const conversationStyle = computed(() => ({
  width: "100%",
  background: token.value.colorBgLayout,
  borderRadius: `${token.value.borderRadius}px`,
}));

const itemsA = computed<ConversationsProps["items"]>(() =>
  instanceA.conversations.value.map(c => ({ key: c.key, label: c.label })),
);

const itemsB = computed<ConversationsProps["items"]>(() =>
  instanceB.conversations.value.map(c => ({ key: c.key, label: c.label })),
);

let counterA = 3;
let counterB = 4;

function handleAddA() {
  instanceA.addConversation({
    key: `a${counterA}`,
    label: `A - ${locale.value.conversation} ${counterA}`,
  });
  counterA++;
}

function handleAddB() {
  instanceB.addConversation({
    key: `b${counterB}`,
    label: `B - ${locale.value.conversation} ${counterB}`,
  });
  counterB++;
}
</script>

<template>
  <Flex gap="middle">
    <Card :title="locale.instance1" :style="{ flex: 1 }">
      <Flex vertical gap="small">
        <Flex align="center" gap="small">
          <Button size="small" @click="handleAddA">{{ locale.add }}</Button>
          <span>{{ locale.activeKey }} {{ instanceA.activeConversationKey.value }}</span>
        </Flex>
        <Conversations
          :items="itemsA"
          :active-key="instanceA.activeConversationKey.value"
          :style="conversationStyle"
          :on-active-change="instanceA.setActiveConversationKey"
        />
      </Flex>
    </Card>

    <Card :title="locale.instance2" :style="{ flex: 1 }">
      <Flex vertical gap="small">
        <Flex align="center" gap="small">
          <Button size="small" @click="handleAddB">{{ locale.add }}</Button>
          <span>{{ locale.activeKey }} {{ instanceB.activeConversationKey.value }}</span>
        </Flex>
        <Conversations
          :items="itemsB"
          :active-key="instanceB.activeConversationKey.value"
          :style="conversationStyle"
          :on-active-change="instanceB.setActiveConversationKey"
        />
      </Flex>
    </Card>
  </Flex>
</template>

<docs lang="zh-CN">
`useXConversations` 支持多实例，每个实例维护独立的会话状态，互不影响。
</docs>

<docs lang="en-US">
`useXConversations` supports multiple independent instances, each maintaining its own conversation state without interfering with others.
</docs>
