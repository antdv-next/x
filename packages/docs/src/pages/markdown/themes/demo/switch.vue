<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { Segmented } from "antdv-next";
import { computed, ref } from "vue";

const mode = ref<"light" | "dark">("light");

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
主题切换示例：对齐 antdx 的 segmented 交互与主题容器样式。
</docs>

<docs lang="en-US">
Theme switch demo aligned with antdx segmented interaction and themed container styling.
</docs>
