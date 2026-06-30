---
group:
  title: 如何使用
  order: 0
order: 2
title: 在 Vite 中使用
---

[Vite](https://cn.vite.dev/) 是现代前端应用开发工具之一，本文会介绍如何在 Vite 创建的 Vue 工程中使用 `@antdv-next/x`。

## 安装和初始化

在开始之前，你可能需要安装 [yarn](https://github.com/yarnpkg/yarn/) 或者 [pnpm](https://pnpm.io/zh/) 或者 [bun](https://bun.sh/)。

<InstallDependencies npm='$ npm create vite antdv-next-x-demo -- --template vue-ts' yarn='$ yarn create vite antdv-next-x-demo --template vue-ts' pnpm='$ pnpm create vite antdv-next-x-demo --template vue-ts' bun='$ bun create vite antdv-next-x-demo --template vue-ts'></InstallDependencies>

工具会自动初始化一个 Vue 脚手架，如果在过程中出现网络问题，请尝试配置代理，或使用其他 npm registry。

然后进入项目，安装依赖并启动开发服务。

```bash
$ cd antdv-next-x-demo
$ npm install
$ npm run dev
```

此时使用浏览器访问终端输出的本地地址，看到 Vite + Vue 的默认页面就算成功了。

## 引入 @antdv-next/x

现在从 yarn 或 npm 或 pnpm 或 bun 安装并引入 `@antdv-next/x` 和底层组件库 `antdv-next`。

<InstallDependencies npm='$ npm install @antdv-next/x antdv-next --save' yarn='$ yarn add @antdv-next/x antdv-next' pnpm='$ pnpm install @antdv-next/x antdv-next --save' bun='$ bun add @antdv-next/x antdv-next'></InstallDependencies>

在 `src/main.ts` 中引入样式。

```ts
import { createApp } from "vue";
import App from "./App.vue";

import "antdv-next/dist/reset.css";

createApp(App).mount("#app");
```

修改 `src/App.vue`，引入 `@antdv-next/x` 的 `Bubble` 组件，并通过 `XProvider` 提供基础上下文。

```vue
<template>
  <XProvider>
    <Bubble content="Hello world!" />
  </XProvider>
</template>

<script setup lang="ts">
import { Bubble, XProvider } from "@antdv-next/x";
</script>
```

好了，现在你应该能看到页面上已经有了 `@antdv-next/x` 的气泡组件，接下来就可以继续选用其他组件开发应用了。其他开发流程你可以参考 Vite 的[官方文档](https://cn.vite.dev/)。

## 自定义主题

可以通过 `XProvider` 配置主题 Token。

```vue
<template>
  <XProvider :theme="{ token: { colorPrimary: '#00b96b' } }">
    <MyApp />
  </XProvider>
</template>

<script setup lang="ts">
import { XProvider } from "@antdv-next/x";
import MyApp from "./MyApp.vue";
</script>
```

我们现在已经把 `@antdv-next/x` 组件成功运行起来了，开始开发你的应用吧！
