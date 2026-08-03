<script setup lang="ts">
import type { SenderProps, SenderRef } from "@antdv-next/x";

import { App } from "antdv-next";
import { ref } from "vue";

const slotConfig: SenderProps["slotConfig"] = [
  { type: "text", value: 'Translate "' },
  {
    type: "content",
    key: "text",
    props: { defaultValue: "Hello World", placeholder: "Enter text" },
    formatResult: (value: any) => `[${value}]`,
  },
  { type: "text", value: '" from ' },
  {
    type: "select",
    key: "sourceLang",
    props: {
      defaultValue: "English",
      options: ["English", "Chinese", "Japanese"],
      placeholder: "Select language",
    },
    formatResult: (value: any) => `{${value}}`,
  },
  { type: "text", value: " to " },
  {
    type: "select",
    key: "targetLang",
    props: {
      defaultValue: "Chinese",
      options: ["English", "Chinese", "Japanese"],
      placeholder: "Select language",
    },
    formatResult: (value: any) => `{${value}}`,
  },
  { type: "text", value: "." },
];

const { message } = App.useApp();
const senderRef = ref<SenderRef>();
const value = ref("");

const getValue = () => {
  value.value = senderRef.value?.getValue().value ?? "";
};

const onSubmit: SenderProps["onSubmit"] = nextValue => {
  value.value = nextValue;
  message.success(`Sent: ${nextValue}`);
};
</script>

<template>
  <a-flex vertical :gap="16">
    <a-button style="width: fit-content" @click="getValue">
      Get Value
    </a-button>
    <ax-sender
      ref="senderRef"
      :auto-size="{ minRows: 2, maxRows: 4 }"
      placeholder="Enter to send"
      :slot-config="slotConfig"
      :on-submit="onSubmit"
    />
    <div>
      <strong>getValue() result:</strong>
      {{ value || '(click "Get Value" to see formatted result)' }}
    </div>
  </a-flex>
</template>

<docs lang="zh-CN">
通过 `formatResult` 格式化所有词槽类型的最终输出，包括可编辑的 `content` 词槽。
</docs>

<docs lang="en-US">
Use `formatResult` to format the final output of every slot type, including editable `content` slots.
</docs>
