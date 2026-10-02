<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface Props {
  text: string;
  fadeDuration?: number;
  easing?: string;
  splitBy?: "chunk" | "sentence";
  delimiters?: string[];
  maxSentenceChars?: number;
}

const props = withDefaults(defineProps<Props>(), {
  fadeDuration: 200,
  easing: "ease-in-out",
  splitBy: "chunk",
  delimiters: () => ["。", "！", "？", ".", "!", "?", "\n"],
  maxSentenceChars: 120,
});

const endsWithDelimiter = (chunk: string, delimiters: string[]): boolean =>
  chunk.length > 0 && delimiters.includes(chunk[chunk.length - 1]);

/**
 * Append `newText` sentence-wise: text that continues the current (unfinished)
 * sentence is merged into its chunk so it does not fade in separately, and a
 * new chunk starts only after a delimiter. Text that is already on screen is
 * never moved to another chunk, so nothing that has faded in fades in again.
 */
/** Push `text` as units of at most `maxChars`, so a long delimiter-less run
 * still fades in piece by piece. */
const pushCapped = (chunks: string[], text: string, maxChars: number): void => {
  for (let start = 0; start < text.length; start += maxChars) {
    chunks.push(text.slice(start, start + maxChars));
  }
};

const appendBySentence = (
  chunks: string[],
  newText: string,
  delimiters: string[],
  maxChars: number,
): string[] => {
  const cap = Math.max(1, maxChars);
  const next = chunks.slice();
  let rest = newText;
  const last = next[next.length - 1];
  // Keep merging into the open sentence unless it is already at the cap.
  if (
    next.length > 0 &&
    !endsWithDelimiter(last, delimiters) &&
    last.length < cap
  ) {
    let cut = -1;
    for (let i = 0; i < rest.length; i++) {
      if (delimiters.includes(rest[i])) {
        cut = i + 1;
        break;
      }
    }
    if (cut === -1) {
      // No delimiter in the delta: merge only up to the cap and split the
      // overflow into cap-sized units, instead of letting one fade-in unit
      // grow without bound (a long URL or base64 chunk would otherwise fade
      // in as a single ever-growing block).
      const room = cap - last.length;
      if (rest.length <= room) {
        next[next.length - 1] += rest;
        return next;
      }
      next[next.length - 1] += rest.slice(0, room);
      rest = rest.slice(room);
      pushCapped(next, rest, cap);
      return next;
    }
    next[next.length - 1] += rest.slice(0, cut);
    rest = rest.slice(cut);
  }
  let start = 0;
  for (let i = 0; i < rest.length; i++) {
    if (delimiters.includes(rest[i])) {
      next.push(rest.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (start < rest.length) pushCapped(next, rest.slice(start), cap);
  return next;
};

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

  chunks.value =
    props.splitBy === "sentence"
      ? appendBySentence(
          chunks.value,
          delta,
          props.delimiters,
          props.maxSentenceChars,
        )
      : [...chunks.value, delta];
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
