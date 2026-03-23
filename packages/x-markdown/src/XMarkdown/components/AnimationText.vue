<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  text: string;
  fadeDuration?: number;
  easing?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fadeDuration: 300,
  easing: "ease-out",
});

interface TextChunk {
  id: number;
  text: string;
}

const chunks = ref<TextChunk[]>([]);
const previousText = ref("");
let chunkId = 0;

function resetChunks(nextText: string) {
  chunks.value = nextText ? [{ id: chunkId++, text: nextText }] : [];
  previousText.value = nextText;
}

function appendChunk(nextText: string) {
  chunks.value.push({
    id: chunkId++,
    text: nextText,
  });
}

function updateChunks(nextText: string) {
  if (nextText === previousText.value) return;

  const isAppend = Boolean(
    previousText.value && nextText.startsWith(previousText.value),
  );
  if (!isAppend) {
    resetChunks(nextText);
    return;
  }

  const delta = nextText.slice(previousText.value.length);
  if (!delta) return;

  appendChunk(delta);
  previousText.value = nextText;
}

watch(() => props.text, updateChunks, { immediate: true });
</script>

<template>
  <span class="xmd-animation-text-container">
    <span
      v-for="chunk in chunks"
      :key="chunk.id"
      class="xmd-animation-text-chunk"
      :style="{
        '--fade-duration': `${fadeDuration}ms`,
        '--easing': easing,
      }"
    >
      {{ chunk.text }}
    </span>
  </span>
</template>

<style scoped>
.xmd-animation-text-container {
  display: inline;
}

.xmd-animation-text-chunk {
  display: inline;
  animation: xmd-fade-in var(--fade-duration) var(--easing) forwards;
}

@keyframes xmd-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
