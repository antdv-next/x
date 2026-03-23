---
order: 1
title: 介绍
---

`@antdv-next/x-markdown` 是一个面向 Vue 3 的流式友好、可扩展、高性能 Markdown 渲染器，适用于 LLM 对话、知识问答、文档预览等场景。

## ✨ 特性

- 🚀 基于 [`marked`](https://github.com/markedjs/marked)，渲染轻量高效
- 🤖 原生支持流式渲染，适配大模型逐段输出
- 🔐 默认内置 DOMPurify 清洗，降低 XSS 风险
- 🎨 支持组件映射，可将任意标签替换为自定义 Vue 组件
- 🔧 支持语法预处理与插件化扩展
- 🌗 内置 light / dark 主题样式

## 兼容环境

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Opera |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| >= 92                                                                                                                                                                                                  | >= 90                                                                                                                                                                                                              | >= 92                                                                                                                                                                                                          | >= 15.4                                                                                                                                                                                                        | >= 78                                                                                                                                                                                                      |

## 支持的 Markdown 规范

- [Markdown 1.0.0](https://daringfireball.net/projects/markdown/)
- [CommonMark](https://github.com/commonmark/commonmark-spec/wiki/Markdown-Flavors)
- [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/)

## 安装

<InstallDependencies npm='npm install @antdv-next/x-markdown' yarn='yarn add @antdv-next/x-markdown' pnpm='pnpm install @antdv-next/x-markdown' bun='bun add @antdv-next/x-markdown'></InstallDependencies>

## 快速开始

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `# Hello XMarkdown\n\n这是一个流式友好的 Markdown 渲染器。`;
</script>

<template>
  <XMarkdown :content="content" />
</template>
```

## 继续阅读

- [代码示例](/markdown/examples)
- [流式渲染](/markdown/streaming)
- [组件扩展](/markdown/components)
- [插件集](/markdown/plugins)
- [主题](/markdown/themes)
