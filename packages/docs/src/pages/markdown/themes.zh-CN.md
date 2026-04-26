---
title: 主题
order: 3
---

通过主题可以统一 Markdown 的字体、颜色、间距等视觉风格，内置 light / dark，也可通过 CSS 变量或覆盖样式做自定义。

## 快速使用

引入对应主题样式并为根节点设置主题类名即可：

```vue
<script setup>
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/light.css";
</script>

<template>
  <XMarkdown class="x-markdown-light" content="# Hello" />
</template>
```

## 代码示例

<!-- prettier-ignore -->
<demo src="./demo/themes-switch.vue">主题切换</demo>
<demo src="./demo/themes-custom.vue">自定义主题</demo>

## 自定义主题（最小步骤）

1. 基于内置主题类（推荐 `x-markdown-light`）叠加一个自定义类。
2. 在自定义类里覆盖需要的 CSS 变量。
3. 仅维护你关心的变量，其余继续继承内置主题值。

```css
.x-markdown-light.x-markdown-custom {
  --primary-color: #0f766e;
  --primary-color-hover: #0d9488;
  --heading-color: #0f172a;
  --text-color: #1f2937;
  --light-bg: rgba(15, 118, 110, 0.08);
}
```

完整变量名请参考 `@antdv-next/x-markdown/themes/light.css` 与 `@antdv-next/x-markdown/themes/dark.css`。
