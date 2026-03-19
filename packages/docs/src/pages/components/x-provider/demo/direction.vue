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
import { Actions, BubbleList, Conversations, XProvider } from "@antdv-next/x";
import { Card, Divider, Flex, Radio, Typography } from "antdv-next";
import { h, ref } from "vue";

const direction = ref<ConfigProviderProps["direction"]>("ltr");

const conversationItems: ConversationsProps["items"] = [
  {
    key: "1",
    label: "Conversation - 1",
    icon: h(GithubOutlined),
  },
  {
    key: "2",
    label: "Conversation - 2",
    icon: h(AlipayCircleOutlined),
  },
];

const bubbleItems: BubbleListProps["items"] = [
  {
    key: "1",
    role: "user",
    placement: "end",
    content: "Hello Ant Design X!",
    avatar: h(UserOutlined),
  },
  {
    key: "2",
    role: "ai",
    content: "Hello World!",
    avatar: h(RobotOutlined),
  },
];

const actionItems: ActionsProps["items"] = [
  {
    key: "copy",
    label: "copy",
    actionRender: () => h(Actions.Copy, { text: "Hello Ant Design X!" }),
  },
  {
    key: "feedback",
    actionRender: () => h(Actions.Feedback),
  },
];
</script>

<template>
  <Flex :gap="12" style="margin-bottom: 16px" align="center">
    <Typography.Text>Direction:</Typography.Text>
    <Radio.Group v-model:value="direction">
      <Radio.Button value="ltr"> LTR </Radio.Button>
      <Radio.Button value="rtl"> RTL </Radio.Button>
    </Radio.Group>
  </Flex>

  <Card>
    <XProvider :direction="direction">
      <Flex :gap="12" style="height: 440px">
        <Conversations
          :style="{ width: '220px' }"
          default-active-key="1"
          :items="conversationItems"
        />

        <Divider type="vertical" style="height: 100%" />

        <Flex vertical justify="space-between" :style="{ flex: 1 }">
          <BubbleList :items="bubbleItems" />
          <Actions :items="actionItems" />
        </Flex>
      </Flex>
    </XProvider>
  </Card>
</template>
