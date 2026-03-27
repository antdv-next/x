---
title: XProvider
subtitle: 全局化配置
description: 为组件提供统一的全局化配置。
---

## 使用说明

`XProvider` 继承了 `antdv-next` 的 `ConfigProvider`，且为 `@antdv-next/x` 中的组件提供全局化配置。

如果您已经使用 `antdv-next` 的 `ConfigProvider`，请对您的代码做如下变更：

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

## 代码演示

<demo src="./demo/locale.vue">国际化</demo>
<demo src="./demo/direction.vue">方向</demo>
<demo src="./demo/theme.vue">主题</demo>
<demo src="./demo/shortcut-keys.vue">快捷键</demo>

### 国际化

如果您的项目使用了 `antdv-next`，可以将 locale 传入 XProvider。

```ts
import { XProvider } from '@antdv-next/x'
import zhCN from 'antdv-next/dist/locale/zh_CN'

<XProvider locale={zhCN}>
  <App />
</XProvider>
```

## API

`XProvider` 完全继承 `antdv-next` 的 `ConfigProvider`。

### 组件配置

| 属性            | 说明                   | 类型                                                                                                                                                                                                                                    | 默认值 |
| --------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `bubble`        | 气泡组件的全局配置     | `{ style?: CSSProperties; styles?: Record<string, CSSProperties>; className?: string; classes?: Record<string, string> }`                                                                                                               | -      |
| `conversations` | 会话组件的全局配置     | `{ style?: CSSProperties; styles?: Record<string, CSSProperties>; className?: string; classes?: Record<string, string>; shortcutKeys?: { creation?: ShortcutKeys<number>; items?: ShortcutKeys<'number'> \| ShortcutKeys<number>[] } }` | -      |
| `actions`       | 操作列表组件的全局配置 | `{ style?: CSSProperties; styles?: Record<string, CSSProperties>; className?: string; classes?: Record<string, string> }`                                                                                                               | -      |
| `fileCard`      | 文件卡片组件的全局配置 | `{ style?: CSSProperties; styles?: Record<string, CSSProperties>; className?: string; classes?: Record<string, string> }`                                                                                                               | -      |
| `suggestion`    | 快捷指令组件的全局配置 | `{ style?: CSSProperties; styles?: Record<string, CSSProperties>; classes?: Record<string, string> }`                                                                                                                                   | -      |

#### ShortcutKeys

```ts
type SignKeysType = {
  Ctrl: keyof KeyboardEvent;
  Alt: keyof KeyboardEvent;
  Meta: keyof KeyboardEvent;
  Shift: keyof KeyboardEvent;
};

type ShortcutKeys<CustomKey = number | "number"> =
  | [keyof SignKeysType, keyof SignKeysType, CustomKey]
  | [keyof SignKeysType, CustomKey];
```
