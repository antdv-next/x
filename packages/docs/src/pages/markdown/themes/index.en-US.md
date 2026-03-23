---
title: Themes
order: 3
---

Themes keep Markdown typography, colors, and spacing consistent. Built-in themes are `light` and `dark`.

## Quick Usage

```vue
<script setup>
import "@antdv-next/x-markdown/themes/light.css";
</script>

<template>
  <XMarkdown class="x-markdown-light" content="# Hello" />
</template>
```

## Theme Switching

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

## Custom Theme (Minimal Steps)

1. Start from a built-in class (`x-markdown-light` recommended) and add your custom class.
2. Override only the CSS variables you need.
3. Keep the rest inherited from the built-in theme.

```css
.x-markdown-light.x-markdown-custom {
  --primary-color: #0f766e;
  --primary-color-hover: #0d9488;
  --heading-color: #0f172a;
  --text-color: #1f2937;
  --light-bg: rgba(15, 118, 110, 0.08);
}
```

See the built-in theme CSS files for the full variable list.
