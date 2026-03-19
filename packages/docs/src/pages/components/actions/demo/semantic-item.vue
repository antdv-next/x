<script setup lang="ts">
import { ShakeOutlined, ShareAltOutlined } from "@antdv-next/icons";
import { ActionsItem } from "@antdv-next/x";
import { Divider } from "antdv-next";
import { computed, h } from "vue";

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

const defaultIcon = h(ShareAltOutlined);
const runningIcon = h(ShakeOutlined);
</script>

<template>
  <SemanticPreview component-name="ActionsItem" :semantics="defaultSemantics">
    <template #default="{ classes }">
      <ActionsItem :default-icon="defaultIcon" :classes="classes" />
    </template>
  </SemanticPreview>

  <Divider :style="{ margin: 0, padding: 0 }" />

  <SemanticPreview component-name="ActionsItem" :semantics="loadingSemantics">
    <template #default="{ classes }">
      <ActionsItem
        :default-icon="defaultIcon"
        status="loading"
        :classes="classes"
      />
    </template>
  </SemanticPreview>

  <Divider :style="{ margin: 0, padding: 0 }" />

  <SemanticPreview component-name="ActionsItem" :semantics="runningSemantics">
    <template #default="{ classes }">
      <ActionsItem
        :default-icon="defaultIcon"
        :running-icon="runningIcon"
        status="running"
        :classes="classes"
      />
    </template>
  </SemanticPreview>

  <Divider :style="{ margin: 0, padding: 0 }" />

  <SemanticPreview component-name="ActionsItem" :semantics="errorSemantics">
    <template #default="{ classes }">
      <ActionsItem
        :default-icon="defaultIcon"
        status="error"
        :classes="classes"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
ActionsItem 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for ActionsItem.
</docs>
