<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { Flex, message } from "antdv-next";
import { onBeforeUnmount, ref, watch } from "vue";

const value = ref("Hello? this is X!");
const loading = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;

watch(loading, val => {
  if (val) {
    timer = setTimeout(() => {
      loading.value = false;
      message.success("Send message successfully!");
    }, 3000);
  }
});

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <Flex vertical gap="middle">
    <Sender
      :loading="loading"
      :value="value"
      :auto-size="{ minRows: 4, maxRows: 6 }"
      :on-change="(v: string) => (value = v)"
      :on-submit="
        () => {
          value = '';
          loading = true;
          message.info('Send message!');
        }
      "
      :on-cancel="
        () => {
          loading = false;
          message.error('Cancel sending!');
        }
      "
    />
    <Sender
      value="Force as loading"
      :loading="true"
      :read-only="true"
      :auto-size="true"
    />
    <Sender :disabled="true" value="Set to disabled" :allow-speech="true" />
  </Flex>
</template>

<docs lang="zh-CN">
基础用法，受控进行状态管理。
</docs>

<docs lang="en-US">
Basic usage. State management in controlled.
</docs>
