# API 参考

## XMarkdownProps

| 属性                     | 说明                                                                                             | 类型                                      | 默认值          |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------- | --------------- |
| content                  | 需要渲染的 Markdown 内容。没有 `children` 属性，请使用 `content`                                 | `string`                                  | `''`            |
| components               | 将 HTML 节点映射为自定义 Vue 组件                                                                | `Record<string, Component>`               | `{}`            |
| componentsProps          | 按标签名向 `components` 中的组件传递固定额外 props，保持组件引用稳定，避免内联闭包导致的重复挂载 | `Record<string, Record<string, unknown>>` | -               |
| streaming                | 流式渲染行为。传布尔值开启预设（`true` 表示仍在流式输出，`false` 表示已结束）；传对象则逐项配置  | `boolean \| StreamingOption`              | -               |
| config                   | Marked 解析配置，最后应用，可能覆盖内置 renderer                                                 | `MarkedConfig`                            | `{ gfm: true }` |
| className                | 根容器的额外 CSS 类名                                                                            | `string`                                  | -               |
| style                    | 根容器的内联样式                                                                                 | `Record<string, string>`                  | -               |
| paragraphTag             | 段落使用的 HTML 标签（避免自定义组件含块级元素时的校验问题）                                     | `string`                                  | `'p'`           |
| openLinksInNewTab        | 是否为所有链接添加 `target="_blank"` 并在新标签页打开                                            | `boolean`                                 | `true`          |
| protectCustomTagNewlines | 是否保留自定义标签内部的换行                                                                     | `boolean`                                 | `true`          |
| escapeRawHtml            | 是否将 Markdown 中的原始 HTML 转义为纯文本展示（不解析为真实 HTML）                              | `boolean`                                 | `false`         |
| debug                    | 是否开启仅开发环境使用的性能浮层                                                                 | `boolean`                                 | `false`         |

> 当前版本没有 `dompurifyConfig`、`rootClassName`、`prefixCls`、`children` 属性。原始 HTML 内部由 DOMPurify 净化；如果需要保留为文本展示，请使用 `escapeRawHtml`。

### MarkedConfig

```ts
interface MarkedConfig {
  breaks?: boolean;
  gfm?: boolean;
  extensions?: TokenizerAndRendererExtension[] | null;
}
```

### StreamingOption

| 字段                           | 说明                                                                                                                                                                                                                                                                                                                     | 类型                                                                   | 默认值          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------- |
| hasNextChunk                   | 是否还有后续内容块。最后一块设置为 `false`，缓存的未完成片段才会刷新为最终结果                                                                                                                                                                                                                                           | `boolean`                                                              | `false`         |
| incremental                    | 流式期间按标题切分文档，只有最后仍在增长的一段会随每个 chunk 重新解析、净化和渲染；前面的段直接复用。传对象可配置 `minSectionChars` 和 `keepSectionsOnEnd`。围栏代码、HTML 块、列表、引用块、缩进代码、原始块以及 `$$` / `\[` 公式内部会故意拒绝切分；出现链接引用定义或脚注定义、或自定义组件标签跨越切点时也会禁用切分 | `boolean \| { minSectionChars?: number; keepSectionsOnEnd?: boolean }` | `false`         |
| enableAnimation                | 是否为块级元素启用淡入动画                                                                                                                                                                                                                                                                                               | `boolean`                                                              | `true`          |
| animationConfig                | 动画配置                                                                                                                                                                                                                                                                                                                 | `AnimationConfig`                                                      | -               |
| tail                           | 是否启用尾部指示器（`true` 使用默认 `▋`，传对象可自定义）                                                                                                                                                                                                                                                                | `boolean \| TailConfig`                                                | `false`         |
| incompleteMarkdownComponentMap | 将未闭合 Markdown 片段映射到自定义 loading 组件。显式配置的映射优先于 `incompleteMarkdown: 'complete'`                                                                                                                                                                                                                   | `Partial<Record<Exclude<StreamCacheTokenType, 'text'>, string>>`       | `{}`            |
| incompleteMarkdown             | 尚未写完的语法如何显示：`placeholder` 扣住不显示，或显示映射的占位组件；`complete` 把写到一半的强调、行内代码、链接文字、列表项当作已写完的文本立即显示，图片、HTML、表格仍按 `placeholder` 处理                                                                                                                         | `'placeholder' \| 'complete'`                                          | `'placeholder'` |
| typewriter                     | 打字机效果：新到的内容按 chunk 到达节奏匀速放出，不整块出现。放出的永远是 `content` 的前缀；`hasNextChunk` 变为 `false` 时立即放完                                                                                                                                                                                       | `boolean \| TypewriterConfig`                                          | `false`         |

#### 布尔预设

`streaming={true}` 会展开为一个冻结的预设，等价于：

```ts
{
  hasNextChunk: true,
  incremental: true,
  incompleteMarkdown: "complete",
  typewriter: true,
  animationConfig: { splitBy: "sentence" },
}
```

`streaming={false}` 是同一预设、但 `hasNextChunk: false`，因此把应用自己的 `isStreaming` 直接传给 `streaming` 是 LLM 输出场景的推荐写法。

#### `incremental` 对象

| 属性              | 说明                                                                                                                                                  | 类型      | 默认值 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ |
| minSectionChars   | 短于该长度的段会并入下一段                                                                                                                            | `number`  | -      |
| keepSectionsOnEnd | 流结束时保留各段，已挂载的自定义组件不会重新挂载。设为 `false` 时流结束会回到整篇一次性渲染；使用带文档级状态的 marked 扩展（如标题 id 去重）时应关掉 | `boolean` | `true` |

### TypewriterConfig

| 属性             | 说明                                                                                                                                  | 类型                   | 默认值                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------- |
| unit             | 放出单位。`char` 逐字放出；`sentence` 攒到分隔符一起放出（围栏代码和行内代码里的分隔符不算，换行总是分隔符）                          | `'char' \| 'sentence'` | `'char'`                                  |
| delimiters       | 句子分隔符                                                                                                                            | `string[]`             | `['。', '！', '？', '.', '!', '?', '\n']` |
| minCps           | 最低放出速度（字/秒），实际速度会随 chunk 节奏自适应                                                                                  | `number`               | `24`                                      |
| maxCps           | 最高放出速度（字/秒）                                                                                                                 | `number`               | `3000`                                    |
| pauseMs          | `unit: 'char'` 时，放出一个分隔符后停顿的毫秒数                                                                                       | `number`               | `0`                                       |
| maxSentenceChars | `unit: 'sentence'` 时，自上一个分隔符起最多攒多少个字符；超过后退回逐字放出，直到下一个分隔符出现，避免长 URL、单行 JSON 长时间不显示 | `number`               | `120`                                     |

### AnimationConfig

| 属性             | 说明                                                                                                                                                   | 类型                    | 默认值                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ----------------------------------------- |
| fadeDuration     | 淡入持续时间（毫秒）                                                                                                                                   | `number`                | `200`                                     |
| easing           | CSS 缓动函数                                                                                                                                           | `string`                | `'ease-in-out'`                           |
| splitBy          | 淡入单位。`chunk` 每次新到的文本单独淡入；`sentence` 把新到的文本并入当前句子，到分隔符才开始下一个淡入单元。与 `typewriter` 同时使用时应选 `sentence` | `'chunk' \| 'sentence'` | `'chunk'`                                 |
| delimiters       | `splitBy` 为 `sentence` 时的句子分隔符                                                                                                                 | `string[]`              | `['。', '！', '？', '.', '!', '?', '\n']` |
| maxSentenceChars | `splitBy: 'sentence'` 时一个淡入单元最多容纳的字符数，超过后新到的文本另起一个单元                                                                     | `number`                | `120`                                     |

### TailConfig

| 属性      | 说明                               | 类型        | 默认值 |
| --------- | ---------------------------------- | ----------- | ------ |
| content   | 尾部显示的内容                     | `string`    | `'▋'`  |
| component | 自定义尾部组件，优先级高于 content | `Component` | -      |

### StreamCacheTokenType

`text | link | image | html | emphasis | list | table | inline-code`。

`incompleteMarkdownComponentMap` 接受除 `text` 以外的所有类型。

## 相关文档

- [组件扩展](EXTENSIONS.md)
- [流式渲染](STREAMING.md)
