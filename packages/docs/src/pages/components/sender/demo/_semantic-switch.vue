<script setup lang="ts">
import { SearchOutlined } from "@antdv-next/icons";
import { Sender } from "@antdv-next/x";
import { computed, h } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    icon: "图标",
    title: "标题",
    content: "内容",
  },
  "en-US": {
    root: "Root",
    icon: "Icon",
    title: "Title",
    content: "Content",
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
  { name: "content", desc: semanticLocale.value.content },
]);
</script>

<template>
  <SemanticPreview component-name="SenderSwitch" :semantics="semantics">
    <template #default="{ classes }">
      <Sender.Switch
        checked-children="Deep Search: on"
        un-checked-children="Deep Search: off"
        :icon="h(SearchOutlined)"
        :class-names="classes"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Sender.Switch 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Sender.Switch.
</docs>
