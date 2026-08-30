<script setup lang="ts">
import { provideDemoContext } from "@antdv-next/docs-plugins/component/code-demo/context";
import CodeDemo from "@antdv-next/docs-plugins/component/code-demo/index.vue";
import { useRoute } from "vue-router";

import { useDarkMode } from "@/composables/use-dark-mode";

import { loadPlaygroundUrl } from "./playground";

defineOptions({
  name: "Demo",
});

const props = withDefaults(
  defineProps<{
    src: string;
    background?: string;
    simplify?: boolean;
  }>(),
  { background: "", simplify: false },
);

const route = useRoute();
const { isDark } = useDarkMode();

provideDemoContext({
  locale: () => (route.meta?.locale === "en-US" ? "en-US" : "zh-CN"),
  isDark: () => isDark.value,
  modules: {
    "@antdv-next/x": () => import("@antdv-next/x"),
    "@antdv-next/x-card": () => import("@antdv-next/x-card"),
    "@antdv-next/x-markdown": () => import("@antdv-next/x-markdown"),
    "@antdv-next/x-sdk": () => import("@antdv-next/x-sdk"),
    "@antdv-next/icons": () => import("@antdv-next/icons"),
    "antdv-next": () => import("antdv-next"),
    "antdv-style": () => import("antdv-style"),
    dayjs: () => import("dayjs"),
  },
  openPlayground: code => {
    const playgroundWindow = window.open("about:blank", "_blank");
    if (playgroundWindow) playgroundWindow.opener = null;
    const url = loadPlaygroundUrl(code);
    if (playgroundWindow) playgroundWindow.location.replace(url);
    else window.open(url, "_blank", "noopener,noreferrer");
  },
  demoPageUrl: id => `/~demos/${id}`,
});
</script>

<template>
  <CodeDemo v-bind="props">
    <slot />
  </CodeDemo>
</template>
