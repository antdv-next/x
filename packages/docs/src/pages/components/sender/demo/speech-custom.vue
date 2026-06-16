<script setup lang="ts">
import { App } from "antdv-next";
import { ref } from "vue";

const { message } = App.useApp();

// When setting `recording`, the built-in speech recognition feature will be disabled
const recording = ref(false);

function handleRecordingChange(nextRecording: boolean) {
  message.info(`Mock Customize Recording: ${nextRecording}`);
  recording.value = nextRecording;
}
</script>

<template>
  <ax-sender
    :allow-speech="{
      recording,
      onRecordingChange: handleRecordingChange,
    }"
  />
</template>

<docs lang="zh-CN">
自定义语音逻辑，从而实现调用三方库的语音识别功能。
</docs>

<docs lang="en-US">
Customize the voice logic to achieve the voice recognition function of calling a third-party library.
</docs>
