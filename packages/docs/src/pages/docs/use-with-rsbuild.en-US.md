---
group:
  title: How to Use
  order: 0
order: 5
title: Use with Rsbuild
---

[Rsbuild](https://rsbuild.dev/) is a build tool powered by Rspack. This guide shows how to use `@antdv-next/x` in a Vue project created with Rsbuild.

## Installation and Initialization

Before you start, you might need to install [yarn](https://github.com/yarnpkg/yarn/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/).

<InstallDependencies npm='$ npm create rsbuild antdv-next-x-demo' yarn='$ yarn create rsbuild antdv-next-x-demo' pnpm='$ pnpm create rsbuild antdv-next-x-demo' bun='$ bun create rsbuild antdv-next-x-demo'></InstallDependencies>

During initialization, `create-rsbuild` provides several templates. Choose the Vue template here.

The tool will automatically initialize a Vue scaffold. If you encounter network issues during the process, try configuring a proxy or using another npm registry.

Next, navigate to the project directory, install dependencies, and start the development server.

```bash
$ cd antdv-next-x-demo
$ npm install
$ npm run dev
```

Open the local URL printed in the terminal. If you see the default Rsbuild + Vue page, the setup is ready.

## Importing @antdv-next/x

Now install `@antdv-next/x` and the underlying component library `antdv-next` using yarn, npm, pnpm, or bun.

<InstallDependencies npm='$ npm install @antdv-next/x antdv-next --save' yarn='$ yarn add @antdv-next/x antdv-next' pnpm='$ pnpm install @antdv-next/x antdv-next --save' bun='$ bun add @antdv-next/x antdv-next'></InstallDependencies>

Import styles in `src/main.ts`.

```ts
import { createApp } from "vue";
import App from "./App.vue";

import "antdv-next/dist/reset.css";

createApp(App).mount("#app");
```

Update `src/App.vue` to import the `Bubble` component from `@antdv-next/x`, and wrap it with `XProvider` for the base context.

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

You should now see the `@antdv-next/x` bubble component on the page. You can continue building your application with other components. For the rest of the development workflow, refer to the [Rsbuild documentation](https://rsbuild.dev/).

## On-demand Auto Import

If you prefer components to be imported on demand without manual `import` statements, use [`@antdv-next/auto-import-resolver-x`](https://github.com/antdv-next/auto-import-resolver-x) together with [`unplugin-vue-components`](https://github.com/unplugin/unplugin-vue-components).

Install the dependencies:

<InstallDependencies npm='$ npm install @antdv-next/auto-import-resolver-x unplugin-vue-components -D' yarn='$ yarn add @antdv-next/auto-import-resolver-x unplugin-vue-components -D' pnpm='$ pnpm install @antdv-next/auto-import-resolver-x unplugin-vue-components -D' bun='$ bun add @antdv-next/auto-import-resolver-x unplugin-vue-components -D'></InstallDependencies>

Configure the resolver through `tools.rspack` in `rsbuild.config.ts`:

```ts
// rsbuild.config.ts
import { defineConfig } from "@rsbuild/core";
import Components from "unplugin-vue-components/rspack";
import { AntdvNextXResolver } from "@antdv-next/auto-import-resolver-x";

export default defineConfig({
  tools: {
    rspack: {
      plugins: [
        Components({
          resolvers: [AntdvNextXResolver()],
        }),
      ],
    },
  },
});
```

Now you can use `Ax`-prefixed components directly in templates without importing them. `src/App.vue` can be simplified to:

```vue
<template>
  <AxProvider>
    <AxBubble content="Hello world!" />
  </AxProvider>
</template>
```

> Note: With auto import, use the `Ax`-prefixed global names in templates (e.g. `AxBubble`, `AxProvider`). The resolver maps them to the corresponding exports of `@antdv-next/x` (`Bubble`, `XProvider`).

Since `@antdv-next/x` is built on top of `antdv-next`, you can register both resolvers together if you also use `antdv-next` components and `@antdv-next/icons` icons:

```ts
import { AntdvNextResolver } from "@antdv-next/auto-import-resolver";
import { AntdvNextXResolver } from "@antdv-next/auto-import-resolver-x";
import Components from "unplugin-vue-components/rspack";
import { defineConfig } from "@rsbuild/core";

export default defineConfig({
  tools: {
    rspack: {
      plugins: [
        Components({
          resolvers: [
            AntdvNextResolver({ resolveIcons: true }),
            AntdvNextXResolver(),
          ],
        }),
      ],
    },
  },
});
```

For more options (such as `exclude` to skip certain components), see the [auto-import-resolver-x documentation](https://github.com/antdv-next/auto-import-resolver-x#options).

## Custom Theme

Configure theme tokens through `XProvider`.

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

You have successfully run `@antdv-next/x` with Rsbuild. Start building your application!
