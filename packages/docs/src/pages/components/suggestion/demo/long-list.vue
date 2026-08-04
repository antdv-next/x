<script setup lang="ts">
import type { SuggestionItem } from "@antdv-next/x";

import { ref } from "vue";

const value = ref("");

const items: SuggestionItem[] = Array.from({ length: 30 }, (_, index) => ({
  label: `Suggestion option ${index + 1}`,
  value: `option-${index + 1}`,
}));

const onSelect = (itemValue: string) => {
  value.value = `[${itemValue}]:`;
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
        placeholder="输入 / 获取建议"
        :on-change="(nextValue: string) => onSenderChange(nextValue, onTrigger)"
        :on-key-down="onKeyDown"
      />
    </template>
  </ax-suggestion>
</template>

<docs lang="zh-CN">
建议项过多时弹层高度受限，超出部分在弹层内部滚动，避免遮挡输入框。
</docs>

<docs lang="en-US">
When there are too many suggestions, the popup height is capped and the overflow scrolls inside the popup instead of covering the sender.
</docs>
