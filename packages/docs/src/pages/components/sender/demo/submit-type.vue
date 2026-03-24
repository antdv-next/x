<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { message } from "antdv-next";

function handleSubmit() {
  message.success("Send message successfully!");
}
</script>

<template>
  <Sender
    submit-type="shiftEnter"
    placeholder="Press Shift + Enter to send message"
    :on-submit="handleSubmit"
  />
</template>

<docs lang="zh-CN">
使用 `submitType="shiftEnter"` 切换为 Shift + Enter 发送消息。
</docs>

<docs lang="en-US">
Use `submitType="shiftEnter"` to send with Shift + Enter.
</docs>
