---
title: SDK
description: 面向 AI 场景的请求与流处理工具集。
---

## 介绍

`@antdv-next/x-sdk` 基于 `@ant-design/x-sdk` 构建，并围绕 Vue 应用场景做了友好的封装。它在保留上游核心能力与使用心智的同时，提供更贴合 Vue 组合式开发的接入方式，帮助你更快完成 AI 对话应用的数据流集成。

## 特性

- **统一请求与流处理**：通过 `XRequest` 和 `XStream` 快速处理 SSE / chunked response 等流式场景。
- **Vue 组合式 Hooks**：提供 `useXChat`、`useXConversations`，用于在 Vue 组件中管理消息流与会话列表。
- **多模型 Provider 支持**：内置 `Default/OpenAI/DeepSeek` Provider，并支持自定义扩展。
- **类型友好**：导出完整的请求、流处理与模型相关类型，便于在业务中安全复用。
- **轻量客户端封装**：提供 `createXSdkClient` / `XSdkClient`，便于统一基础请求能力。

## 安装

```bash
npm install @antdv-next/x-sdk
```

```bash
yarn add @antdv-next/x-sdk
```

```bash
pnpm add @antdv-next/x-sdk
```

```bash
bun add @antdv-next/x-sdk
```
