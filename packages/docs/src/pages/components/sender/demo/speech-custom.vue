<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { ref } from "vue";

const recording = ref(false);
</script>

<template>
  <Sender
    :allow-speech="{
      recording,
      onRecordingChange: (next: boolean) => {
        recording = next;
        console.log('Recording:', next);
      },
    }"
  />
</template>

<docs lang="zh-CN">
自定义语音逻辑，从而实现调用三方库的语音识别功能。
</docs>

<docs lang="en-US">
Customize the voice logic to achieve the voice recognition function of calling a third-party library.
</docs>
