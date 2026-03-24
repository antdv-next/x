<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

declare global {
  interface Window {
    lottie?: {
      loadAnimation: (options: Record<string, unknown>) => {
        play: () => void;
        stop: () => void;
        setSpeed: (speed: number) => void;
        addEventListener: (name: string, cb: () => void) => void;
        destroy: () => void;
      };
    };
  }
}

const props = withDefaults(
  defineProps<{
    path: string;
    autoplay?: boolean;
    loop?: boolean;
    speed?: number;
    fill?: boolean;
    onVisiblePlay?: boolean;
    onLoad?: (animation: {
      play: () => void;
      stop: () => void;
      setSpeed: (speed: number) => void;
      addEventListener: (name: string, cb: () => void) => void;
      destroy: () => void;
      setDirection?: (direction: 1 | -1) => void;
      playSegments?: (segments: [number, number], forceFlag?: boolean) => void;
      loop?: boolean;
    }) => void;
  }>(),
  {
    autoplay: true,
    loop: true,
    speed: 1,
    fill: false,
    onVisiblePlay: false,
  },
);

const rootRef = ref<HTMLElement | null>(null);
let animation: ReturnType<
  NonNullable<typeof window.lottie>["loadAnimation"]
> | null = null;
let observer: IntersectionObserver | null = null;

const LOTTIE_SCRIPT_ID = "x-next-lottie-web";
const LOTTIE_SCRIPT_URL =
  "https://unpkg.com/lottie-web@5.12.2/build/player/lottie.min.js";

function ensureLottieScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.lottie) return Promise.resolve(true);

  const existed = document.getElementById(
    LOTTIE_SCRIPT_ID,
  ) as HTMLScriptElement | null;
  if (existed) {
    return new Promise<boolean>(resolve => {
      existed.addEventListener("load", () => resolve(!!window.lottie), {
        once: true,
      });
      existed.addEventListener("error", () => resolve(false), { once: true });
    });
  }

  const script = document.createElement("script");
  script.id = LOTTIE_SCRIPT_ID;
  script.async = true;
  script.src = LOTTIE_SCRIPT_URL;

  return new Promise<boolean>(resolve => {
    script.addEventListener("load", () => resolve(!!window.lottie), {
      once: true,
    });
    script.addEventListener("error", () => resolve(false), { once: true });
    document.head.appendChild(script);
  });
}

async function initAnimation() {
  if (!rootRef.value) return;
  const ok = await ensureLottieScript();
  if (!ok || !window.lottie || !rootRef.value) return;

  animation = window.lottie.loadAnimation({
    container: rootRef.value,
    renderer: "svg",
    loop: props.loop,
    autoplay: props.autoplay && !props.onVisiblePlay,
    path: props.path,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
    },
  });
  animation.setSpeed(props.speed);
  props.onLoad?.(animation);

  if (props.onVisiblePlay) {
    observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (!entry?.isIntersecting || !animation) return;
        animation.play();
      },
      { threshold: 0.2 },
    );
    observer.observe(rootRef.value);
  }
}

onMounted(() => {
  void initAnimation();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  animation?.destroy();
  observer = null;
  animation = null;
});
</script>

<template>
  <div
    ref="rootRef"
    :style="props.fill ? 'width: 100%; height: 100%' : undefined"
  />
</template>
