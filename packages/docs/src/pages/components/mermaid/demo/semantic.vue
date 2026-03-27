<script setup lang="ts">
import { Mermaid } from "@antdv-next/x";
import { computed, ref } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    header: "头部容器",
    graph: "图形容器",
    code: "代码容器",
  },
  "en-US": {
    root: "Root element",
    header: "Header container",
    graph: "Graph container",
    code: "Code container",
  },
} as const;

const content = `graph TD
  A[Start] --> B{Data Valid?}
  B -->|Yes| C[Process Data]
  B -->|No| D[Error Handling]
  C --> E[Generate Report]
  D --> E
  E --> F[End]`;

const { locale } = useLocale();
const renderType = ref<"image" | "code">("image");

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => {
  const base = [
    { name: "root", desc: semanticLocale.value.root },
    { name: "header", desc: semanticLocale.value.header },
  ];

  if (renderType.value === "image") {
    return [...base, { name: "graph", desc: semanticLocale.value.graph }];
  }

  return [...base, { name: "code", desc: semanticLocale.value.code }];
});

function handleRenderTypeChange(next: "image" | "code") {
  renderType.value = next;
}
</script>

<template>
  <SemanticPreview component-name="Mermaid" :semantics="semantics">
    <template #default="{ classes }">
      <Mermaid
        :content="content"
        :classes="classes"
        @render-type-change="handleRenderTypeChange"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Mermaid 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Mermaid.
</docs>
