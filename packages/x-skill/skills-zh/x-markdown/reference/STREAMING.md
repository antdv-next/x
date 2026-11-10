# 流式渲染指南

## 适用场景

当 Markdown 内容以分块方式持续追加，并且中途可能出现不完整语法时，使用 streaming 模式。

典型场景包括：

- 半截链接，如 `[docs](https://example`
- 半截表格
- 尚未闭合的代码块
- 回答仍在生成时的尾部光标

## 推荐：布尔预设

把应用自己的“回答是否仍在流式输出”标志直接传给 `streaming`。`true` 会开启预设（`incremental`、`incompleteMarkdown: 'complete'`、`typewriter` 以及按句子淡入）；`false` 会按最终内容一次性渲染。

```vue
<script setup>
import { ref } from "vue";
import { XMarkdown } from "@antdv-next/x-markdown";

const content = ref("");
const isStreaming = ref(true);
</script>

<template>
  <XMarkdown :content="content" :streaming="isStreaming" />
</template>
```

预设默认不显示尾部光标，因为这是应用自己的视觉选择。需要时在对象形式里加 `tail: true`。

## 对象形式

需要逐项控制时使用对象：

```vue
<template>
  <XMarkdown
    :content="content"
    :streaming="{
      hasNextChunk,
      enableAnimation: true,
      tail: true,
    }"
  />
</template>
```

`hasNextChunk` 必须真实反映流状态：

- 还有后续 chunk 时为 `true`
- 最后一块必须为 `false`，这样缓存的不完整片段才会被刷新为最终内容

## 性能：incremental 分段

`incremental` 会在流式期间按顶层标题切分文档。只有最后仍在增长的一段会随每个 chunk 重新解析、净化和渲染，前面的段直接复用。

```vue
<XMarkdown
  :content="content"
  :streaming="{ hasNextChunk, incremental: true }"
/>
```

只有顶格的 ATX 标题、且渲染器自己的 marked 实例认为该行开启一个新的顶层块时才会切分。切分器使用与渲染器相同的 `config`（包括扩展插件）来判定，因此不会在围栏代码、HTML 块、列表、引用块或缩进代码内部切分。原始块（`<pre>`、注释、`<?`、`<!`、`<![CDATA[`）以及 `$$` / `\[` 公式在闭合前不参与切分。出现链接引用定义或脚注定义、或自定义组件标签跨越切点时，也会禁用切分。

没有切分的情况都是有意为之：拒绝切分只会少复用一段，而多切一段会改变渲染结果。

## 不完整语法处理

用 `incompleteMarkdown` 选择半截语法的显示方式：

- `placeholder`（默认）：扣住不显示，或显示 `incompleteMarkdownComponentMap` 指定的占位组件
- `complete`：把写到一半的强调、行内代码、链接文字、列表项当作已写完的文本立即显示；图片、HTML、表格仍按 `placeholder` 处理

```vue
<XMarkdown
  :content="content"
  :streaming="{
    hasNextChunk,
    incompleteMarkdown: 'complete',
  }"
/>
```

如果不完整片段需要展示自定义 loading UI，而不是直接显示破损 Markdown，可使用 `incompleteMarkdownComponentMap`。显式配置的映射优先于 `incompleteMarkdown: 'complete'`。

```vue
<XMarkdown
  :content="content"
  :streaming="{
    hasNextChunk,
    incompleteMarkdownComponentMap: {
      link: 'link-loading',
      table: 'table-loading',
    },
  }"
  :components="{
    'link-loading': LinkSkeleton,
    'table-loading': TableSkeleton,
  }"
/>
```

## 打字机效果

`typewriter` 会按 chunk 到达的节奏匀速放出新内容，而不是整块出现。放出的永远是 `content` 的前缀；`hasNextChunk` 变为 `false` 时立即放完。

```vue
<XMarkdown
  :content="content"
  :streaming="{
    hasNextChunk,
    typewriter: {
      unit: 'sentence',
      minCps: 24,
      maxCps: 3000,
    },
  }"
/>
```

`unit: 'char'` 时，`pauseMs` 会在每个分隔符后增加停顿。`unit: 'sentence'` 时，`maxSentenceChars` 限制自上一个分隔符起最多扣住多少字符，超过后退回逐字放出，避免长 URL 和单行 JSON 长时间不显示。

与淡入动画同时使用时，配置 `animationConfig: { splitBy: 'sentence' }`；否则每帧放出的几个字都会各自成为一个淡入节点。

## Loading 与 Done

自定义组件会收到 `streamStatus`：

- `loading`：语法可能还未完整
- `done`：最终内容已经稳定

如果组件内部需要做昂贵解析或请求，优先等到 `streamStatus === 'done'`。

## 聊天场景建议

- 优先使用 `:streaming="isStreaming"`，不要手工维护 `hasNextChunk`。
- 只有在回答仍在生成时才显示 tail 指示器。
- 占位组件尽量轻量。
- 如果组件依赖闭合代码块或完整结构块，等到 `done` 再解析。
- 长回答开启 `incremental`；已完成的段会完全停止重新渲染。

## 排查清单

- 最终结果仍然残缺：对象形式下确认最后一次渲染把 `hasNextChunk` 设为 `false`
- 占位组件不消失：确认映射的标签名已在 `components` 中注册
- 没有发生分段：检查标题是否缩进、是否位于未闭合块内，或文档是否包含链接引用定义 / 脚注定义——这些都是有意拒绝
- 性能不稳定：开启 `incremental`，先关闭动画和占位组件，再逐个加回
