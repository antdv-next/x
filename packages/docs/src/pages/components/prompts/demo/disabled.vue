<script setup lang="ts">
import type { PromptsProps } from "@antdv-next/x";

import { CheckCircleOutlined, CoffeeOutlined } from "@antdv-next/icons";
import { Prompts } from "@antdv-next/x";
import { h } from "vue";

const items: PromptsProps["items"] = [
  {
    key: "1",
    icon: h(CheckCircleOutlined, { style: { color: "#52C41A" } }),
    label: "Task Completion Secrets",
    description: "What are some tricks for getting tasks done?",
    disabled: true,
  },
  {
    key: "2",
    icon: h(CoffeeOutlined, { style: { color: "#964B00" } }),
    label: "Time for a Coffee Break",
    description: "How to rest effectively after long hours of work?",
  },
];
</script>

<template>
  <Prompts title="☕️ It's time to relax!" :items="items" />
</template>

<docs lang="zh-CN">
禁用状态，通过 `disabled` 属性禁用某个提示项的点击事件。
</docs>

<docs lang="en-US">
Disabled state. Use the `disabled` prop to disable click events on a prompt item.
</docs>
