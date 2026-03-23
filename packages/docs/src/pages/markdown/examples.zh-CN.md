---
title: 使用示例
order: 2.1
tag: 2.0.0
category: Components
componentName: XMarkdown
packageName: x-markdown
---

## 何时使用

当你希望快速落地 Markdown 渲染，并逐步叠加流式、组件扩展、安全策略时。

## 示例目录

### 1. 最小可用

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";

const content = "# Hello\n\n- item 1\n- item 2";
</script>

<template>
  <XMarkdown :content="content" />
</template>
```

### 2. 流式输出

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

### 3. 自定义代码块渲染

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

### 4. 安全与链接策略

```vue
<script setup>
import { XMarkdown } from '@antdv-next/x-markdown'

const content = '<script>alert(1)</script>\n\n[官网](https://example.com)'
</script>

<template>
  <XMarkdown
    :content="content"
    :escape-raw-html="true"
    :open-links-in-new-tab="true"
  />
</template>
```

### 5. 主题切换

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

## 相关文档

- [Playground](./playground)
- [API](./api)
