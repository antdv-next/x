<script setup lang="ts">
import { FileCard } from "@antdv-next/x";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    file: "文件",
    icon: "图标",
    name: "名称",
    description: "描述",
  },
  "en-US": {
    root: "Root",
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
  { name: "file", desc: semanticLocale.value.file },
  { name: "icon", desc: semanticLocale.value.icon },
  { name: "name", desc: semanticLocale.value.name },
  { name: "description", desc: semanticLocale.value.description },
]);
</script>

<template>
  <SemanticPreview component-name="FileCard" :semantics="semantics">
    <template #default="{ classes }">
      <FileCard name="pdf-file.pdf" :byte="1024" :classes="classes" />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
FileCard 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for FileCard.
</docs>
