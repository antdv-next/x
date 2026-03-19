<script setup lang="ts">
import type { ConversationsProps } from "@antdv-next/x";

import { Conversations } from "@antdv-next/x";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "管理对话根节点",
    item: "管理对话子节点",
    creation: "创建对话",
    group: "管理对话分组",
  },
  "en-US": {
    root: "Root",
    item: "Item",
    creation: "Creation",
    group: "Group",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "item", desc: semanticLocale.value.item },
  { name: "creation", desc: semanticLocale.value.creation },
  { name: "group", desc: semanticLocale.value.group },
]);

const items: ConversationsProps["items"] = [
  {
    key: "write",
    label: "Help Me Write",
  },
  {
    key: "coding",
    label: "AI Coding",
  },
  {
    key: "createImage",
    label: "Create Image",
  },
  {
    key: "deepSearch",
    label: "Deep Search",
  },
  {
    key: "divider",
    type: "divider",
  },
  {
    group: "Today",
    key: "today-1",
    label: "Conversation Item 1",
  },
  {
    group: "Today",
    key: "today-2",
    label: "Conversation Item 2",
  },
];

const creation: ConversationsProps["creation"] = {
  onClick: () => {},
};
</script>

<template>
  <SemanticPreview component-name="Conversations" :semantics="semantics">
    <template #default="{ classes }">
      <Conversations
        :style="{ width: '200px' }"
        :items="items"
        :classes="classes"
        :creation="creation"
        groupable
        default-active-key="write"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Conversations 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Conversations.
</docs>
