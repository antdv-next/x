---
order: 1
title: 介绍
---

`@antdv-next/x-markdown` 是一个面向 Vue 3 的流式友好 Markdown 渲染器，适合 LLM 对话、知识问答、文档预览等场景。

## ✨ 特性

- 🚀 轻量快速：基于 [`marked`](https://github.com/markedjs/marked) 实现 Markdown 解析
- 🤖 流式友好：支持增量内容渲染与不完整语法处理
- 🔐 安全默认：内置 DOMPurify 过滤，降低 XSS 风险
- 🎨 可扩展：可将任意标签映射为自定义 Vue 组件
- 🌗 主题能力：内置 light / dark 主题样式

## 兼容环境

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Opera |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| >= 92                                                                                                                                                                                                  | >= 90                                                                                                                                                                                                              | >= 92                                                                                                                                                                                                          | >= 15.4                                                                                                                                                                                                        | >= 78                                                                                                                                                                                                      |

## 安装

<InstallDependencies npm='npm install @antdv-next/x-markdown' yarn='yarn add @antdv-next/x-markdown' pnpm='pnpm install @antdv-next/x-markdown' bun='bun add @antdv-next/x-markdown'></InstallDependencies>
