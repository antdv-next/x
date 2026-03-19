<script setup lang="ts">
import { CodeHighlighter } from "@antdv-next/x";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    header: "头部容器",
    headerTitle: "标题",
    code: "代码容器",
  },
  "en-US": {
    root: "root",
    header: "Wrapper element of the header",
    headerTitle: "Wrapper element of the headerTitle",
    code: "Wrapper element of the code",
  },
} as const;

const code = `import React from 'react';
import { XMarkdown } from '@ant-design/x-markdown';

const App = () => <XMarkdown content='Hello World' />;
export default App;
`;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "header", desc: semanticLocale.value.header },
  { name: "headerTitle", desc: semanticLocale.value.headerTitle },
  { name: "code", desc: semanticLocale.value.code },
]);
</script>

<template>
  <SemanticPreview component-name="CodeHighlighter" :semantics="semantics">
    <template #default="{ classes }">
      <CodeHighlighter
        :content="code"
        language="typescript"
        :classes="classes"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
CodeHighlighter 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for CodeHighlighter.
</docs>
