<script setup lang="ts">
import type { PromptsProps } from "@antdv-next/x";

import { CoffeeOutlined, FireOutlined, SmileOutlined } from "@antdv-next/icons";
import { Prompts } from "@antdv-next/x";
import { h } from "vue";

const items: PromptsProps["items"] = [
  {
    key: "1",
    icon: h(CoffeeOutlined, { style: { color: "#964B00" } }),
    description: "How to rest effectively after long hours of work?",
  },
  {
    key: "2",
    icon: h(SmileOutlined, { style: { color: "#FAAD14" } }),
    description: "What are the secrets to maintaining a positive mindset?",
  },
  {
    key: "3",
    icon: h(FireOutlined, { style: { color: "#FF4D4F" } }),
    description: "How to stay calm under immense pressure?",
  },
];
</script>

<template>
  <Prompts title="🤔 You might also want to ask:" :items="items" vertical />
</template>

<docs lang="zh-CN">
通过 `vertical` 属性将提示列表设置为纵向排列。
</docs>

<docs lang="en-US">
Use the `vertical` prop to arrange the prompt list vertically.
</docs>
