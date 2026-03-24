---
title: 代码示例
order: 2
---

## 何时使用

用于快速接入 LLM 的 Markdown 输出渲染，并逐步扩展到流式、组件化和语法增强场景。

## 代码演示

<!-- prettier-ignore -->
<demo src="./demo/basic.vue">基础渲染</demo>
<demo src="./streaming/demo/combined.vue">流式渲染</demo>
<demo src="./demo/code-highlighter.vue">组件扩展</demo>
<demo src="./demo/custom-plugin.vue">插件扩展</demo>
<demo src="./demo/escape-raw-html.vue">安全与链接</demo>

## API

| 属性                     | 说明                                 | 类型                        | 默认值          |
| ------------------------ | ------------------------------------ | --------------------------- | --------------- |
| content                  | 需要渲染的 Markdown 内容             | `string`                    | `''`            |
| components               | 将 HTML 节点映射为自定义 Vue 组件    | `Record<string, Component>` | `{}`            |
| streaming                | 流式渲染行为配置                     | `StreamingOption`           | -               |
| config                   | Marked 解析配置                      | `MarkedConfig`              | `{ gfm: true }` |
| className                | 根容器的额外 CSS 类名                | `string`                    | -               |
| style                    | 根容器的内联样式                     | `Record<string, string>`    | -               |
| paragraphTag             | 段落使用的 HTML 标签                 | `string`                    | `'p'`           |
| openLinksInNewTab        | 是否为所有链接添加 `target="_blank"` | `boolean`                   | `true`          |
| protectCustomTagNewlines | 是否保留自定义标签内部的换行         | `boolean`                   | `true`          |
| escapeRawHtml            | 是否将原始 HTML 转义为纯文本         | `boolean`                   | `false`         |
| debug                    | 是否开启调试模式                     | `boolean`                   | `false`         |

### StreamingOption

| 字段                           | 说明                            | 类型                                                             | 默认值  |
| ------------------------------ | ------------------------------- | ---------------------------------------------------------------- | ------- |
| hasNextChunk                   | 是否还有后续内容块              | `boolean`                                                        | `false` |
| enableAnimation                | 是否启用淡入动画                | `boolean`                                                        | `true`  |
| animationConfig                | 动画配置                        | `AnimationConfig`                                                | -       |
| tail                           | 是否启用尾部指示器              | `boolean \| TailConfig`                                          | `false` |
| incompleteMarkdownComponentMap | 将未闭合片段映射到 loading 组件 | `Partial<Record<Exclude<StreamCacheTokenType, 'text'>, string>>` | -       |

### TailConfig

| 属性      | 说明                               | 类型        | 默认值 |
| --------- | ---------------------------------- | ----------- | ------ |
| content   | 尾部显示的内容                     | `string`    | `'▋'`  |
| component | 自定义尾部组件，优先级高于 content | `Component` | -      |

### AnimationConfig

| 属性         | 说明             | 类型     | 默认值          |
| ------------ | ---------------- | -------- | --------------- |
| fadeDuration | 动画时长（毫秒） | `number` | `200`           |
| easing       | 缓动函数         | `string` | `'ease-in-out'` |
