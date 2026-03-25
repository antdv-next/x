<script setup lang="ts">
import type { PromptsProps } from "@antdv-next/x";

import {
  BulbOutlined,
  InfoCircleOutlined,
  RocketOutlined,
} from "@antdv-next/icons";
import { Prompts } from "@antdv-next/x";
import { Divider } from "antdv-next";
import { computed, h } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    title: "标题容器",
    list: "列表容器",
    item: "列表项",
    itemContent: "列表项内容",
    subList: "子列表容器",
    subItem: "子列表项",
  },
  "en-US": {
    root: "Root",
    title: "Title container",
    list: "List container",
    item: "List item",
    itemContent: "List item content",
    subList: "Sub-list container",
    subItem: "Sub-list item",
  },
} as const;

const { locale } = useLocale();

const t = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: t.value.root },
  { name: "title", desc: t.value.title },
  { name: "list", desc: t.value.list },
  { name: "item", desc: t.value.item },
  { name: "itemContent", desc: t.value.itemContent },
]);

const nestSemantics = computed(() => [
  { name: "subList", desc: t.value.subList },
  { name: "subItem", desc: t.value.subItem },
]);

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
];

const nestItems: PromptsProps["items"] = [
  {
    key: "1",
    label: "🔥 Ignite Your Creativity",
    children: [
      { key: "1-1", description: "What sparks your creativity?" },
      { key: "1-2", description: "How do you get inspired?" },
    ],
  },
  {
    key: "2",
    label: "🎨 Uncover Background Info",
    children: [
      { key: "2-1", description: "What is the background of this topic?" },
      { key: "2-2", description: "Why is this important?" },
    ],
  },
];
</script>

<template>
  <div>
    <SemanticPreview component-name="Prompts" :semantics="semantics">
      <template #default="{ classes }">
        <Prompts
          title="✨ Inspirational Sparks and Marvelous Tips"
          :items="items"
          :classes="classes"
        />
      </template>
    </SemanticPreview>
    <Divider :style="{ margin: 0, padding: 0 }" />
    <SemanticPreview component-name="Prompts" :semantics="nestSemantics">
      <template #default="{ classes }">
        <Prompts
          title="✨ Nested Prompts"
          :items="nestItems"
          :classes="classes"
        />
      </template>
    </SemanticPreview>
  </div>
</template>

<docs lang="zh-CN">
Prompts 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Prompts.
</docs>
