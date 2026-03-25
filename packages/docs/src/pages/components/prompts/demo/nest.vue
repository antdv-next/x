<script setup lang="ts">
import type { PromptsClickInfo, PromptsProps } from "@antdv-next/x";

import {
  CommentOutlined,
  FireOutlined,
  HeartOutlined,
  ReadOutlined,
  RocketOutlined,
  SmileOutlined,
} from "@antdv-next/icons";
import { Prompts } from "@antdv-next/x";
import { Card, message } from "antdv-next";
import { h } from "vue";

const items: PromptsProps["items"] = [
  {
    key: "1",
    label: h("span", {}, [
      h(FireOutlined, { style: { color: "#FF4D4F", marginRight: "8px" } }),
      "Hot Topics",
    ]),
    description: "What are you interested in?",
    children: [
      { key: "1-1", description: "What's new in X?" },
      { key: "1-2", description: "What's AGI?" },
      { key: "1-3", description: "Where is the doc?" },
    ],
  },
  {
    key: "2",
    label: h("span", {}, [
      h(ReadOutlined, { style: { color: "#1890FF", marginRight: "8px" } }),
      "Design Guide",
    ]),
    description: "How to design a good product?",
    children: [
      { key: "2-1", icon: h(HeartOutlined), description: "Know the well" },
      { key: "2-2", icon: h(SmileOutlined), description: "Set the AI role" },
      {
        key: "2-3",
        icon: h(CommentOutlined),
        description: "Express the feeling",
      },
    ],
  },
  {
    key: "3",
    label: h("span", {}, [
      h(RocketOutlined, { style: { color: "#722ED1", marginRight: "8px" } }),
      "Start Creating",
    ]),
    description: "How to start a new project?",
    children: [
      { key: "3-1", label: "Fast Start", description: "Install Ant Design X" },
      {
        key: "3-2",
        label: "Online Playground",
        description: "Play on the web without installing",
      },
    ],
  },
];

function onItemClick(info: PromptsClickInfo) {
  message.success(`You clicked: ${info.data.key}`);
}
</script>

<template>
  <Card :style="{ borderRadius: 0, border: 0 }">
    <Prompts
      title="Do you want?"
      :items="items"
      wrap
      :styles="{
        item: {
          flex: 'none',
          width: 'calc(30% - 6px)',
          backgroundImage: 'linear-gradient(137deg, #e5f4ff 0%, #efe7ff 100%)',
          border: '0',
        },
        subItem: {
          background: 'rgba(255,255,255,0.45)',
          border: '1px solid #FFF',
        },
      }"
      @item-click="onItemClick"
    />
  </Card>
</template>

<docs lang="zh-CN">
嵌套组合，通过 `children` 字段为提示项添加子提示列表。
</docs>

<docs lang="en-US">
Nest usage. Use the `children` field to add sub-prompt lists to a prompt item.
</docs>
