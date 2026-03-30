<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { theme } from "antdv-next";
import { computed } from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";
import { useLocale } from "@/composables/use-locale";

const ThemeMarkdownZh = `
# Theme Demo

用于演示 **主题切换** 与 \`CSS 变量\` 自定义。

- 统一字体与颜色
- 统一间距与边框
- 统一链接与引用风格

> 通过覆盖变量即可快速定制外观。

查看 [x-markdown 主题文档](/markdown/themes)。

| Token | 用途 |
| --- | --- |
| --primary-color | 链接/主色 |
| --text-color | 正文文字 |
`;

const ThemeMarkdownEn = `
# Theme Demo

Used to show **theme switching** and \`CSS variable\` customization.

- Keep typography and color consistent
- Keep spacing and borders consistent
- Keep link and quote styles consistent

> Override variables to customize appearance quickly.

See [x-markdown theme docs](/markdown/themes-en).

| Token | Usage |
| --- | --- |
| --primary-color | Link/primary color |
| --text-color | Body text |
`;

const { locale } = useLocale();
const { isDark } = useDarkMode();
const { token } = theme.useToken();

const content = computed(() =>
  locale.value === "zh-CN" ? ThemeMarkdownZh : ThemeMarkdownEn,
);

const markdownClassName = computed(() =>
  isDark.value
    ? "x-markdown-dark x-markdown-custom"
    : "x-markdown-light x-markdown-custom",
);

const customVars = computed(() =>
  isDark.value
    ? {
        "--primary-color": token.value.colorLink,
        "--primary-color-hover": token.value.colorLinkHover,
        "--heading-color": token.value.colorTextHeading,
        "--text-color": token.value.colorText,
        "--dark-bg": token.value.colorFillSecondary,
        "--border-color": token.value.colorBorder,
      }
    : {
        "--primary-color": token.value.colorLink,
        "--primary-color-hover": token.value.colorLinkHover,
        "--heading-color": token.value.colorTextHeading,
        "--text-color": token.value.colorText,
        "--light-bg": token.value.colorFillSecondary,
        "--border-color": token.value.colorBorder,
      },
);

const containerStyle = computed(() => ({
  background: token.value.colorBgContainer,
  padding: "16px",
  borderRadius: `${token.value.borderRadiusLG}px`,
}));
</script>

<template>
  <div :style="containerStyle">
    <XMarkdown :content="content" :class-name="markdownClassName" :style="customVars" />
  </div>
</template>

<docs lang="zh-CN">
自定义主题示例：对齐 antdx 的变量覆盖方式，展示最小定制步骤。
</docs>

<docs lang="en-US">
Custom theme demo aligned with antdx variable overrides and minimal customization steps.
</docs>
