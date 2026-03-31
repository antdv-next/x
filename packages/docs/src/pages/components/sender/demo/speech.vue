<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { message } from "antdv-next";

function handleSubmit() {
  message.success("Send message successfully!");
}
</script>

<template>
  <Sender :allow-speech="true" :on-submit="handleSubmit" />
</template>

<docs lang="zh-CN">
语音输入，需要用户同意麦克风权限。
</docs>

<docs lang="en-US">
Speech input requires user permission to access the microphone.
</docs>
