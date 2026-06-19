<script setup lang="ts">
import { computed, ref } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    header: "头部的容器",
    graph: "图片的容器",
    code: "代码容器",
  },
  "en-US": {
    root: "root",
    header: "Wrapper element of the header",
    graph: "Wrapper element of the graph",
    code: "Wrapper element of the code",
  },
} as const;

const content = `graph TD
    A[Start] --> B{Data Valid?}
    B -->|Yes| C[Process Data]
    B -->|No| D[Error Handling]
    C --> E[Generate Report]
    D --> E
    E --> F[End]
    style A fill:#2ecc71,stroke:#27ae60
    style F fill:#e74c3c,stroke:#c0392b`;

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
      <ax-mermaid
        :content="content"
        :classes="classes"
        @render-type-change="handleRenderTypeChange"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
语义化 DOM 结构。
</docs>

<docs lang="en-US">
Semantic DOM structure.
</docs>
