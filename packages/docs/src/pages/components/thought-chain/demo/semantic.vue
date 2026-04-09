<script setup lang="ts">
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    item: "单个节点容器",
    itemHeader: "节点头部",
    itemIcon: "节点图标",
    itemContent: "节点内容（可折叠）",
    itemFooter: "节点底部",
  },
  "en-US": {
    root: "Root element",
    item: "Node container",
    itemHeader: "Node header",
    itemIcon: "Node icon",
    itemContent: "Node content (collapsible)",
    itemFooter: "Node footer",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "item", desc: semanticLocale.value.item },
  { name: "itemHeader", desc: semanticLocale.value.itemHeader },
  { name: "itemIcon", desc: semanticLocale.value.itemIcon },
  { name: "itemContent", desc: semanticLocale.value.itemContent },
  { name: "itemFooter", desc: semanticLocale.value.itemFooter },
]);

const items = [
  {
    key: "1",
    title: "Analyze Task",
    status: "success" as const,
    content: "Understanding user requirements...",
    footer: "Completed in 2s",
  },
  {
    key: "2",
    title: "Generate Code",
    status: "loading" as const,
    content: "Writing implementation...",
  },
];
</script>

<template>
  <SemanticPreview component-name="ThoughtChain" :semantics="semantics">
    <template #default="{ classes }">
      <ax-thought-chain
        :items="items"
        :default-expanded-keys="['1', '2']"
        :classes="classes"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
ThoughtChain 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for ThoughtChain.
</docs>
