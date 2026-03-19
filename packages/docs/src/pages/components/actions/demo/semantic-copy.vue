<script setup lang="ts">
import { ActionsCopy } from "@antdv-next/x";
import { Divider } from "antdv-next";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
  },
  "en-US": {
    root: "Root",
  },
} as const;

const { locale } = useLocale();

const semantics = computed(() => [
  {
    name: "root",
    desc:
      locale.value === "zh-CN" ? locales["zh-CN"].root : locales["en-US"].root,
  },
]);
</script>

<template>
  <Divider :style="{ margin: 0, padding: 0 }" />
  <SemanticPreview component-name="ActionsCopy" :semantics="semantics">
    <template #default="{ classes }">
      <ActionsCopy text="copy value" :classes="classes" />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
ActionsCopy 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for ActionsCopy.
</docs>
