---
title: 流式渲染
order: 4
---

处理 **LLM 流式返回的 Markdown**：语法补全和缓存、动画以及尾缀。

## 代码示例

<demo src="./demo/format.vue">语法处理</demo> <demo src="./demo/animation.vue">渲染控制</demo>

## API

### streaming

| 参数                           | 说明                 | 类型                                                             | 默认值                                      |
| ------------------------------ | -------------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| hasNextChunk                   | 是否还有后续 chunk   | `boolean`                                                        | `false`                                     |
| incompleteMarkdownComponentMap | 未完成语法的组件映射 | `Partial<Record<Exclude<StreamCacheTokenType, 'text'>, string>>` | `{}`                                        |
| enableAnimation                | 是否启用淡入动画     | `boolean`                                                        | `true`                                      |
| animationConfig                | 动画参数             | `AnimationConfig`                                                | `{ fadeDuration: 300, easing: 'ease-out' }` |
| tail                           | 是否启用尾部指示器   | `boolean \| TailConfig`                                          | `false`                                     |

### TailConfig

| 属性      | 说明                               | 类型        | 默认值 |
| --------- | ---------------------------------- | ----------- | ------ |
| content   | 尾部显示的内容                     | `string`    | `'▋'`  |
| component | 自定义尾部组件，优先级高于 content | `Component` | -      |

### AnimationConfig

| 属性         | 说明             | 类型     | 默认值       |
| ------------ | ---------------- | -------- | ------------ |
| fadeDuration | 动画时长（毫秒） | `number` | `300`        |
| easing       | 缓动函数         | `string` | `'ease-out'` |

> 尾部默认显示 `▋`。可通过 `content` 自定义字符，或通过 `component` 传入自定义 Vue 组件实现动画、延迟显示等效果。
>
> ```ts
> // 自定义尾部组件示例
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

| 属性  | 说明                 | 类型      | 默认值  |
| ----- | -------------------- | --------- | ------- |
| debug | 是否启用性能监控面板 | `boolean` | `false` |

> ⚠️ **debug** 仅限开发环境使用，生产环境请关闭以避免性能开销与信息泄露。

## 支持的不完整语法

| TokenType     | 示例                     |
| ------------- | ------------------------ |
| `link`        | `[text](https://example` |
| `image`       | `![alt](https://img...`  |
| `emphasis`    | `**text`                 |
| `inline-code` | `` `npm install ``       |
| `table`       | `\| col1 \| col2 \|`     |
| `html`        | `<div class="`           |

## 最小配置示例

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

### `hasNextChunk` 可以一直是 `true` 吗？

不建议。最后一个 chunk 到达后应切换为 `false`，否则未完成语法会持续停留在占位状态。
