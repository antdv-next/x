---
title: 流式渲染
order: 4
---

处理 **LLM 流式返回的 Markdown**：语法补全和缓存、动画以及尾缀。

## 代码演示 {#examples}

<demo src="./demo/streaming-preset.vue" description="左边不做流式处理，右边 :streaming=&quot;isStreaming&quot;。用 slow 档看差别">流式预设对比</demo>
<demo src="./demo/streaming-format.vue">语法处理</demo>
<demo src="./demo/streaming-animation.vue">渲染控制</demo>

## API

### streaming

`streaming` 接受布尔值或对象。传布尔值即预设：`true` 表示流式进行中，等同 `hasNextChunk: true` 并打开 `incremental`、`incompleteMarkdown: 'complete'`、`typewriter`；`false` 表示流已结束，按最终内容渲染。把应用里现成的 `isStreaming` 直接传进来即可：`<XMarkdown :content="content" :streaming="isStreaming" />`。传对象则逐项控制，对象形式的行为和默认值没有变化。

| 参数                           | 说明                                                                                                                                                                                                                                                                                      | 类型                                                                   | 默认值                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| hasNextChunk                   | 是否还有后续 chunk                                                                                                                                                                                                                                                                        | `boolean`                                                              | `false`                                        |
| incremental                    | 按标题切段，每个 chunk 只重新解析、渲染正在增长的最后一段。传对象可设置 `minSectionChars`（短于该长度的段并入下一段）和 `keepSectionsOnEnd`（默认 `true`：流结束后各段保持不变、已挂载的自定义组件不重新挂载；`false`：流结束时回到整篇一次性渲染，用了带全局状态的 marked 扩展时请关掉） | `boolean \| { minSectionChars?: number; keepSectionsOnEnd?: boolean }` | `false`                                        |
| incompleteMarkdown             | 未写完的语法如何显示：`placeholder` 扣住或显示占位组件；`complete` 把写到一半的强调、行内代码、链接文字、列表项当作完整文本立刻显示                                                                                                                                                       | `'placeholder' \| 'complete'`                                          | `'placeholder'`                                |
| incompleteMarkdownComponentMap | 未完成语法的组件映射，对某个语法显式配置后以占位组件为准                                                                                                                                                                                                                                  | `Partial<Record<Exclude<StreamCacheTokenType, 'text'>, string>>`       | `{}`                                           |
| typewriter                     | 打字机效果：新到的内容按 chunk 节奏匀速放出，而不是整块出现                                                                                                                                                                                                                               | `boolean \| TypewriterConfig`                                          | `false`                                        |
| enableAnimation                | 是否启用淡入动画                                                                                                                                                                                                                                                                          | `boolean`                                                              | `true`                                         |
| animationConfig                | 动画参数                                                                                                                                                                                                                                                                                  | `AnimationConfig`                                                      | `{ fadeDuration: 200, easing: 'ease-in-out' }` |
| tail                           | 是否启用尾部指示器                                                                                                                                                                                                                                                                        | `boolean \| TailConfig`                                                | `false`                                        |

> `incremental` 只在顶格的 ATX 标题前切分；围栏代码、HTML 块（`<div>`、`<pre>`、`<script>`、注释等）、`$$` 公式里的 `#` 行不算标题。文档里出现链接引用定义或脚注定义、或自定义组件标签跨越切点时不切分。各段渲染在同一个根节点里，DOM 与整篇一次渲染完全一致。

### TypewriterConfig

| 属性             | 说明                                                                                                                              | 类型                   | 默认值                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------- |
| unit             | 放出单位。`char` 逐字；`sentence` 攒到分隔符一起放出（围栏代码、行内代码里的分隔符不算，换行总是分隔符）                          | `'char' \| 'sentence'` | `'char'`                                  |
| delimiters       | 句子分隔符                                                                                                                        | `string[]`             | `['。', '！', '？', '.', '!', '?', '\n']` |
| minCps           | 最低速度（字/秒），速度随 chunk 到达节奏自适应                                                                                    | `number`               | `24`                                      |
| maxCps           | 最高速度（字/秒）                                                                                                                 | `number`               | `3000`                                    |
| pauseMs          | `unit` 为 `char` 时放出分隔符后的停顿（毫秒）                                                                                     | `number`               | `0`                                       |
| maxSentenceChars | `unit` 为 `sentence` 时，自上一个分隔符起最多攒多少个字符；超过后退回逐字放出直到下一个分隔符，防止长 URL、单行 JSON 长时间不显示 | `number`               | `120`                                     |

> 放出的永远是 `content` 的前缀，且不会切在一个 emoji（含 👨‍👩‍👧‍👦、🇨🇳、👍🏽、❤️ 这类多码点序列）或带变音符号的字符中间；`hasNextChunk` 变为 `false` 时立即放完。

### TailConfig

| 属性      | 说明                               | 类型        | 默认值 |
| --------- | ---------------------------------- | ----------- | ------ |
| content   | 尾部显示的内容                     | `string`    | `'▋'`  |
| component | 自定义尾部组件，优先级高于 content | `Component` | -      |

### AnimationConfig

| 属性             | 说明                                                                                                                                     | 类型                    | 默认值                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------- |
| fadeDuration     | 动画时长（毫秒）                                                                                                                         | `number`                | `200`                                     |
| easing           | 缓动函数                                                                                                                                 | `string`                | `'ease-in-out'`                           |
| splitBy          | 淡入单位。`chunk` 每次新到的文本单独淡入；`sentence` 并入当前句子，到分隔符才开始下一个淡入单元。与 `typewriter` 同时使用时选 `sentence` | `'chunk' \| 'sentence'` | `'chunk'`                                 |
| delimiters       | `splitBy` 为 `sentence` 时的分隔符                                                                                                       | `string[]`              | `['。', '！', '？', '.', '!', '?', '\n']` |
| maxSentenceChars | `splitBy` 为 `sentence` 时一个淡入单元最多容纳的字符数，超过后新到的文本另起一个单元                                                     | `number`                | `120`                                     |

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

## 自定义组件的重渲染

每次解析都会给自定义组件传一个新的 `domNode`，而 Vue 没有 `React.memo` 那样的 props 比较函数，也无法跳过带 slot 组件的更新，所以流式期间自定义组件随每个 chunk 重渲染是预期行为。控制成本的正确姿势：

- **`incremental`（推荐）**：已结束的段整体不再重渲染，只剩正在增长的最后一段参与每个 chunk 的解析与渲染，容器型组件（`table`、自定义标签）同样受益；
- **把昂贵操作移出渲染路径**：以 `XCodeHighlighter` 为例，重新高亮由 `watch(content / language / theme)` 驱动，文本没变就不会重新 tokenize，重渲染本身只是重建 vnode，开销可忽略；
- `components`、`config`、`streaming` 等对象请在组件外部固定（模块常量或 `computed`），内联字面量会让解析器配置频繁变更。

## FAQ

### `hasNextChunk` 可以一直是 `true` 吗？

不建议。最后一个 chunk 到达后应切换为 `false`，否则未完成语法会持续停留在占位状态。用布尔形式时把 `isStreaming` 直接传给 `streaming` 就不会漏。
