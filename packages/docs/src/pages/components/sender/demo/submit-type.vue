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
通过 `submitType` 控制换行与提交模式。
</docs>

<docs lang="en-US">
Control the newline and submit mode through `submitType`.
</docs>
