<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";

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

const customVars: Record<string, string> = {
  "--primary-color": "#0f766e",
  "--primary-color-hover": "#0d9488",
  "--heading-color": "#0f172a",
  "--text-color": "#1f2937",
  "--light-bg": "rgba(15, 118, 110, 0.08)",
  "--border-color": "rgba(15, 23, 42, 0.12)",
};
</script>

<template>
  <div style="background: #ffffff; padding: 16px; border-radius: 6px">
    <XMarkdown
      :content="content"
      class-name="x-markdown-light x-markdown-custom"
      :style="customVars"
    />
  </div>
</template>

<docs lang="zh-CN">
自定义主题示例：对齐 antdx 的变量覆盖方式，展示最小定制步骤。
</docs>

<docs lang="en-US">
Custom theme demo aligned with antdx variable overrides and minimal customization steps.
</docs>
