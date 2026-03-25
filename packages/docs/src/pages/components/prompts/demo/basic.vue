<script setup lang="ts">
import type { PromptsClickInfo, PromptsProps } from "@antdv-next/x";

import {
  BulbOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  SmileOutlined,
  WarningOutlined,
} from "@antdv-next/icons";
import { Prompts } from "@antdv-next/x";
import { message } from "antdv-next";
import { h } from "vue";

const items: PromptsProps["items"] = [
  {
    key: "1",
    icon: h(BulbOutlined, { style: { color: "#FFD700" } }),
    label: "Ignite Your Creativity",
    description: "Got any sparks for a new project?",
  },
  {
    key: "2",
    icon: h(InfoCircleOutlined, { style: { color: "#1890FF" } }),
    label: "Uncover Background Info",
    description: "Help me understand the background of this topic.",
  },
  {
    key: "3",
    icon: h(RocketOutlined, { style: { color: "#722ED1" } }),
    label: "Efficiency Boost Battle",
    description: "How can I work faster and better?",
  },
  {
    key: "4",
    icon: h(SmileOutlined, { style: { color: "#52C41A" } }),
    label: "Tell me a Joke",
    description: "Why do not ants get sick? Because they have tiny ant-bodies!",
  },
  {
    key: "5",
    icon: h(WarningOutlined, { style: { color: "#FF4D4F" } }),
    label: "Common Issue Solutions",
    description: "How to solve common issues? Share some tips!",
  },
];

function onItemClick(info: PromptsClickInfo) {
  message.success(`You clicked a prompt: ${info.data.label}`);
}
</script>

<template>
  <Prompts
    title="✨ Inspirational Sparks and Marvelous Tips"
    :items="items"
    @item-click="onItemClick"
  />
</template>

<docs lang="zh-CN">
基础用法。
</docs>

<docs lang="en-US">
Basic usage.
</docs>
