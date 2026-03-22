<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { Flex, message } from "antdv-next";
import { ref } from "vue";

const value = ref("");
const loading = ref(false);

function handleSubmit() {
  loading.value = true;
  message.info("Sending...");
  setTimeout(() => {
    loading.value = false;
    value.value = "";
    message.success("Send message successfully!");
  }, 3000);
}

function handleCancel() {
  loading.value = false;
  message.error("Cancel sending!");
}
</script>

<template>
  <Flex vertical gap="middle">
    <Sender
      :value="value"
      :loading="loading"
      placeholder="Type and send to see loading state"
      :on-change="(v: string) => (value = v)"
      :on-submit="handleSubmit"
      :on-cancel="handleCancel"
    />
  </Flex>
</template>

<docs lang="zh-CN">
发送后展示加载状态，点击停止按钮可取消。
</docs>

<docs lang="en-US">
Show loading state after submit. Click the stop button to cancel.
</docs>
