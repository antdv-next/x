<script setup lang="ts">
import { CodeOutlined } from "@antdv-next/icons";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    icon: "图标容器",
    title: "标题",
    description: "描述文字",
  },
  "en-US": {
    root: "Root element",
    icon: "Icon container",
    title: "Title",
    description: "Description text",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "icon", desc: semanticLocale.value.icon },
  { name: "title", desc: semanticLocale.value.title },
  { name: "description", desc: semanticLocale.value.description },
]);
</script>

<template>
  <SemanticPreview component-name="ThoughtChain.Item" :semantics="semantics">
    <template #default="{ classes }">
      <ax-thought-chain-item
        variant="solid"
        title="Execute Command"
        description="mkdir -p src/components"
        status="success"
        :classes="classes"
      >
        <template #iconRender>
          <CodeOutlined />
        </template>
      </ax-thought-chain-item>
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
ThoughtChain.Item 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for ThoughtChain.Item.
</docs>
