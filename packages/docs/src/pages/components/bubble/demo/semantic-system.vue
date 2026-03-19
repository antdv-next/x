<script setup lang="ts">
import { BubbleSystem } from "@antdv-next/x";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "气泡根节点",
    body: "主体容器",
    content: "内容容器",
  },
  "en-US": {
    root: "Bubble root",
    body: "Wrapper element of the body",
    content: "Wrapper element of the content",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "body", desc: semanticLocale.value.body },
  { name: "content", desc: semanticLocale.value.content },
]);
</script>

<template>
  <SemanticPreview component-name="BubbleSystem" :semantics="semantics">
    <template #default="{ classes }">
      <BubbleSystem
        content="Feel free to use Ant Design X!"
        :classes="classes"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
BubbleSystem 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for BubbleSystem.
</docs>
