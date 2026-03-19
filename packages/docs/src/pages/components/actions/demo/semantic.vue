<script setup lang="ts">
import type { ActionsProps } from "@antdv-next/x";

import { CopyOutlined, ShareAltOutlined } from "@antdv-next/icons";
import { Actions } from "@antdv-next/x";
import { computed, h } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    item: "操作项",
    itemDropdown: "操作下拉选项",
  },
  "en-US": {
    root: "Root",
    item: "Item",
    itemDropdown: "Item Dropdown",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "item", desc: semanticLocale.value.item },
  { name: "itemDropdown", desc: semanticLocale.value.itemDropdown },
]);

const items: ActionsProps["items"] = [
  {
    key: "copy",
    label: "Copy",
    icon: h(CopyOutlined),
  },
  {
    key: "more",
    subItems: [
      {
        key: "share",
        label: "Share",
        icon: h(ShareAltOutlined),
      },
      { key: "import", label: "Import" },
    ],
  },
];
</script>

<template>
  <SemanticPreview component-name="Actions" :semantics="semantics">
    <template #default="{ classes }">
      <Actions
        :items="items"
        :classes="classes"
        :dropdown-props="{
          open: true,
          placement: 'topLeft',
          getPopupContainer: triggerNode => triggerNode.parentElement,
        }"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Actions 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Actions.
</docs>
