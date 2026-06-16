<script setup lang="ts">
import { OpenAIOutlined } from "@antdv-next/icons";
import { App } from "antdv-next";
import { onBeforeUnmount, ref, watch } from "vue";

const { message } = App.useApp();

const value = ref("");
const loading = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;

watch(loading, val => {
  if (val) {
    timer = setTimeout(() => {
      loading.value = false;
      value.value = "";
      message.success("Send message successfully!");
    }, 2000);
  }
});

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <ax-sender
    submit-type="shiftEnter"
    :value="value"
    :loading="loading"
    :on-change="(v: string) => (value = v)"
    :on-submit="() => (loading = true)"
    :on-cancel="() => (loading = false)"
  >
    <template #suffix="{ components }">
      <a-space size="small">
        <a-typography-text type="secondary" :style="{ whiteSpace: 'nowrap' }">
          <small>`Shift + Enter` to submit</small>
        </a-typography-text>
        <component :is="components.ClearButton" />
        <component :is="components.SpeechButton" />
        <component
          v-if="loading"
          :is="components.LoadingButton"
          type="default"
          variant="filled"
          disabled
        >
          <template #icon>
            <a-spin
              size="small"
              :style="{ display: 'flex' }"
              :styles="{ indicator: { color: '#fff' } }"
            />
          </template>
        </component>
        <component
          v-else
          :is="components.SendButton"
          type="primary"
          :disabled="false"
        >
          <template #icon>
            <OpenAIOutlined />
          </template>
        </component>
      </a-space>
    </template>
  </ax-sender>
</template>

<docs lang="zh-CN">
通过 `suffix` 属性，可以自定义发送按钮的行为。
</docs>

<docs lang="en-US">
Customize the behavior of the send button through the `suffix` property.
</docs>
