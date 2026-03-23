---
title: API Reference
order: 2
category: Components
componentName: XMarkdown
packageName: x-markdown
---

## When to Use

Use this page as a minimal reference for rendering LLM Markdown output with component extension and streaming support.

## Quick Examples

### Basic Rendering

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `# Hello World\n\nThis is **markdown** content.`;
</script>

<template>
  <XMarkdown :content="content" />
</template>
```

### Streaming Rendering

```vue
<script setup>
import { ref } from "vue";
import { XMarkdown } from "@antdv-next/x-markdown";

const content = ref("");
const streaming = ref({
  hasNextChunk: true,
  enableAnimation: true,
  tail: true,
});
</script>

<template>
  <XMarkdown :content="content" :streaming="streaming" />
</template>
```

### Component Extension

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import CodeBlock from "./CodeBlock.vue";

const components = {
  pre: CodeBlock,
};
const content = `\`\`\`ts\nconsole.log('hello')\n\`\`\``;
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

## Props

| Property                 | Description                                                            | Type                        | Default |
| ------------------------ | ---------------------------------------------------------------------- | --------------------------- | ------- |
| content                  | Markdown content to render                                             | `string`                    | `''`    |
| components               | Map HTML nodes to custom Vue components                                | `Record<string, Component>` | `{}`    |
| streaming                | Streaming behavior config                                              | `StreamingOption`           | -       |
| config                   | Marked config entry (type-level placeholder in current implementation) | `MarkedConfig`              | `{}`    |
| debug                    | Enable debug panel                                                     | `boolean`                   | `false` |
| protectCustomTagNewlines | Protect custom tag blocks                                              | `boolean`                   | `true`  |
| escapeRawHtml            | Escape raw HTML as plain text                                          | `boolean`                   | `false` |
| className                | Extra CSS class for root container                                     | `string`                    | -       |
| style                    | Inline style object for root container                                 | `Record<string, string>`    | -       |
| openLinksInNewTab        | Add new-tab attributes to links                                        | `boolean`                   | `true`  |
| paragraphTag             | Paragraph tag name                                                     | `string`                    | `'p'`   |

### MarkedConfig

| Field  | Description                   | Type      | Default |
| ------ | ----------------------------- | --------- | ------- |
| gfm    | Enable GFM parsing            | `boolean` | `true`  |
| breaks | Convert line breaks to `<br>` | `boolean` | `false` |

### StreamingOption

| Field                          | Description                                    | Type                                            | Default                                     |
| ------------------------------ | ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| hasNextChunk                   | Whether more chunks are expected               | `boolean`                                       | `false`                                     |
| enableAnimation                | Enable fade-in animation                       | `boolean`                                       | `true`                                      |
| animationConfig                | Animation options                              | `AnimationConfig`                               | `{ fadeDuration: 300, easing: 'ease-out' }` |
| tail                           | Enable tail indicator                          | `boolean \| TailConfig`                         | `false`                                     |
| incompleteMarkdownComponentMap | Map incomplete fragments to loading components | `Partial<Record<StreamCacheTokenType, string>>` | -                                           |

### StreamCacheTokenType

`'text' | 'link' | 'image' | 'html' | 'emphasis' | 'list' | 'table' | 'inline-code'`

### TailConfig

| Property  | Description           | Type        | Default |
| --------- | --------------------- | ----------- | ------- |
| content   | Tail content          | `string`    | `'▋'`   |
| component | Custom tail component | `Component` | -       |

### AnimationConfig

| Property     | Description              | Type     | Default      |
| ------------ | ------------------------ | -------- | ------------ |
| fadeDuration | Duration in milliseconds | `number` | `300`        |
| easing       | CSS easing function      | `string` | `'ease-out'` |

## Related Docs

- [Examples](./examples-en)
- [Components](./components-en)
- [Streaming](./streaming-en)
- [Themes](./themes-en)
