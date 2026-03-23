<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { computed, ref } from "vue";

const raw = ref("Use ==highlight== syntax with a Marked-like extension.");

const transformed = computed(() =>
  raw.value.replace(/==([^=]+)==/g, "<mark>$1</mark>"),
);
</script>

<template>
  <XMarkdown :content="transformed" />
</template>

<docs lang="zh-CN">
Marked 插件思路示例：先做语法转换，再交给 XMarkdown 渲染。
</docs>

<docs lang="en-US">
Marked-plugin style demo: transform syntax first, then render with XMarkdown.
</docs>
