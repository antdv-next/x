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
