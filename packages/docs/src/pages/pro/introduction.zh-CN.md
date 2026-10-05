---
order: 2
title: 介绍
packageName: x-pro
---

`@antdv-next/x-pro` 是一个**社区驱动**的 Agent 组件包，面向 AI 会话场景提供更高阶的界面组件。

> **非官方社区包**：本包不是 Ant Design X 上游的移植，也不随上游同步，所有组件均为社区原创。

## 安装 {#install}

```bash
pnpm add @antdv-next/x-pro
```

## 组件 {#components}

- [MessageScroller 会话流式滚动容器](/pro/message-scroller) — 流式跟随、消息导航导轨、回到最新。

## 全局配置 {#global-config}

`XProProvider` 提供包级的组件默认配置与语言环境，透传 `antdv-next` `ConfigProvider` 的全部能力，并额外接受每个组件的配置槽：

```vue
<script setup lang="ts">
import { XProProvider, zhCN } from "@antdv-next/x-pro";
</script>

<template>
  <XProProvider
    :locale="zhCN"
    :message-scroller="{
      followThreshold: 80,
      backToBottom: true,
    }"
  >
    <App />
  </XProProvider>
</template>
```

组件 props 优先于 `XProProvider` 中的全局配置；`classes` / `styles` 语义化定制会与全局配置合并。
