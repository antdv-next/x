<script setup lang="ts">
import { computed } from "vue";

interface Props {
  text: string;
  fadeDuration?: number;
  easing?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fadeDuration: 200,
  easing: "ease-in-out",
});

// Render-phase computation: chunks are derived synchronously while the
// component renders (no watch/state round-trip), so streaming text updates
// never trigger an extra reactive update or repeated animation. Mirrors
// ant-design/x#1998 ("use useRef render-phase computation to eliminate extra
// re-render in AnimationText").
let previousText = "";
let cachedChunks: string[] = [];

const chunks = computed(() => {
  const text = props.text;

  if (text === previousText) return cachedChunks;

  let next: string[];
  if (!(previousText && text.startsWith(previousText))) {
    // Not an append: replace everything.
    next = [text];
  } else {
    const delta = text.slice(previousText.length);
    next = delta ? [...cachedChunks, delta] : cachedChunks;
  }

  previousText = text;
  cachedChunks = next;
  return next;
});

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
