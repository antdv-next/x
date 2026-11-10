# 核心指南

## 包职责边界

| 需求                          | 对应包                   |
| ----------------------------- | ------------------------ |
| 把消息内容渲染成 Markdown     | `@antdv-next/x-markdown` |
| 构建聊天 UI 容器              | `@antdv-next/x`          |
| 管理 Provider、请求与消息状态 | `@antdv-next/x-sdk`      |

## 安装与最小渲染

```bash
npm install @antdv-next/x-markdown
```

```vue
<script setup>
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/light.css";
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `
# Hello

- item 1
- item 2
`;
</script>

<template>
  <XMarkdown :content="content" class="x-markdown-light" />
</template>
```

`themes/index.css` 提供默认标签样式；`themes/light.css` 或 `themes/dark.css` 提供主题变量。需要内置排版时两个都要引入。

## 安全默认值

- 使用 `content`，没有 `children` 属性。
- 先让纯 Markdown 渲染正确，再加插件或自定义组件。
- `openLinksInNewTab` 默认就是 `true`。
- `protectCustomTagNewlines` 默认就是 `true`；只有自定义标签解析确实依赖空行时才关闭。
- 原始 HTML 内部由 DOMPurify 净化，没有 `dompurifyConfig` 属性。如果希望原始 HTML 只作为文本展示，使用 `escapeRawHtml`。
- 流式内容优先使用布尔预设：`:streaming="isStreaming"`。

## 常见集成模式

### 基础内容块

```vue
<XMarkdown :content="message" class="x-markdown-light" />
```

### 聊天消息渲染

在 `useXChat` 产出消息列表之后，再用 `XMarkdown` 负责内容展示。

```vue
<XMarkdown
  :content="message.message.content"
  :open-links-in-new-tab="true"
  escape-raw-html
/>
```

### 最小检查清单

- 先确认内容本身真的是 Markdown，而不是结构化组件协议。
- 不要把渲染逻辑塞进 Provider。
- 不要把请求逻辑塞进 `XMarkdown`。
- 主题和自定义组件放在基础渲染稳定之后再加。

## 何时继续阅读其他参考

- 内容是流式分块到达时，阅读 [STREAMING.md](STREAMING.md)
- 需要自定义标签、代码块、插件、主题时，阅读 [EXTENSIONS.md](EXTENSIONS.md)
- 需要完整属性表和默认值时，阅读 `API.md`
