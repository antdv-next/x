<script setup lang="ts">
import type { PromptsClickInfo, PromptsProps } from "@antdv-next/x";

import {
  BulbOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  SmileOutlined,
  WarningOutlined,
} from "@antdv-next/icons";
import { App } from "antdv-next";

const items: PromptsProps["items"] = [
  {
    key: "1",
    label: "Ignite Your Creativity",
    description: "Got any sparks for a new project?",
  },
  {
    key: "2",
    label: "Uncover Background Info",
    description: "Help me understand the background of this topic.",
  },
  {
    key: "3",
    label: "Efficiency Boost Battle",
    description: "How can I work faster and better?",
  },
  {
    key: "4",
    label: "Tell me a Joke",
    description: "Why do not ants get sick? Because they have tiny ant-bodies!",
  },
  {
    key: "5",
    label: "Common Issue Solutions",
    description: "How to solve common issues? Share some tips!",
  },
];

const { message } = App.useApp();
function onItemClick(info: PromptsClickInfo) {
  console.log("S");
  message.success(`You clicked a prompt: ${info.data.label}`);
}
</script>

<template>
  <ax-prompts
    title="✨ Inspirational Sparks and Marvelous Tips"
    :items="items"
    @item-click="onItemClick"
  >
    <template #iconRender="{ item }">
      <BulbOutlined v-if="item.key === '1'" style="color: #ffd700" />
      <InfoCircleOutlined v-else-if="item.key === '2'" style="color: #1890ff" />
      <RocketOutlined v-else-if="item.key === '3'" style="color: #722ed1" />
      <SmileOutlined v-else-if="item.key === '4'" style="color: #52c41a" />
      <WarningOutlined v-else-if="item.key === '5'" style="color: #ff4d4f" />
    </template>
  </ax-prompts>
</template>

<docs lang="zh-CN">
基础用法。
</docs>

<docs lang="en-US">
Basic usage.
</docs>
