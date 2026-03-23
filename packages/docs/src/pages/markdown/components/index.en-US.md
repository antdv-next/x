---
group:
  title: Components
  order: 5
title: Overview
order: 1
---

`components` is the main extension point in `@antdv-next/x-markdown`. It lets you map Markdown/HTML nodes to custom Vue components and centralize rendering, state, and business logic.

## Basic Registration

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import CodeBlock from "./CodeBlock.vue";
import MermaidBlock from "./MermaidBlock.vue";

const content = `\`\`\`ts\nconsole.log('hello')\n\`\`\`\n\n<mermaid>graph TD; A-->B</mermaid>`;

const components = {
  pre: CodeBlock,
  mermaid: MermaidBlock,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

## ComponentProps

| Property     | Description                                                    | Type                      | Default |
| ------------ | -------------------------------------------------------------- | ------------------------- | ------- |
| streamStatus | Streaming state of current node                                | `'loading' \| 'done'`     | -       |
| lang         | Code block language                                            | `string`                  | -       |
| block        | Whether current code is block-level                            | `boolean`                 | -       |
| other attrs  | Passthrough DOM attrs (`href`, `src`, `title`, `data-*`, etc.) | `Record<string, unknown>` | -       |

## Best Practices

1. Keep component references stable. Avoid inline function components in `components`.
2. Use `streamStatus` to separate loading UI from finalized UI.
3. Run heavy parsing after `streamStatus === 'done'` when possible.
4. Use semantic custom tag names and avoid collisions with native tags.

## Component Scenarios

- [Chat Enhancement](./chat-enhancement-en)
- [Data Display](./data-display-en)
- [Rich Text Enhancement](./rich-text-en)
