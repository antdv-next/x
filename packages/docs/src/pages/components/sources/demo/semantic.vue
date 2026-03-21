<script setup lang="ts">
import type { SourcesProps } from "@antdv-next/x";

import { Sources } from "@antdv-next/x";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    title: "标题区",
    content: "内容区",
  },
  "en-US": {
    root: "Root",
    title: "Title",
    content: "Content",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "title", desc: semanticLocale.value.title },
  { name: "content", desc: semanticLocale.value.content },
]);

const items: SourcesProps["items"] = [
  {
    title: "1. Data source",
    url: "https://x.antdv-next.com/components",
  },
  {
    title: "2. Data source",
    url: "https://x.antdv-next.com/components",
  },
  {
    title: "3. Data source",
    url: "https://x.antdv-next.com/components",
  },
];
</script>

<template>
  <SemanticPreview
    component-name="Sources"
    :semantics="semantics"
    :motion="true"
  >
    <template #default="{ classes }">
      <Sources title="Used 3 sources" :items="items" :classes="classes" />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Sources 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Sources.
</docs>
