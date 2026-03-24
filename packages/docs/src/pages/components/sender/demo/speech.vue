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
启用 `allowSpeech` 开启语音输入功能。
</docs>

<docs lang="en-US">
Enable `allowSpeech` for speech input support.
</docs>
