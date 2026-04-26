<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { Segmented } from "antdv-next";
import { computed, ref, watch } from "vue";
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/light.css";
import "@antdv-next/x-markdown/themes/dark.css";
import { useDarkMode } from "@/composables/use-dark-mode";

const { isDark } = useDarkMode();
const mode = ref<"light" | "dark">(isDark.value ? "dark" : "light");

watch(isDark, value => {
  mode.value = value ? "dark" : "light";
});

const markdownClass = computed(() =>
  mode.value === "light" ? "x-markdown-light" : "x-markdown-dark",
);

const containerStyle = computed(() =>
  mode.value === "light"
    ? { background: "#ffffff", border: "1px solid rgba(5, 5, 5, 0.06)" }
    : {
        background: "#141414",
        border: "1px solid rgba(255, 255, 255, 0.14)",
      },
);

const content = `
# Theme Demo

Used to show **theme switching** and \`CSS variable\` customization.

- Keep typography and color consistent
- Keep spacing and borders consistent
- Keep link and quote styles consistent

> Override variables to customize appearance quickly.

See [x-markdown theme docs](/markdown/themes).

| Token | Usage |
| --- | --- |
| --primary-color | Link/primary color |
| --text-color | Body text |
`;
</script>

<template>
  <div>
    <Segmented
      v-model:value="mode"
      :options="[
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ]"
      style="margin-bottom: 12px"
    />

    <div :style="{ ...containerStyle, padding: '16px', borderRadius: '6px' }">
      <XMarkdown :content="content" :class-name="markdownClass" />
    </div>
  </div>
</template>

<docs lang="zh-CN">
主题切换示例，展示分段切换交互与主题容器样式。
</docs>

<docs lang="en-US">
Theme switch demo showing segmented controls and themed container styling.
</docs>
