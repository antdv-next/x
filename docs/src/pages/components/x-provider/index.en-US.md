---
title: XProvider
description: Provide a uniform configuration support for x components.
---

## Use

The `XProvider` extends the `ConfigProvider` from `antdv-next` and provides global configuration for components in `@antdv-next/x`.

If you are already using `ConfigProvider` from `antdv-next`, please make the following changes to your code:

```diff
- import { ConfigProvider } from 'antdv-next';
+ import { XProvider } from '@antdv-next/x';

  const App = () => (
-   <ConfigProvider>
+   <XProvider>
      <YourApp />
-   </ConfigProvider>
+   </XProvider>
  );
```

## Examples

<demo src="./demo/locale.vue">Locale</demo>
<demo src="./demo/direction.vue">Direction</demo>
<demo src="./demo/theme.vue">Theme</demo>
<demo src="./demo/shortcut-keys.vue">Shortcut Key</demo>

### Locale

If your project uses `antdv-next`, you can pass locale into XProvider.

```ts
import { XProvider } from '@antdv-next/x'
import zhCN from 'antdv-next/dist/locale/zh_CN'

<XProvider locale={zhCN}>
  <App />
</XProvider>
```

## API

`XProvider` fully extends `antdv-next`'s `ConfigProvider`.

### Component Config

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `bubble` | Global configuration for Bubble | `{ style?: CSSProperties; styles?: Record<string, CSSProperties>; className?: string; classes?: Record<string, string> }` | - |
| `conversations` | Global configuration for Conversations | `{ style?: CSSProperties; styles?: Record<string, CSSProperties>; className?: string; classes?: Record<string, string>; shortcutKeys?: { creation?: ShortcutKeys<number>; items?: ShortcutKeys<'number'> \| ShortcutKeys<number>[] } }` | - |
| `actions` | Global configuration for Actions | `{ style?: CSSProperties; styles?: Record<string, CSSProperties>; className?: string; classes?: Record<string, string> }` | - |

#### ShortcutKeys

```ts
type SignKeysType = {
  Ctrl: keyof KeyboardEvent
  Alt: keyof KeyboardEvent
  Meta: keyof KeyboardEvent
  Shift: keyof KeyboardEvent
}

type ShortcutKeys<CustomKey = number | 'number'> =
  | [keyof SignKeysType, keyof SignKeysType, CustomKey]
  | [keyof SignKeysType, CustomKey]
```
