---
group:
  title: AI
  order: 1
order: 1
title: LLMs.txt
tag: New
---

本指南介绍如何在 Cursor、Windsurf、Claude Code、Gemini CLI 等 AI 工具中接入 Antdv Next X 的 `LLMs.txt` 文档，让模型更准确地理解组件、Markdown 渲染能力、SDK 能力以及推荐用法。

## 什么是 LLMs.txt？

[LLMs.txt](https://llmstxt.org/) 是一种面向大语言模型的文档入口格式。它可以把站点文档整理成更适合模型消费的结构化索引，帮助 AI 更快找到正确页面，而不是盲目抓取整个站点。

对于 Antdv Next X 来说，这样做通常会带来几个直接收益：

- 降低 AI 生成不存在 API 或错误属性名的概率
- 提高组件示例、Markdown 渲染示例和 SDK 用法示例的准确度
- 让 AI 在解释项目代码、补全文档或生成页面时更贴近官方能力边界

## 可用资源

Antdv Next X 当前提供了以下 LLM 文档入口：

- [llms.txt](https://x.antdv-next.com/llms.txt)：文档总索引，适合优先接入
- [llms-full.txt](https://x.antdv-next.com/llms-full.txt)：英文完整聚合文档，适合更长上下文
- [llms-full-cn.txt](https://x.antdv-next.com/llms-full-cn.txt)：中文完整聚合文档，适合中文问答与生成
- [llms-semantic.md](https://x.antdv-next.com/llms-semantic.md)：英文语义化文档版本
- [llms-semantic-cn.md](https://x.antdv-next.com/llms-semantic-cn.md)：中文语义化文档版本

通常建议先使用 `llms.txt`。如果你的 AI 工具支持更长上下文，或者你希望它获得更完整的语义信息，再切换到 `llms-full-*` 或 `llms-semantic*`。

## 适合哪些场景

你可以在这些研发场景中使用 Antdv Next X 的 `LLMs.txt`：

- 生成基于 `@antdv-next/x` 的聊天界面、消息气泡、欢迎区和发送器
- 生成基于 `@antdv-next/x-markdown` 的流式 Markdown 渲染页面
- 生成基于 `@antdv-next/x-sdk` 的请求管理、对话状态和流式交互代码
- 让 AI 辅助检查某个组件、插件或 SDK Hook 的推荐用法
- 在团队内部给 AI 提供统一的产品级上下文，减少回答风格和实现方式漂移

## 在 AI 工具中怎么用

### Cursor

在 Cursor 中，可以通过 `@Docs` 接入 `LLMs.txt`。接入后，Cursor 在补全和生成 Antdv Next X 相关代码时，会更容易引用正确的文档上下文。

[查看 Cursor @Docs 文档](https://docs.cursor.com/zh/context/@-symbols/@-docs)

### Windsurf

在 Windsurf 中，可以通过 `@` 引用外部文档，或者把 `LLMs.txt` 加入规则与记忆配置，让模型在生成 UI 或 SDK 代码时优先参考 Antdv Next X 文档。

[查看 Windsurf Memories 文档](https://docs.windsurf.com/windsurf/cascade/memories)

### Claude Code

在 Claude Code 中，可以把 `LLMs.txt` 或 `llms-full-cn.txt` 添加到 Docs / Context Files。这样在解释代码、重构页面或生成组件示例时，Claude Code 会更稳定地参考官方文档内容。

[查看 Claude Code Docs 配置文档](https://code.claude.com/docs)

### Gemini CLI

在 Gemini CLI 中，可以通过 `--context` 参数或配置文件指定 `LLMs.txt` 路径，让模型在回答与生成代码时参考 Antdv Next X 文档。

[查看 Gemini CLI 文档](https://ai.google.dev/gemini-api/docs?hl=zh-cn)

### 其他支持外部文档的 AI 工具

只要工具支持：

- 外部文档源
- 项目级知识库
- 上下文文件
- URL 形式的文档引用

通常都可以直接接入上述地址。

## 推荐使用方式

如果你主要使用中文，可以优先接入：

```text
https://x.antdv-next.com/llms.txt
https://x.antdv-next.com/llms-full-cn.txt
```

如果你希望 AI 先获得轻量索引，再按需深入，推荐顺序是：

1. 先接入 `llms.txt`
2. 需要更完整文档时，再补充 `llms-full-cn.txt`
3. 如果工具对 Markdown 语义结构支持更好，再尝试 `llms-semantic-cn.md`

## 使用建议

- 如果 AI 生成了不存在的 Props、事件或插槽，优先重新附带 `LLMs.txt` 上下文再试一次
- 如果你在做 SDK 相关开发，建议同时给 AI 提供具体页面需求和 `LLMs.txt`
- 如果你在做组件演示或文档示例生成，建议同时说明你要使用的是 `components`、`markdown` 还是 `sdk` 模块
- 如果你有自己的业务规范，可以把业务规范和 `LLMs.txt` 一起提供给 AI，效果通常更稳定

## 一个简单示例

例如你可以直接在 AI 工具里这样描述需求：

```text
请参考 https://x.antdv-next.com/llms.txt ，使用 Antdv Next X 生成一个带欢迎语、消息列表、输入框和流式 Markdown 回复的聊天页面。
```

如果需要更强的中文上下文，也可以补充：

```text
同时参考 https://x.antdv-next.com/llms-full-cn.txt
```

这样通常能让 AI 更准确地理解 Antdv Next X 的组件能力和推荐组合方式。
