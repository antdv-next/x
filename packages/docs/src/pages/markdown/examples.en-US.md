---
title: Examples
order: 2.1
tag: 2.0.0
category: Components
componentName: XMarkdown
packageName: x-markdown
---

## When to Use

Use these examples to roll out Markdown rendering first, then add streaming, custom components, and safety controls.

## Example Catalog

### 1. Minimal Setup

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";

const content = "# Hello\n\n- item 1\n- item 2";
</script>

<template>
  <XMarkdown :content="content" />
</template>
```

### 2. Streaming Output

```vue
<script setup>
import { ref } from 'vue'
import { XMarkdown } from '@antdv-next/x-markdown'

const content = ref('')
const streaming = ref({
  hasNextChunk: true,
  tail: true,
  enableAnimation: true,
})

function onChunk(chunk: string, done: boolean) {
  content.value += chunk
  streaming.value.hasNextChunk = !done
}
</script>

<template>
  <XMarkdown :content="content" :streaming="streaming" />
</template>
```

### 3. Custom Code Block Rendering

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import CodeBlock from "./CodeBlock.vue";

const components = { pre: CodeBlock };
const content = `\`\`\`ts\nconst answer = 42\n\`\`\``;
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

### 4. Security and Link Strategy

```vue
<script setup>
import { XMarkdown } from '@antdv-next/x-markdown'

const content = '<script>alert(1)</script>\n\n[Docs](https://example.com)'
</script>

<template>
  <XMarkdown
    :content="content"
    :escape-raw-html="true"
    :open-links-in-new-tab="true"
  />
</template>
```

### 5. Theme Switching

```vue
<script setup>
import { ref, computed } from "vue";
import { XMarkdown } from "@antdv-next/x-markdown";
import "@antdv-next/x-markdown/themes/light.css";
import "@antdv-next/x-markdown/themes/dark.css";

const dark = ref(false);
const themeClass = computed(() =>
  dark.value ? "x-markdown-dark" : "x-markdown-light",
);
const content = "# Theme Demo";
</script>

<template>
  <XMarkdown :class="themeClass" :content="content" />
</template>
```

## Related Docs

- [Playground](./playground-en)
- [API](./api-en)
