<script setup lang="ts">
import { SendOutlined } from "@antdv-next/icons";
import { Sender } from "@antdv-next/x";
import { Flex, message, Tooltip } from "antdv-next";
import { h, onBeforeUnmount, ref, watch } from "vue";

const value = ref("Ask something?");
const loading = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;

watch(loading, val => {
  if (val) {
    timer = setTimeout(() => {
      loading.value = false;
    }, 3000);
  }
});

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});

function renderSend(opts: {
  ignoreLoading?: boolean;
  placeholder?: string;
  shape?: string;
  style?: Record<string, string>;
  variant?: string;
  color?: string;
  icon?: any;
}) {
  const { ignoreLoading, placeholder, ...btnProps } = opts;

  return h(Sender, {
    value: value.value,
    onChange: (v: string) => {
      value.value = v;
    },
    loading: loading.value,
    onSubmit: (msg: string) => {
      message.success(`Send: ${msg}`);
      value.value = "";
      loading.value = true;
    },
    placeholder,
    onCancel: () => {
      loading.value = false;
    },
    suffix: (_: any, info: any) => {
      const { SendButton, LoadingButton } = info.components;
      if (!ignoreLoading && loading.value) {
        return h(Tooltip, { title: "Click to cancel" }, () => h(LoadingButton));
      }
      const node = h(SendButton, { ...btnProps });
      if (!ignoreLoading) {
        return h(
          Tooltip,
          { title: value.value ? "Send ↵" : "Please type something" },
          () => node,
        );
      }
      return node;
    },
  });
}
</script>

<template>
  <Flex vertical gap="middle">
    <component
      :is="
        renderSend({
          shape: 'default',
          placeholder: 'Change button border radius',
          style: { borderRadius: '12px' },
        })
      "
    />
    <component
      :is="
        renderSend({
          variant: 'text',
          placeholder: 'Change button icon',
          color: 'primary',
          icon: h(SendOutlined),
          shape: 'default',
        })
      "
    />
    <component
      :is="
        renderSend({
          ignoreLoading: true,
          placeholder: 'Loading not change button',
        })
      "
    />
  </Flex>
</template>

<docs lang="zh-CN">
通过 `suffix` 自定义发送按钮的样式，如圆角、图标、加载行为等。
</docs>

<docs lang="en-US">
Customize send button style via `suffix`, such as border radius, icon, and loading behavior.
</docs>
