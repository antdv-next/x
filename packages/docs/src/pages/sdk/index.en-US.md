---
title: SDK
description: Request and stream utilities for AI applications.
---

## Introduction

`@antdv-next/x-sdk` is built on top of `@ant-design/x-sdk` with a Vue-friendly wrapper layer. It keeps the upstream mental model while offering an integration style that fits Vue composition workflows, so you can wire AI chat data flows faster.

## Features

- **Unified request and stream handling**: `XRequest` and `XStream` cover SSE/chunked streaming scenarios out of the box.
- **Vue composition hooks**: `useXChat` and `useXConversations` help manage message streams and conversation lists inside Vue components.
- **Multi-model provider support**: Built-in `Default/OpenAI/DeepSeek` providers with custom provider extensibility.
- **Type-friendly exports**: Rich types for requests, streaming, and model payloads to improve safety.
- **Lightweight client wrapper**: `createXSdkClient` / `XSdkClient` for shared base request access.

## Installation

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
