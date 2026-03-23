---
title: 流式渲染
order: 4
---

处理 LLM 流式返回 Markdown 的典型能力：增量渲染、不完整片段占位、尾部指示与动画。

## 最小示例

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

| 参数                           | 说明               | 类型                                            | 默认值                                      |
| ------------------------------ | ------------------ | ----------------------------------------------- | ------------------------------------------- |
| hasNextChunk                   | 是否还有后续 chunk | `boolean`                                       | `false`                                     |
| incompleteMarkdownComponentMap | 不完整语法映射组件 | `Partial<Record<StreamCacheTokenType, string>>` | -                                           |
| enableAnimation                | 是否启用淡入动画   | `boolean`                                       | `true`                                      |
| animationConfig                | 动画参数           | `AnimationConfig`                               | `{ fadeDuration: 300, easing: 'ease-out' }` |
| tail                           | 是否启用尾部指示器 | `boolean \| TailConfig`                         | `false`                                     |

### TailConfig

| 属性      | 说明           | 类型        | 默认值 |
| --------- | -------------- | ----------- | ------ |
| content   | 尾部显示内容   | `string`    | `'▋'`  |
| component | 自定义尾部组件 | `Component` | -      |

### AnimationConfig

| 属性         | 说明             | 类型     | 默认值       |
| ------------ | ---------------- | -------- | ------------ |
| fadeDuration | 动画时长（毫秒） | `number` | `300`        |
| easing       | 缓动函数         | `string` | `'ease-out'` |

## 当前支持的不完整片段类型

- `link`
- `image`
- `emphasis`
- `inline-code`
- `html`

## 注意事项

1. 流结束后务必把 `hasNextChunk` 设为 `false`，以结束占位态。
2. 长代码块流式输入时，建议按完整 fenced code 片段切块，减少闪动。
3. `debug` 仅建议开发环境开启。
