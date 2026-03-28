<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from "vue";

import { useResolvedDarkMode } from "@/composables/use-resolved-dark-mode";

interface BubbleConfig {
  size: number;
  left: string;
  top: string;
  color: string;
  offsetXMultiple?: number;
  offsetYMultiple?: number;
  defaultOpacity?: number;
}

interface BubbleState extends BubbleConfig {
  offsetX: number;
  offsetY: number;
  opacity: number;
  scale: number;
}

const MAX_OFFSET = 200;

const { isDark } = useResolvedDarkMode();

const bubbles = reactive<BubbleState[]>([
  {
    size: 300,
    color: "#ee35f1",
    left: "0vw",
    top: "0vh",
    offsetXMultiple: 2,
    defaultOpacity: 0.2,
    offsetY: 0,
    offsetX: 0,
    opacity: 0.2,
    scale: 1,
  },
  {
    size: 300,
    color: "#5939dc",
    left: "30vw",
    top: "80vh",
    defaultOpacity: 0.1,
    offsetY: 0,
    offsetX: 0,
    opacity: 0.1,
    scale: 1,
  },
  {
    size: 300,
    color: "#00D6FF",
    left: "100vw",
    top: "50vh",
    offsetYMultiple: 2,
    defaultOpacity: 0.2,
    offsetY: 0,
    offsetX: 0,
    opacity: 0.2,
    scale: 1,
  },
]);

const timeouts = new Map<number, ReturnType<typeof setTimeout>>();

function randomize(index: number) {
  const bubble = bubbles[index];
  if (!bubble) return;

  const offsetXMultiple = bubble.offsetXMultiple ?? 1;
  const offsetYMultiple = bubble.offsetYMultiple ?? 1;

  bubble.offsetX = (Math.random() - 0.5) * MAX_OFFSET * 2 * offsetXMultiple;
  bubble.offsetY = (Math.random() - 0.5) * MAX_OFFSET * 2 * offsetYMultiple;
  bubble.opacity = isDark.value
    ? 0.1 + Math.random() * 0.2
    : 0.1 + Math.random() * 0.05;
  bubble.scale = 1 + Math.random() * 1;

  const randomTimeout = Math.random() * 2000 + 3000;
  const timer = setTimeout(randomize, randomTimeout, index);
  timeouts.set(index, timer);
}

onMounted(() => {
  bubbles.forEach((_, index) => {
    randomize(index);
  });
});

onBeforeUnmount(() => {
  timeouts.forEach(timeout => clearTimeout(timeout));
  timeouts.clear();
});
</script>

<template>
  <div
    class="absolute inset-0 overflow-hidden bg-[var(--ant-color-bg-layout)] max-[767px]:hidden"
    aria-hidden="true"
  >
    <div
      v-for="(bubble, index) in bubbles"
      :key="`${bubble.color}-${index}`"
      class="pointer-events-none absolute rounded-full blur-[100px] transition-all duration-[5000ms] ease-in-out"
      :style="{
        opacity: bubble.opacity,
        width: `${bubble.size}px`,
        height: `${bubble.size}px`,
        background: bubble.color,
        left: bubble.left,
        top: bubble.top,
        transform: `translate(-50%, -50%) translate(${bubble.offsetX}px, ${bubble.offsetY}px) scale(${bubble.scale})`,
      }"
    />
  </div>
</template>
