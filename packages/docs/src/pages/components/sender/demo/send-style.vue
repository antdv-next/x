<script setup lang="ts">
import type { ButtonProps, CSSProperties } from "antdv-next";

import { SendOutlined } from "@antdv-next/icons";
import { App } from "antdv-next";
import { onBeforeUnmount, ref, watch } from "vue";

const { message } = App.useApp();

const value = ref("Ask something?");
const loading = ref(false);

interface SenderConfig {
  key: string;
  placeholder?: string;
  ignoreLoading?: boolean;
  showIcon?: boolean;
  buttonStyle?: CSSProperties;
  buttonProps: Partial<ButtonProps>;
}

const senderConfigs: SenderConfig[] = [
  {
    key: "radius",
    placeholder: "Change button border radius",
    buttonProps: {
      shape: "default",
    },
    buttonStyle: { borderRadius: "12px" },
  },
  {
    key: "icon",
    placeholder: "Change button icon",
    buttonProps: {
      variant: "text",
      color: "primary",
      shape: "default",
    },
    showIcon: true,
  },
  {
    key: "ignore-loading",
    placeholder: "Loading not change button",
    ignoreLoading: true,
    buttonProps: {},
  },
];

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

const onSubmit = (msg: string) => {
  message.success(`Send: ${msg}`);
  value.value = "";
  loading.value = true;
};
</script>

<template>
  <a-flex vertical gap="middle">
    <ax-sender
      v-for="config in senderConfigs"
      :key="config.key"
      :value="value"
      :loading="loading"
      :placeholder="config.placeholder"
      :on-change="(v: string) => (value = v)"
      :on-submit="onSubmit"
      :on-cancel="() => (loading = false)"
    >
      <template #suffix="{ components }">
        <a-tooltip
          v-if="!config.ignoreLoading && loading"
          title="Click to cancel"
        >
          <component :is="components.LoadingButton" />
        </a-tooltip>
        <a-tooltip
          v-else-if="!config.ignoreLoading"
          :title="value ? 'Send ↵' : 'Please type something'"
        >
          <component
            :is="components.SendButton"
            v-bind="config.buttonProps"
            :style="config.buttonStyle"
          >
            <template v-if="config.showIcon" #icon>
              <SendOutlined />
            </template>
          </component>
        </a-tooltip>
        <component
          v-else
          :is="components.SendButton"
          v-bind="config.buttonProps"
          :style="config.buttonStyle"
        >
          <template v-if="config.showIcon" #icon>
            <SendOutlined />
          </template>
        </component>
      </template>
    </ax-sender>
  </a-flex>
</template>

<docs lang="zh-CN">
通过定制后缀，调整`suffix`。
</docs>

<docs lang="en-US">
Adjust `suffix` by customizing the suffix.
</docs>
