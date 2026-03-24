<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface Props {
  text: string;
  fadeDuration?: number;
  easing?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fadeDuration: 200,
  easing: "ease-in-out",
});

const chunks = ref<string[]>([]);
const previousText = ref("");

function updateChunks(nextText: string) {
  if (nextText === previousText.value) return;

  const isAppend = Boolean(
    previousText.value && nextText.startsWith(previousText.value),
  );
  if (!isAppend) {
    chunks.value = [nextText];
    previousText.value = nextText;
    return;
  }

  const delta = nextText.slice(previousText.value.length);
  if (!delta) return;

  chunks.value = [...chunks.value, delta];
  previousText.value = nextText;
}

watch(() => props.text, updateChunks, { immediate: true });

const animationStyle = computed(() => ({
  animation: `x-markdown-fade-in ${props.fadeDuration}ms ${props.easing} forwards`,
  color: "inherit",
}));
</script>

<template>
  <span
    v-for="(chunk, index) in chunks"
    :key="`animation-text-${index}`"
    :style="animationStyle"
  >
    {{ chunk }}
  </span>
</template>
