---
group:
  title: Design
  order: 0.5
order: 1
title: Customize Theme
---

@antdv-next/x is built on top of antdv-next's CSS-in-JS theming system, which supports flexible style customization to meet diverse visual needs across businesses and brands, including but not limited to global styles (primary color, border radius, borders) and component-level visual customization.

With CSS-in-JS, dynamic theming capabilities are enhanced, including but not limited to:

1. Dynamic theme switching;
2. Multiple themes coexisting;
3. Modifying theme variables for specific components;
4. ...

## Configure Theme

We call the smallest element that affects the theme a **Design Token**. By modifying Design Tokens, we can present various themes or components. You can configure the theme by passing the `theme` prop to `XProvider` (or `a-config-provider`).

:::warning
`ConfigProvider` does not work with static methods like `message.xxx`, `Modal.xxx`, `notification.xxx`, because antdv-next dynamically creates new Vue instances via `render` in these methods. Their context is different from the current code context, so they cannot obtain context information.
:::

### Modify Theme Variables

Through the `token` property in `theme`, you can modify some theme variables. Some theme variables will cause other theme variables to change; we call these Seed Tokens.

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

### Use Preset Algorithms

By modifying the algorithm, you can quickly generate themes with very different styles. We provide three preset algorithms by default:

- Default algorithm `theme.defaultAlgorithm`
- Dark algorithm `theme.darkAlgorithm`
- Compact algorithm `theme.compactAlgorithm`

You can switch algorithms through the `algorithm` property in `theme`, and multiple algorithms can be configured to take effect in sequence.

```vue
<template>
  <XProvider
    :theme="{
      algorithm: theme.darkAlgorithm,
      // or combined algorithms:
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

### Customize Component Token {#customize-component-token}

In addition to the overall Design Token, each component also exposes its own Component Token to enable component-specific style customization, and different components do not affect each other. Similarly, you can also override other Design Tokens consumed by the component in this way.

:::info Component-level Theme Algorithm
By default, all component variables are only overrides and do not derive variables based on Seed Tokens. Component variables support the `algorithm` property to enable derived calculation or pass in other algorithms.
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

:::info Component Token List
For the Component Tokens that each component can customize, please refer to the "Component Token" table at the bottom of the corresponding component documentation page.
:::

### Dynamic Switching

Dynamic theme switching is very simple for users. You can dynamically switch themes at any time through the `theme` property without any additional configuration.

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

### Local Theme (Nested Theme)

You can nest `XProvider` to achieve local theme changes. Design Tokens that are not changed in the sub-theme will inherit from the parent theme.

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

### Use Design Token

If you want to use the Design Token under the current theme, we provide the `useToken` hook to get the Design Token.

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
    Use Design Token
  </div>
</template>

<script setup lang="ts">
import { theme } from "antdv-next";

const { useToken } = theme;
const { token } = useToken();
</script>
```

## Basic Concepts

In Design Token, we provide a three-layer structure that is more suitable for design, splitting Design Token into Seed Token, Map Token, and Alias Token. These three groups of Tokens are not simply groupings, but a three-layer derivation relationship: Seed Token derives Map Token, and Map Token derives Alias Token. In most cases, using Seed Token can meet the need for theme customization.

### Seed Token

Seed Token means the origin of all design intentions. For example, we can change the theme color by changing `colorPrimary`, and antd's internal algorithm will automatically calculate the corresponding series of colors based on the Seed Token and apply them:

```ts
const theme = {
  token: {
    colorPrimary: "#1890ff",
  },
};
```

### Map Token

Map Token is a gradient variable derived based on Seed. Customizing Map Token is recommended to be implemented through `theme.algorithm`, which can ensure the gradient relationship between Map Tokens. You can also override through `theme.token` to individually modify the value of some map tokens.

```ts
const theme = {
  token: {
    colorPrimaryBg: "#e6f7ff",
  },
};
```

### Alias Token

Alias Token is used to batch-control the styles of some common components, basically aliases of Map Token, or specially processed Map Token.

```ts
const theme = {
  token: {
    colorLink: "#1890ff",
  },
};
```

### Algorithm

The algorithm is used to expand Seed Token into Map Token, for example, calculating a gradient color palette from a base color, or calculating various border radii from a base radius. The algorithm can be used alone or combined arbitrarily, for example, combining the dark algorithm and the compact algorithm to obtain a theme that is both dark and compact.

```ts
import { theme } from "antdv-next";

const { darkAlgorithm, compactAlgorithm } = theme;

const theme = {
  algorithm: [darkAlgorithm, compactAlgorithm],
};
```

## API

### Theme

| Property   | Description                                                                                     | Type                                                                     | Default            |
| ---------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------ |
| token      | Modify Design Token                                                                             | `AliasToken`                                                             | -                  |
| inherit    | Inherit the theme configured in the parent ConfigProvider.                                      | boolean                                                                  | true               |
| algorithm  | Algorithm for converting Seed Token to Map Token                                                | `(token: SeedToken) => MapToken` \| `((token: SeedToken) => MapToken)[]` | `defaultAlgorithm` |
| components | Modify each component's Component Token and override the Alias Token consumed by that component | `ComponentsConfig`                                                       | -                  |
| cssVar     | CSS variable configuration                                                                      | [cssVar](#css-var)                                                       | -                  |
| hashed     | Add styles to hash className                                                                    | boolean                                                                  | true               |

### SeedToken

<TokenTable type="seed"></TokenTable>

### MapToken

> Inherits all SeedToken properties

<TokenTable type="map"></TokenTable>

### AliasToken

> Inherits all SeedToken and MapToken properties

<TokenTable type="alias"></TokenTable>
