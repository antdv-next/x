---
order: 1
title: Introduction
packageName: x-pro
---

`@antdv-next/x-pro` is a **community-driven** package of agent components, offering higher-level UI building blocks for AI conversation interfaces.

> **Unofficial community package**: not ported from, affiliated with, or synced to the Ant Design X upstream. Every component is original community work.

## Installation {#install}

```bash
pnpm add @antdv-next/x-pro
```

## Components {#components}

- [MessageScroller — streaming conversation viewport](/pro/message-scroller) with streaming follow, rail navigation and back-to-latest.

## Global Config {#global-config}

`XProProvider` provides package-level component defaults and locale. It forwards every `antdv-next` `ConfigProvider` capability and adds one config slot per component:

```vue
<script setup lang="ts">
import { enUS, XProProvider } from "@antdv-next/x-pro";
</script>

<template>
  <XProProvider
    :locale="enUS"
    :message-scroller="{
      followThreshold: 80,
      backToBottom: true,
    }"
  >
    <App />
  </XProProvider>
</template>
```

Component props take precedence over the global config from `XProProvider`; semantic `classes` / `styles` customizations are merged with it.
