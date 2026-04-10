<script setup lang="ts">
import type { SuggestionItem } from "@antdv-next/x";

import { FireOutlined, SearchOutlined } from "@antdv-next/icons";
import { ref } from "vue";

const value = ref("");

const items: SuggestionItem[] = [
  {
    label: "Trending topics",
    value: "trending",
    extra: "Hot",
  },
  {
    label: "Search docs",
    value: "docs",
    extra: "Cmd+K",
  },
];

const onSelect = (itemValue: string) => {
  value.value = `/${itemValue}`;
};

const onSenderChange = (
  nextValue: string,
  onTrigger: (info?: string | false) => void,
) => {
  if (nextValue === "/") {
    onTrigger();
  } else if (!nextValue) {
    onTrigger(false);
  }

  value.value = nextValue;
};
</script>

<template>
  <ax-suggestion :items="items" @select="onSelect">
    <template #default="{ onTrigger, onKeyDown }">
      <ax-sender
        :value="value"
        placeholder="输入 / 查看自定义建议项"
        :on-change="(nextValue: string) => onSenderChange(nextValue, onTrigger)"
        :on-key-down="onKeyDown"
      />
    </template>

    <template #iconRender="{ item }">
      <span class="ax-suggestion-item-icon">
        <FireOutlined v-if="item.value === 'trending'" />
        <SearchOutlined v-else-if="item.value === 'docs'" />
      </span>
    </template>

    <template #labelRender="{ item }">
      <span class="ax-suggestion-item-label">
        <span>{{ item.label }}</span>
        <span class="ax-suggestion-item-keyword"> /{{ item.value }} </span>
      </span>
    </template>

    <template #extraRender="{ item }">
      <span class="ax-suggestion-item-extra">
        {{ item.extra }}
      </span>
    </template>
  </ax-suggestion>
</template>

<docs lang="zh-CN">
通过 `labelRender`、`iconRender`、`extraRender` 插槽自定义建议项的不同区域。
</docs>

<docs lang="en-US">
Customize label, icon, and extra areas of each suggestion item with dedicated slots.
</docs>

<style scoped>
.ax-suggestion-item-icon {
  color: #1677ff;
  display: inline-flex;
}

.ax-suggestion-item-label {
  align-items: center;
  display: inline-flex;
}

.ax-suggestion-item-keyword {
  color: rgba(0, 0, 0, 0.45);
  margin-inline-start: 8px;
}

.ax-suggestion-item-extra {
  color: #52c41a;
  font-size: 12px;
}
</style>
