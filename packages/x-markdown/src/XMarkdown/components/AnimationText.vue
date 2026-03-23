<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

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
  fading: boolean;
}

const chunks = ref<TextChunk[]>([]);
let chunkId = 0;

function updateChunks(newText: string, oldText: string) {
  if (newText === oldText) return;

  if (newText.length > oldText.length && oldText.length > 0) {
    const delta = newText.slice(oldText.length);
    chunks.value.push({
      id: chunkId++,
      text: delta,
      fading: true,
    });

    setTimeout(() => {
      const chunk = chunks.value.find(c => c.id === chunkId - 1);
      if (chunk) {
        chunk.fading = false;
      }
    }, props.fadeDuration);
  } else {
    chunks.value = [{ id: chunkId++, text: newText, fading: false }];
  }
}

watch(
  () => props.text,
  (newVal, oldVal) => {
    updateChunks(newVal, oldVal || "");
  },
  { immediate: true },
);

onMounted(() => {
  if (props.text) {
    chunks.value = [{ id: chunkId++, text: props.text, fading: false }];
  }
});
</script>

<template>
  <span class="xmd-animation-text-container">
    <span
      v-for="chunk in chunks"
      :key="chunk.id"
      :class="['xmd-animation-text-chunk', { 'xmd-fading': chunk.fading }]"
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
}

.xmd-animation-text-chunk.xmd-fading {
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
