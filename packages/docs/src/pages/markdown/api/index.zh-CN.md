---
title: API 参考
order: 2
category: Components
componentName: XMarkdown
packageName: x-markdown
---

## 何时使用

用于快速接入 LLM 的 Markdown 输出渲染，并在需要时接入组件扩展与流式渲染能力。

## 快速示例

### 基础渲染

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `# Hello World\n\n这是 **markdown** 内容。`;
</script>

<template>
  <XMarkdown :content="content" />
</template>
```

### 流式渲染

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

### 组件扩展

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

| 属性                     | 说明                                  | 类型                        | 默认值  |
| ------------------------ | ------------------------------------- | --------------------------- | ------- |
| content                  | 需要渲染的 Markdown 内容              | `string`                    | `''`    |
| components               | 将 HTML 节点映射为自定义 Vue 组件     | `Record<string, Component>` | `{}`    |
| streaming                | 流式渲染行为配置                      | `StreamingOption`           | -       |
| config                   | Marked 解析配置（当前仅保留类型入口） | `MarkedConfig`              | `{}`    |
| debug                    | 是否开启调试面板                      | `boolean`                   | `false` |
| protectCustomTagNewlines | 是否保护自定义标签块                  | `boolean`                   | `true`  |
| escapeRawHtml            | 是否把原始 HTML 转义为文本            | `boolean`                   | `false` |
| className                | 根容器额外类名                        | `string`                    | -       |
| style                    | 根容器内联样式                        | `Record<string, string>`    | -       |
| openLinksInNewTab        | 是否为链接添加新标签页打开属性        | `boolean`                   | `true`  |
| paragraphTag             | 段落标签名                            | `string`                    | `'p'`   |

### MarkedConfig

| 字段   | 说明                    | 类型      | 默认值  |
| ------ | ----------------------- | --------- | ------- |
| gfm    | 是否启用 GFM            | `boolean` | `true`  |
| breaks | 是否将换行解析为 `<br>` | `boolean` | `false` |

### StreamingOption

| 字段                           | 说明                            | 类型                                            | 默认值                                      |
| ------------------------------ | ------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| hasNextChunk                   | 是否还有后续内容块              | `boolean`                                       | `false`                                     |
| enableAnimation                | 是否启用淡入动画                | `boolean`                                       | `true`                                      |
| animationConfig                | 动画配置                        | `AnimationConfig`                               | `{ fadeDuration: 300, easing: 'ease-out' }` |
| tail                           | 是否启用尾部指示器              | `boolean \| TailConfig`                         | `false`                                     |
| incompleteMarkdownComponentMap | 将不完整片段映射到 loading 组件 | `Partial<Record<StreamCacheTokenType, string>>` | -                                           |

### StreamCacheTokenType

`'text' | 'link' | 'image' | 'html' | 'emphasis' | 'list' | 'table' | 'inline-code'`

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

## 相关文档

- [代码示例](./examples)
- [组件扩展](./components)
- [流式渲染](./streaming)
- [主题](./themes)
