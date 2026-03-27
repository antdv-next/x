<script setup lang="ts">
import type { SuggestionItem } from "@antdv-next/x";

import { OpenAIFilled } from "@antdv-next/icons";
import { Sender, Suggestion } from "@antdv-next/x";
import { computed, h } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    content: "标题容器",
    popup: "弹层容器",
  },
  "en-US": {
    root: "Root",
    content: "Content",
    popup: "Popup",
  },
} as const;

const { locale } = useLocale();

const t = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: t.value.root },
  { name: "content", desc: t.value.content },
  { name: "popup", desc: t.value.popup },
]);

const items: SuggestionItem[] = [
  { label: "Write a report", value: "report" },
  { label: "Draw a picture", value: "draw" },
  {
    label: "Check some knowledge",
    value: "knowledge",
    icon: h(OpenAIFilled),
    children: [
      {
        label: "About React",
        value: "react",
      },
      {
        label: "About Ant Design",
        value: "antd",
      },
    ],
  },
];

const getPopupContainer = (triggerNode: HTMLElement) =>
  triggerNode.parentElement ?? triggerNode;
</script>

<template>
  <SemanticPreview
    component-name="Suggestion"
    :semantics="semantics"
    :height="300"
  >
    <template #default="{ classes }">
      <Suggestion
        open
        :items="items"
        :classes="classes"
        :get-popup-container="getPopupContainer"
      >
        <template #default="{ onKeyDown }">
          <Sender placeholder="输入 / 获取建议" :on-key-down="onKeyDown" />
        </template>
      </Suggestion>
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Suggestion 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Suggestion.
</docs>
