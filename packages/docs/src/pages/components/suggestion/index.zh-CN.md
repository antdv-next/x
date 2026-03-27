---
category: Components
group:
  title: 表达
  order: 2
title: Suggestion
subtitle: 快捷指令
description: 用于在输入场景中提供快捷指令建议的组件。
---

## 何时使用

- 需要在聊天输入场景中提供快捷指令建议。
- 需要通过键盘快速浏览并选择多级建议项。

## 代码演示

<demo src="./demo/basic.vue">基本用法</demo>
<demo src="./demo/block.vue">整行宽度</demo>
<demo src="./demo/trigger.vue">自定义触发</demo>

## API

### SuggestionProps

| 属性           | 说明                         | 类型                                                             | 默认值  |
| -------------- | ---------------------------- | ---------------------------------------------------------------- | ------- |
| `items`        | 建议项列表，支持函数动态生成 | `SuggestionItem[] \| ((info?: T) => SuggestionItem[])`           | `[]`    |
| `open`         | 受控打开面板                 | `boolean`                                                        | -       |
| `onOpenChange` | 面板打开状态变化回调         | `(open: boolean) => void`                                        | -       |
| `onSelect`     | 选中建议项回调               | `(value: string, selectedOptions: SuggestionItem[]) => void`     | -       |
| `block`        | 是否整行宽度                 | `boolean`                                                        | `false` |
| `classes`      | 语义化 class                 | `Partial<Record<'root' \| 'content' \| 'popup', string>>`        | -       |
| `styles`       | 语义化 style                 | `Partial<Record<'root' \| 'content' \| 'popup', CSSProperties>>` | -       |
| `rootClass`    | 根节点类名                   | `string`                                                         | -       |

其余可透传属性参考 [CascaderProps](https://antdv-next.com/components/cascader)（已排除 `open/onOpenChange/value/options/multiple/classes/styles` 等由 Suggestion 接管的字段）。

### 默认插槽（scoped slot）

```ts
type RenderChildrenProps<T = any> = {
  onTrigger: (info?: T | false) => void;
  onKeyDown: (event: KeyboardEvent) => void | false;
  open: boolean;
};
```

调用 `onTrigger(false)` 会关闭建议面板。

### SuggestionItem

| 属性       | 说明           | 类型               | 默认值 |
| ---------- | -------------- | ------------------ | ------ |
| `label`    | 建议项显示内容 | `VNodeChild`       | -      |
| `value`    | 建议项值       | `string`           | -      |
| `icon`     | 建议项图标     | `VNodeChild`       | -      |
| `extra`    | 建议项额外内容 | `VNodeChild`       | -      |
| `children` | 子项目         | `SuggestionItem[]` | -      |

## 语义化 DOM

<demo src="./demo/semantic.vue" simplify>Suggestion 语义结构</demo>
