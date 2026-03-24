---
group:
  title: Components
  order: 5
title: Overview
order: 1
---

The `components` property is the primary extension point in `@antdv-next/x-markdown`. It lets you map Markdown/HTML nodes to your own Vue components so you can control rendering, streaming behavior, and business data interaction in one place. To extend further, see [Plugins](./plugins-en) and custom renderers.

## Basic registration

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import ThinkBlock from "./ThinkBlock.vue";
import MermaidBlock from "./MermaidBlock.vue";

const components = {
  think: ThinkBlock,
  mermaid: MermaidBlock,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

## ComponentProps

| Property     | Description                                                                                                                                                                                                                                                          | Type                      | Default |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------- |
| domNode      | DOM node info of current parsed element                                                                                                                                                                                                                              | `HTMLElement`             | -       |
| streamStatus | Streaming rendering supports two states: `loading` indicates content is being loaded, `done` indicates loading is complete. Currently only supports HTML format and fenced code blocks. Since indented code has no clear end marker, it always returns `done` status | `'loading' \| 'done'`     | -       |
| lang         | Code block language                                                                                                                                                                                                                                                  | `string`                  | -       |
| block        | Whether current code is block-level                                                                                                                                                                                                                                  | `boolean`                 | -       |
| rest         | Component properties, supports standard HTML attributes (`href`, `title`, `class`, etc.) and custom data attributes                                                                                                                                                  | `Record<string, unknown>` | -       |

## Best Practices

1. Keep component references stable. Avoid inline function components in `components`.
2. Use `streamStatus` to separate loading UI (`loading`) from finalized UI (`done`).
3. If data depends on complete syntax, fetch or parse after `streamStatus === 'done'`.
4. Keep custom tags semantically clear and avoid ambiguous mixed Markdown/HTML blocks.

## FAQ: Custom Tag Closing Issues

If block-level custom tags contain unexpected blank lines, Markdown parsers may end the HTML block early and convert trailing content into paragraphs. To avoid this:

1. Keep content inside custom tags contiguous when possible.
2. Or place blank lines both before and after the full custom block so the parser treats it as an independent block.
