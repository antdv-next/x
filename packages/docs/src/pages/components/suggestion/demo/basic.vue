<script setup lang="ts">
import type { SuggestionItem } from "@antdv-next/x";

import { BulbOutlined } from "@antdv-next/icons";
import { App } from "antdv-next";
import { onBeforeUnmount, ref } from "vue";
const { message } = App.useApp();

const value = ref("");
const loading = ref(false);

const items: SuggestionItem[] = [
  { label: "Write a report", value: "report" },
  { label: "Draw a picture", value: "draw" },
  {
    label: "Explore a topic",
    value: "knowledge",
    children: [
      {
        label: "About Vue",
        value: "vue",
      },
      {
        label: "About Antdv Next X",
        value: "antdv next x",
      },
    ],
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
  <ax-suggestion :items="items" @select="onSelect">
    <template #default="{ onTrigger, onKeyDown }">
      <ax-sender
        :loading="loading"
        :value="value"
        placeholder="输入 / 获取建议"
        :on-change="(nextValue: string) => onSenderChange(nextValue, onTrigger)"
        :on-key-down="onKeyDown"
        :on-submit="onSubmit"
      />
    </template>
    <template #iconRender="{ item }">
      <BulbOutlined v-if="item.value === 'knowledge'" />
    </template>
  </ax-suggestion>
</template>

<docs lang="zh-CN">
输入 `/` 可唤起建议列表，选择后自动填充输入框。
</docs>

<docs lang="en-US">
Type `/` to open suggestion list and auto-fill content after selection.
</docs>
