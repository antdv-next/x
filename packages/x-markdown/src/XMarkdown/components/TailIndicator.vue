<script setup lang="ts">
interface Props {
  content?: string;
}

withDefaults(defineProps<Props>(), {
  content: "▋",
});
</script>

<template>
  <span class="xmd-tail-indicator">
    {{ content }}
  </span>
</template>

<style scoped>
.xmd-tail-indicator {
  display: inline-block;
  animation: xmd-tail-blink 1s step-end infinite;
}

@keyframes xmd-tail-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
