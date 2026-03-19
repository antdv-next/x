<script setup lang="ts">
import { ActionsFeedback } from "@antdv-next/x";
import { Divider } from "antdv-next";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    like: "喜欢",
    liked: "已喜欢",
    dislike: "不喜欢",
    disliked: "已不喜欢",
  },
  "en-US": {
    root: "Root",
    like: "Like",
    liked: "Liked",
    dislike: "Dislike",
    disliked: "Disliked",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const defaultSemantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "like", desc: semanticLocale.value.like },
  { name: "dislike", desc: semanticLocale.value.dislike },
]);

const likedSemantics = computed(() => [
  { name: "liked", desc: semanticLocale.value.liked },
]);

const dislikedSemantics = computed(() => [
  { name: "disliked", desc: semanticLocale.value.disliked },
]);
</script>

<template>
  <SemanticPreview
    component-name="ActionsFeedback"
    :semantics="defaultSemantics"
  >
    <template #default="{ classes }">
      <ActionsFeedback :classes="classes" />
    </template>
  </SemanticPreview>

  <Divider :style="{ margin: 0, padding: 0 }" />

  <SemanticPreview component-name="ActionsFeedback" :semantics="likedSemantics">
    <template #default="{ classes }">
      <ActionsFeedback value="like" :classes="classes" />
    </template>
  </SemanticPreview>

  <Divider :style="{ margin: 0, padding: 0 }" />

  <SemanticPreview
    component-name="ActionsFeedback"
    :semantics="dislikedSemantics"
  >
    <template #default="{ classes }">
      <ActionsFeedback value="dislike" :classes="classes" />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
ActionsFeedback 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for ActionsFeedback.
</docs>
