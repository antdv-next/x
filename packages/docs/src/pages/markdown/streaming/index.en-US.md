---
title: Streaming Rendering
order: 4
---

Core capabilities for streamed LLM Markdown: incremental rendering, incomplete-fragment placeholders, tail indicator, and animation.

## Minimal Example

```vue
<script setup>
import { ref } from 'vue'
import { XMarkdown } from '@antdv-next/x-markdown'

const content = ref('')
const streaming = ref({
  hasNextChunk: true,
  enableAnimation: true,
  tail: true,
  incompleteMarkdownComponentMap: {
    link: 'link-loading',
    image: 'image-loading',
  },
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

## API

### streaming

| Parameter                      | Description                                         | Type                                            | Default                                     |
| ------------------------------ | --------------------------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| hasNextChunk                   | Whether more chunks are coming                      | `boolean`                                       | `false`                                     |
| incompleteMarkdownComponentMap | Mapping from incomplete syntax to custom components | `Partial<Record<StreamCacheTokenType, string>>` | -                                           |
| enableAnimation                | Enable fade-in animation                            | `boolean`                                       | `true`                                      |
| animationConfig                | Animation config                                    | `AnimationConfig`                               | `{ fadeDuration: 300, easing: 'ease-out' }` |
| tail                           | Enable tail indicator                               | `boolean \| TailConfig`                         | `false`                                     |

### TailConfig

| Property  | Description           | Type        | Default |
| --------- | --------------------- | ----------- | ------- |
| content   | Tail content          | `string`    | `'▋'`   |
| component | Custom tail component | `Component` | -       |

### AnimationConfig

| Property     | Description         | Type     | Default      |
| ------------ | ------------------- | -------- | ------------ |
| fadeDuration | Duration in ms      | `number` | `300`        |
| easing       | CSS easing function | `string` | `'ease-out'` |

## Currently Supported Incomplete Fragment Types

- `link`
- `image`
- `emphasis`
- `inline-code`
- `html`

## Notes

1. Set `hasNextChunk` to `false` when streaming ends to flush placeholders.
2. For long code blocks, chunk by complete fenced-code segments when possible.
3. `debug` should be enabled in development only.
