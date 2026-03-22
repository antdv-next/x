<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { Flex, message } from "antdv-next";
import { onBeforeUnmount, ref, watch } from "vue";

const value = ref("Hello? this is X!");
const loading = ref(false);

let timer: ReturnType<typeof setTimeout> | undefined;

watch(loading, (val) => {
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
    <Sender value="Force as loading" :loading="true" :read-only="true" :auto-size="true" />
    <Sender :disabled="true" value="Set to disabled" :allow-speech="true" />
  </Flex>
</template>

<docs lang="zh-CN">
基本用法，展示多种状态：正常、加载中、禁用。
</docs>

<docs lang="en-US">
Basic usage showing multiple states: normal, loading, and disabled.
</docs>
