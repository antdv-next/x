<script setup lang="ts">
import { OpenAIOutlined } from "@antdv-next/icons";
import { Sender } from "@antdv-next/x";
import { message, Space, Typography } from "antdv-next";
import { h, ref } from "vue";

const value = ref("");
const loading = ref(false);

function handleSubmit() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    value.value = "";
    message.success("Send message successfully!");
  }, 2000);
}
</script>

<template>
  <Sender
    submit-type="shiftEnter"
    :value="value"
    :loading="loading"
    :on-change="(v: string) => (value = v)"
    :on-submit="handleSubmit"
    :on-cancel="() => (loading = false)"
    :suffix="
      (_: any, info: any) => {
        const { SendButton, LoadingButton, ClearButton, SpeechButton } = info.components;
        return h(Space, { size: 'small' }, () => [
          h(Typography.Text, { type: 'secondary', style: { whiteSpace: 'nowrap' } }, () =>
            h('small', null, '`Shift + Enter` to submit'),
          ),
          h(ClearButton),
          h(SpeechButton),
          loading
            ? h(LoadingButton)
            : h(SendButton, {
                type: 'primary',
                icon: h(OpenAIOutlined),
                disabled: false,
              }),
        ]);
      }
    "
  />
</template>

<docs lang="zh-CN">
通过 `suffix` 自定义后缀操作区域，使用内置的 `SendButton`、`ClearButton` 等组件。
</docs>

<docs lang="en-US">
Customize suffix area with built-in `SendButton`, `ClearButton` components.
</docs>
