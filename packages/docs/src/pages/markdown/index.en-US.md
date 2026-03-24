---
order: 1
title: Introduction
---

`@antdv-next/x-markdown` is a streaming-friendly, extensible, and high-performance Markdown renderer for Vue 3, designed for LLM chat, knowledge QA, and document preview scenarios.

## ✨ Features

- 🚀 Built on [`marked`](https://github.com/markedjs/marked) with lightweight and fast rendering
- 🤖 Native streaming support for incremental LLM output
- 🔐 DOMPurify sanitization enabled by default for XSS mitigation
- 🎨 Component mapping to replace any tag with custom Vue components
- 🔧 Syntax preprocessing and plugin-style extension workflow
- 🌗 Built-in light / dark themes

## Compatibility

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Opera |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| >= 92                                                                                                                                                                                                  | >= 90                                                                                                                                                                                                              | >= 92                                                                                                                                                                                                          | >= 15.4                                                                                                                                                                                                        | >= 78                                                                                                                                                                                                      |

## Supported Markdown Specifications

- [Markdown 1.0.0](https://daringfireball.net/projects/markdown/)
- [CommonMark](https://github.com/commonmark/commonmark-spec/wiki/Markdown-Flavors)
- [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/)

## Installation

<InstallDependencies npm='npm install @antdv-next/x-markdown' yarn='yarn add @antdv-next/x-markdown' pnpm='pnpm install @antdv-next/x-markdown' bun='bun add @antdv-next/x-markdown'></InstallDependencies>

## Quick Start

<demo src="./demo/quick-start.vue">Quick Start Demo</demo>
