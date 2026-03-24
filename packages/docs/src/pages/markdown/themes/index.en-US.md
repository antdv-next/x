---
title: Themes
order: 3
---

Themes let you keep Markdown typography, colors, and spacing consistent. Built-in options are light and dark; you can also customize via CSS variables or overrides.

## Quick Usage

Import the theme stylesheet and set the theme class on the root:

```vue
<script setup>
import "@antdv-next/x-markdown/themes/light.css";
</script>

<template>
  <XMarkdown class="x-markdown-light" content="# Hello" />
</template>
```

## Code Examples

<!-- prettier-ignore -->
<demo src="./demo/switch.vue">Theme Switch</demo>
<demo src="./demo/custom.vue">Custom Theme</demo>

## Custom Theme (Minimal Steps)

1. Start from a built-in class (`x-markdown-light` is recommended) and add your own class.
2. Override only the CSS variables you need in that custom class.
3. Keep untouched variables inherited from the built-in theme.

```css
.x-markdown-light.x-markdown-custom {
  --primary-color: #0f766e;
  --primary-color-hover: #0d9488;
  --heading-color: #0f172a;
  --text-color: #1f2937;
  --light-bg: rgba(15, 118, 110, 0.08);
}
```

See full variable names in `@antdv-next/x-markdown/themes/light.css` and `@antdv-next/x-markdown/themes/dark.css`.
