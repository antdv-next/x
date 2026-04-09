<script setup lang="ts">
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    status: "状态栏容器（可点击切换展开/折叠）",
    content: "思考内容容器",
  },
  "en-US": {
    root: "Root element",
    status: "Status header (click to toggle expand/collapse)",
    content: "Thinking content container",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "status", desc: semanticLocale.value.status },
  { name: "content", desc: semanticLocale.value.content },
]);
</script>

<template>
  <SemanticPreview component-name="Think" :semantics="semantics">
    <template #default="{ classes }">
      <ax-think title="Deep Thinking" :classes="classes">
        <p>1. Analyze the question</p>
        <p>2. Search related documents</p>
        <p>3. Generate answer</p>
      </ax-think>
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Think 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Think.
</docs>
