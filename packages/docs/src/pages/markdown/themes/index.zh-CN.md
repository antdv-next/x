---
title: 主题
order: 3
---

通过主题可以统一 Markdown 的字体、颜色、间距等视觉风格。当前内置 `light` / `dark` 两套主题。

## 快速使用

```vue
<script setup>
import "@antdv-next/x-markdown/themes/light.css";
</script>

<template>
  <XMarkdown class="x-markdown-light" content="# Hello" />
</template>
```

## 主题切换

```vue
<script setup>
import { ref, computed } from "vue";
import "@antdv-next/x-markdown/themes/light.css";
import "@antdv-next/x-markdown/themes/dark.css";

const dark = ref(false);
const themeClass = computed(() =>
  dark.value ? "x-markdown-dark" : "x-markdown-light",
);
</script>

<template>
  <XMarkdown :class="themeClass" content="# Theme Demo" />
</template>
```

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

完整变量名请参考内置主题 CSS 文件。
