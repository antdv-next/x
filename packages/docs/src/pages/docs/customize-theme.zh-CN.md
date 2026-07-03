---
group:
  title: 设计
  order: 0.5
order: 1
title: 定制主题
---

@antdv-next/x 建立在 antdv-next 的 CSS-in-JS 主题体系之上，支持灵活的样式定制，以满足业务和品牌上多样化的视觉需求，包括但不限于全局样式（主色、圆角、边框）和指定组件的视觉定制。

有了 CSS-in-JS 的加持后，动态主题的能力得到了加强，包括但不限于：

1. 支持动态切换主题；
2. 支持同时存在多个主题；
3. 支持针对某个/某些组件修改主题变量；
4. ...

## 配置主题

我们把影响主题的最小元素称为 **Design Token**。通过修改 Design Token，我们可以呈现出各种各样的主题或者组件。通过在 `XProvider`（或 `a-config-provider`）中传入 `theme` 属性，可以配置主题。

:::warning
`ConfigProvider` 对 `message.xxx`、`Modal.xxx`、`notification.xxx` 等静态方法不会生效，原因是在这些方法中，antdv-next 会通过 `render` 动态创建新的 Vue 实体。其 context 与当前代码所在 context 并不相同，因而无法获取 context 信息。
:::

### 修改主题变量

通过 `theme` 中的 `token` 属性，可以修改一些主题变量。部分主题变量会引起其他主题变量的变化，我们把这些主题变量称为 Seed Token。

```vue
<template>
  <XProvider
    :theme="{
      token: {
        colorPrimary: '#00b96b',
        borderRadius: 2,
        colorBgContainer: '#f6ffed',
      },
    }"
  >
    <a-space>
      <a-button type="primary">Primary</a-button>
      <a-button>Default</a-button>
    </a-space>
  </XProvider>
</template>

<script setup lang="ts">
import { XProvider } from "@antdv-next/x";
</script>
```

### 使用预设算法

通过修改算法可以快速生成风格迥异的主题，我们默认提供三套预设算法，分别是：

- 默认算法 `theme.defaultAlgorithm`
- 暗色算法 `theme.darkAlgorithm`
- 紧凑算法 `theme.compactAlgorithm`

你可以通过 `theme` 中的 `algorithm` 属性来切换算法，并且支持配置多种算法，将会依次生效。

```vue
<template>
  <XProvider
    :theme="{
      algorithm: theme.darkAlgorithm,
      // 或者组合算法：
      // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    }"
  >
    <a-space>
      <a-input placeholder="Please Input" />
      <a-button type="primary">Submit</a-button>
    </a-space>
  </XProvider>
</template>

<script setup lang="ts">
import { XProvider } from "@antdv-next/x";
import { theme } from "antdv-next";
</script>
```

### 修改组件变量 {#customize-component-token}

除了整体的 Design Token，各个组件也会开放自己的 Component Token 来实现针对组件的样式定制能力，不同的组件之间不会相互影响。同样地，也可以通过这种方式来覆盖组件的其他 Design Token。

:::info 组件级别的主题算法
默认情况下，所有组件变量都仅仅是覆盖，不会基于 Seed Token 计算派生变量。组件变量支持传入 `algorithm` 属性，可以开启派生计算或者传入其他算法。
:::

```vue
<template>
  <XProvider
    :theme="{
      components: {
        Button: {
          colorPrimary: '#00b96b',
          algorithm: true,
        },
        Input: {
          colorPrimary: '#eb2f96',
          algorithm: true,
        },
      },
    }"
  >
    <a-space>
      <a-input placeholder="Please Input" />
      <a-button type="primary">Submit</a-button>
    </a-space>
  </XProvider>
</template>

<script setup lang="ts">
import { XProvider } from "@antdv-next/x";
</script>
```

:::info 组件 Token 列表
各组件可定制的 Component Token 请参考对应组件文档页底部的「组件 Token」表格。
:::

### 动态切换

动态切换主题对用户来说是非常简单的，你可以在任何时候通过 `theme` 属性来动态切换主题，而不需要任何额外配置。

```vue
<template>
  <a-color-picker show-text v-model:value="primary" />
  <a-divider />
  <XProvider
    :theme="{
      token: {
        colorPrimary:
          typeof primary === 'string' ? primary : primary?.toHexString(),
      },
    }"
  >
    <a-space>
      <a-input placeholder="Please Input" />
      <a-button type="primary">Submit</a-button>
    </a-space>
  </XProvider>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { XProvider } from "@antdv-next/x";

const primary = ref("#1677ff");
</script>
```

### 局部主题（嵌套主题）

可以嵌套使用 `XProvider` 来实现局部主题的更换。在子主题中未被改变的 Design Token 将会继承父主题。

```vue
<template>
  <XProvider :theme="{ token: { colorPrimary: '#1677ff' } }">
    <a-space>
      <a-button type="primary">Theme 1</a-button>
      <XProvider :theme="{ token: { colorPrimary: '#00b96b' } }">
        <a-button type="primary">Theme 2</a-button>
      </XProvider>
    </a-space>
  </XProvider>
</template>

<script setup lang="ts">
import { XProvider } from "@antdv-next/x";
</script>
```

### 使用 Design Token

如果你希望使用当前主题下的 Design Token，我们提供了 `useToken` 这个 hook 来获取 Design Token。

```vue
<template>
  <div
    :style="{
      backgroundColor: token.colorPrimaryBg,
      padding: token.padding + 'px',
      borderRadius: token.borderRadius + 'px',
      color: token.colorPrimaryText,
      fontSize: token.fontSize + 'px',
    }"
  >
    使用 Design Token
  </div>
</template>

<script setup lang="ts">
import { theme } from "antdv-next";

const { useToken } = theme;
const { token } = useToken();
</script>
```

## 基本概念

在 Design Token 中我们提供了一套更加贴合设计的三层结构，将 Design Token 拆解为 Seed Token、Map Token 和 Alias Token 三部分。这三组 Token 并不是简单的分组，而是一个三层的派生关系，由 Seed Token 派生 Map Token，再由 Map Token 派生 Alias Token。在大部分情况下，使用 Seed Token 就可以满足定制主题的需要。

### 基础变量（Seed Token）

Seed Token 意味着所有设计意图的起源。比如我们可以通过改变 `colorPrimary` 来改变主题色，antd 内部的算法会自动的根据 Seed Token 计算出对应的一系列颜色并应用：

```ts
const theme = {
  token: {
    colorPrimary: "#1890ff",
  },
};
```

### 梯度变量（Map Token）

Map Token 是基于 Seed 派生的梯度变量。定制 Map Token 推荐通过 `theme.algorithm` 来实现，这样可以保证 Map Token 之间的梯度关系。也可以通过 `theme.token` 覆盖，用于单独修改一些 map token 的值。

```ts
const theme = {
  token: {
    colorPrimaryBg: "#e6f7ff",
  },
};
```

### 别名变量（Alias Token）

Alias Token 用于批量控制某些共性组件的样式，基本上是 Map Token 别名，或者特殊处理过的 Map Token。

```ts
const theme = {
  token: {
    colorLink: "#1890ff",
  },
};
```

### 基本算法（algorithm）

基本算法用于将 Seed Token 展开为 Map Token，比如由一个基本色算出一个梯度色板，或者由一个基本的圆角算出各种大小的圆角。算法可以单独使用，也可以任意地组合使用，比如可以将暗色算法和紧凑算法组合使用，得到一个暗色和紧凑相结合的主题。

```ts
import { theme } from "antdv-next";

const { darkAlgorithm, compactAlgorithm } = theme;

const theme = {
  algorithm: [darkAlgorithm, compactAlgorithm],
};
```

## API

### Theme

| 属性       | 说明                                                                | 类型                                                                     | 默认值             |
| ---------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------ |
| token      | 用于修改 Design Token                                               | `AliasToken`                                                             | -                  |
| inherit    | 继承上层 ConfigProvider 中配置的主题。                              | boolean                                                                  | true               |
| algorithm  | 用于修改 Seed Token 到 Map Token 的算法                             | `(token: SeedToken) => MapToken` \| `((token: SeedToken) => MapToken)[]` | `defaultAlgorithm` |
| components | 用于修改各个组件的 Component Token 以及覆盖该组件消费的 Alias Token | `ComponentsConfig`                                                       | -                  |
| cssVar     | CSS 变量配置                                                        | [cssVar](#css-var)                                                       | -                  |
| hashed     | 将样式添加至 hash className 上                                      | boolean                                                                  | true               |

### SeedToken

<TokenTable type="seed"></TokenTable>

### MapToken

> 继承所有 SeedToken 的属性

<TokenTable type="map"></TokenTable>

### AliasToken

> 继承所有 SeedToken 和 MapToken 的属性

<TokenTable type="alias"></TokenTable>
