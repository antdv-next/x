---
title: Streaming Rendering
order: 4
---

Handle **LLM streamed Markdown** output: syntax completion and caching, animation, and tail suffix.

## Code Examples

<demo src="./demo/format.vue">Syntax Processing</demo> <demo src="./demo/animation.vue">Rendering Controls</demo>

## API

### streaming

| Parameter                      | Description                             | Type                                                             | Default                                     |
| ------------------------------ | --------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| hasNextChunk                   | Whether more chunks are coming          | `boolean`                                                        | `false`                                     |
| incompleteMarkdownComponentMap | Component mapping for incomplete syntax | `Partial<Record<Exclude<StreamCacheTokenType, 'text'>, string>>` | `{}`                                        |
| enableAnimation                | Enable fade-in animation                | `boolean`                                                        | `true`                                      |
| animationConfig                | Animation config                        | `AnimationConfig`                                                | `{ fadeDuration: 300, easing: 'ease-out' }` |
| tail                           | Enable tail indicator                   | `boolean \| TailConfig`                                          | `false`                                     |

### TailConfig

| Property  | Description                                          | Type        | Default |
| --------- | ---------------------------------------------------- | ----------- | ------- |
| content   | Content to display as tail                           | `string`    | `'▋'`   |
| component | Custom tail component, takes precedence over content | `Component` | -       |

### AnimationConfig

| Property     | Description         | Type     | Default      |
| ------------ | ------------------- | -------- | ------------ |
| fadeDuration | Duration in ms      | `number` | `300`        |
| easing       | CSS easing function | `string` | `'ease-out'` |

> The tail displays `▋` by default. You can customize the character via `content`, or pass a custom Vue component via `component` for animations, delayed display, and other effects.
>
> ```ts
> // Custom tail component example
> import { defineComponent, h, ref } from "vue";
>
> const DelayedTail = defineComponent({
>   props: { content: String },
>   setup(props) {
>     const visible = ref(false);
>     setTimeout(() => {
>       visible.value = true;
>     }, 2000);
>
>     return () => (visible.value ? h("span", props.content) : null);
>   },
> });
> ```

### debug

| Property | Description                                 | Type      | Default |
| -------- | ------------------------------------------- | --------- | ------- |
| debug    | Whether to enable performance monitor panel | `boolean` | `false` |

> ⚠️ **debug** is for development only. Disable in production to avoid overhead and information leakage.

## Supported Incomplete Types

| TokenType     | Example                  |
| ------------- | ------------------------ |
| `link`        | `[text](https://example` |
| `image`       | `![alt](https://img...`  |
| `emphasis`    | `**text`                 |
| `inline-code` | `` `npm install ``       |
| `table`       | `\| col1 \| col2 \|`     |
| `html`        | `<div class="`           |

## Minimal Setup

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import { ref } from "vue";

const content = ref("");
const streaming = ref({
  hasNextChunk: true,
  enableAnimation: true,
  tail: true,
  incompleteMarkdownComponentMap: {
    link: "link-loading",
    image: "image-loading",
  },
});
</script>

<template>
  <XMarkdown
    :content="content"
    :streaming="streaming"
    :components="components"
  />
</template>
```

## FAQ

### Can `hasNextChunk` always be `true`?

No. Set it to `false` for the last chunk so placeholders can be flushed into final rendered content.
