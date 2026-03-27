<script setup lang="ts">
import type { SuggestionItem } from "@antdv-next/x";

import { Sender, Suggestion } from "@antdv-next/x";
import { Tag, message } from "antdv-next";
import { h, onBeforeUnmount, ref } from "vue";

const value = ref("");
const loading = ref(false);

const items: SuggestionItem[] = [
  { label: "Write a report", value: "report" },
  { label: "Draw a picture", value: "draw" },
  {
    label: "Check some knowledge",
    value: "knowledge",
    extra: h(Tag, null, { default: () => "Extra Info" }),
  },
];

let timer: ReturnType<typeof setTimeout> | undefined;

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});

const onSelect = (itemValue: string) => {
  value.value = `[${itemValue}]:`;
};

const onSubmit = (content: string) => {
  message.success(`message send success: ${content}`);
  value.value = "";
  loading.value = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    loading.value = false;
  }, 3000);
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
  <Suggestion block :items="items" :on-select="onSelect">
    <template #default="{ onTrigger, onKeyDown }">
      <Sender
        :loading="loading"
        :value="value"
        placeholder="输入 / 获取建议"
        :on-change="(nextValue: string) => onSenderChange(nextValue, onTrigger)"
        :on-key-down="onKeyDown"
        :on-submit="onSubmit"
      />
    </template>
  </Suggestion>
</template>

<docs lang="zh-CN">
`block` 模式下，建议面板会匹配整行输入区域宽度。
</docs>

<docs lang="en-US">
With `block`, the suggestion popup matches the full input area width.
</docs>
