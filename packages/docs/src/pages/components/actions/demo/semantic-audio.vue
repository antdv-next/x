<script setup lang="ts">
import { ActionsAudio } from "@antdv-next/x";
import { Divider } from "antdv-next";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    default: "默认图标",
    loading: "加载图标",
    running: "运行图标",
    error: "错误图标",
  },
  "en-US": {
    root: "Root",
    default: "Default",
    loading: "Loading",
    running: "Running",
    error: "Error",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const defaultSemantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "default", desc: semanticLocale.value.default },
]);

const loadingSemantics = computed(() => [
  { name: "loading", desc: semanticLocale.value.loading },
]);

const runningSemantics = computed(() => [
  { name: "running", desc: semanticLocale.value.running },
]);

const errorSemantics = computed(() => [
  { name: "error", desc: semanticLocale.value.error },
]);
</script>

<template>
  <SemanticPreview component-name="ActionsAudio" :semantics="defaultSemantics">
    <template #default="{ classes }">
      <ActionsAudio :classes="classes" />
    </template>
  </SemanticPreview>

  <Divider :style="{ margin: 0, padding: 0 }" />

  <SemanticPreview component-name="ActionsAudio" :semantics="loadingSemantics">
    <template #default="{ classes }">
      <ActionsAudio status="loading" :classes="classes" />
    </template>
  </SemanticPreview>

  <Divider :style="{ margin: 0, padding: 0 }" />

  <SemanticPreview component-name="ActionsAudio" :semantics="runningSemantics">
    <template #default="{ classes }">
      <ActionsAudio status="running" :classes="classes" />
    </template>
  </SemanticPreview>

  <Divider :style="{ margin: 0, padding: 0 }" />

  <SemanticPreview component-name="ActionsAudio" :semantics="errorSemantics">
    <template #default="{ classes }">
      <ActionsAudio status="error" :classes="classes" />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
ActionsAudio 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for ActionsAudio.
</docs>
