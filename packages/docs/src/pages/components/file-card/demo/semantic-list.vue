<script setup lang="ts">
import type { FileCardListProps } from "@antdv-next/x";

import { FileCardList } from "@antdv-next/x";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    card: "卡片",
    file: "文件",
    icon: "图标",
    name: "名称",
    description: "描述",
  },
  "en-US": {
    root: "Root",
    card: "Card",
    file: "File",
    icon: "Icon",
    name: "Name",
    description: "Description",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "card", desc: semanticLocale.value.card },
  { name: "file", desc: semanticLocale.value.file },
  { name: "icon", desc: semanticLocale.value.icon },
  { name: "name", desc: semanticLocale.value.name },
  { name: "description", desc: semanticLocale.value.description },
]);

const items: FileCardListProps["items"] = Array.from({ length: 3 }, () => ({
  name: "excel-file.xlsx",
  byte: 1024,
}));
</script>

<template>
  <SemanticPreview component-name="FileCardList" :semantics="semantics">
    <template #default="{ classes }">
      <FileCardList :items="items" :classes="classes" />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
FileCardList 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for FileCardList.
</docs>
