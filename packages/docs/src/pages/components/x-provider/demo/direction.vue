<docs lang="zh-CN">
这里列出了支持 `rtl` 方向的组件，您可以在演示中切换方向。
</docs>

<docs lang="en-US">
Components which support `rtl` direction are listed here, you can toggle the direction in the demo.
</docs>

<script setup lang="ts">
import type {
  ActionsProps,
  BubbleListProps,
  ConversationsProps,
} from "@antdv-next/x";
import type { ConfigProviderProps } from "antdv-next";

import {
  AlipayCircleOutlined,
  GithubOutlined,
  RobotOutlined,
  UserOutlined,
} from "@antdv-next/icons";
import { ref } from "vue";

const direction = ref<ConfigProviderProps["direction"]>("ltr");

const conversationItems: ConversationsProps["items"] = [
  {
    key: "1",
    label: "Conversation - 1",
  },
  {
    key: "2",
    label: "Conversation - 2",
  },
];

const bubbleItems: BubbleListProps["items"] = [
  {
    key: "1",
    role: "user",
    placement: "end",
    content: "Hello Antdv Next X!",
  },
  {
    key: "2",
    role: "ai",
    content: "Hello World!",
  },
];

const actionItems: ActionsProps["items"] = [
  {
    key: "copy",
    label: "copy",
  },
  {
    key: "feedback",
    label: "feedback",
  },
];
</script>

<template>
  <a-flex :gap="12" style="margin-bottom: 16px" align="center">
    <a-typography-text>Direction:</a-typography-text>
    <a-radio-group v-model:value="direction">
      <a-radio-button value="ltr"> LTR </a-radio-button>
      <a-radio-button value="rtl"> RTL </a-radio-button>
    </a-radio-group>
  </a-flex>

  <a-card>
    <ax-x-provider :direction="direction">
      <a-flex :gap="12" style="height: 440px">
        <ax-conversations
          :style="{ width: '220px' }"
          default-active-key="1"
          :items="conversationItems"
        >
          <template #iconRender="{ item }">
            <GithubOutlined v-if="item.key === '1'" />
            <AlipayCircleOutlined v-else-if="item.key === '2'" />
          </template>
        </ax-conversations>

        <a-divider type="vertical" style="height: 100%" />

        <a-flex vertical justify="space-between" :style="{ flex: 1 }">
          <ax-bubble-list :items="bubbleItems">
            <template #avatar="{ item }">
              <UserOutlined v-if="item.role === 'user'" />
              <RobotOutlined v-else-if="item.role === 'ai'" />
            </template>
          </ax-bubble-list>
          <ax-actions :items="actionItems">
            <template #actionRender="{ item }">
              <ax-actions-copy
                v-if="item.key === 'copy'"
                text="Hello Antdv Next X!"
              />
              <ax-actions-feedback v-else-if="item.key === 'feedback'" />
            </template>
          </ax-actions>
        </a-flex>
      </a-flex>
    </ax-x-provider>
  </a-card>
</template>
