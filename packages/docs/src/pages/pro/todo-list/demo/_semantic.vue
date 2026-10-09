<script setup lang="ts">
import { TodoList } from "@antdv-next/x-pro";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "组件根元素，承载主题样式与方向。",
    header: "头部按钮，点击切换展开状态，承载标题、计数与状态图标。",
    headerIcon: "头部状态图标，展示由列表派生的整体状态。",
    title: "头部标题。",
    counter: "完成计数，数字变化时做滚动过渡。",
    arrow: "头部展开箭头，随展开状态旋转。",
    content: "可折叠内容层，展开后同时是滚动容器。",
    list: "任务列表。",
    item: "单个任务行，`data-status` 反映其状态。",
    itemIcon: "任务行状态图标，四种状态共用一个 SVG。",
    itemTitle: "任务行标题，终态时拉出删除线。",
    itemStrikethrough: "任务行删除线，用 `scaleX` 描绘。",
    itemDetail: "任务行行尾的紧凑元信息。",
  },
  "en-US": {
    root: "Root element carrying themed styles and direction.",
    header:
      "Header button that toggles the panel and holds the title, counter, and status icon.",
    headerIcon:
      "Header status icon showing the overall status derived from the list.",
    title: "Header title.",
    counter: "Completion counter, with a rolling transition on change.",
    arrow: "Header arrow that rotates with the open state.",
    content:
      "Collapsible content layer, doubling as the scroll container when open.",
    list: "Task list.",
    item: "A single task row; `data-status` reflects its status.",
    itemIcon: "Row status icon; all four statuses share one SVG.",
    itemTitle: "Row title, struck through once terminal.",
    itemStrikethrough: "Row strikethrough, drawn with `scaleX`.",
    itemDetail: "Compact metadata at the row end.",
  },
};

const { locale } = useLocale();
const texts = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: texts.value.root, version: "0.1.0" },
  { name: "header", desc: texts.value.header, version: "0.1.0" },
  { name: "headerIcon", desc: texts.value.headerIcon, version: "0.1.0" },
  { name: "title", desc: texts.value.title, version: "0.1.0" },
  { name: "counter", desc: texts.value.counter, version: "0.1.0" },
  { name: "arrow", desc: texts.value.arrow, version: "0.1.0" },
  { name: "content", desc: texts.value.content, version: "0.1.0" },
  { name: "list", desc: texts.value.list, version: "0.1.0" },
  { name: "item", desc: texts.value.item, version: "0.1.0" },
  { name: "itemIcon", desc: texts.value.itemIcon, version: "0.1.0" },
  { name: "itemTitle", desc: texts.value.itemTitle, version: "0.1.0" },
  {
    name: "itemStrikethrough",
    desc: texts.value.itemStrikethrough,
    version: "0.1.0",
  },
  { name: "itemDetail", desc: texts.value.itemDetail, version: "0.1.0" },
]);

const items = [
  {
    id: "1",
    title: "Semantic root",
    status: "completed" as const,
    detail: "0.2s",
  },
  { id: "2", title: "Semantic header", status: "completed" as const },
  {
    id: "3",
    title: "Semantic rows",
    status: "in-progress" as const,
    progress: 60,
    detail: "60%",
  },
  { id: "4", title: "Semantic icons", status: "pending" as const },
  { id: "5", title: "Semantic detail", status: "cancelled" as const },
];
</script>

<template>
  <SemanticPreview component-name="TodoList" :semantics="semantics">
    <template #default="{ classes }">
      <TodoList
        :items="items"
        :classes="classes"
        :style="{
          maxWidth: '460px',
          padding: '12px 16px',
          border: '1px solid var(--ant-color-border)',
          borderRadius: '14px',
        }"
      />
    </template>
  </SemanticPreview>
</template>
