---
title: Prompts
subtitle: 提示集
description: 用于显示一组与当前上下文相关的预定义的问题或建议。
---

## 何时使用

- 在对话开始前，向用户展示一组预设的问题或引导性建议
- 需要引导用户快速进入特定话题或场景
- 提供多个可选的提示项，降低用户输入门槛

## 代码演示

<demo src="./demo/basic.vue">基本</demo>
<demo src="./demo/disabled.vue">不可用状态</demo>
<demo src="./demo/vertical.vue">纵向展示</demo>
<demo src="./demo/wrap.vue">可换行</demo>
<demo src="./demo/nest.vue">嵌套组合</demo>
<demo src="./demo/fade-in.vue">渐入效果</demo>
<demo src="./demo/render-slot.vue">插槽渲染</demo>

## API

### PromptsProps

| 属性         | 说明                                 | 类型                                           | 默认值  |
| ------------ | ------------------------------------ | ---------------------------------------------- | ------- |
| `items`      | 提示项列表数据源                     | `PromptsItemType[]`                            | -       |
| `title`      | 显示在提示列表顶部的标题             | `VNodeChild`                                   | -       |
| `vertical`   | 设置为 `true` 时，提示列表将垂直排列 | `boolean`                                      | `false` |
| `wrap`       | 设置为 `true` 时，提示列表将自动换行 | `boolean`                                      | `false` |
| `fadeIn`     | 渐入效果                             | `boolean`                                      | -       |
| `fadeInLeft` | 从左到右渐入效果                     | `boolean`                                      | -       |
| `styles`     | 语义化结构 style                     | `Partial<Record<SemanticType, CSSProperties>>` | -       |
| `classes`    | 语义化结构 className                 | `Partial<Record<SemanticType, string>>`        | -       |
| `rootClass`  | 根节点类名                           | `string`                                       | -       |
| `prefixCls`  | 样式类名前缀                         | `string`                                       | -       |

### 事件

| 事件名      | 说明             | 类型                               |
| ----------- | ---------------- | ---------------------------------- |
| `itemClick` | 点击提示项时触发 | `(info: PromptsClickInfo) => void` |

### PromptsItemType

| 属性          | 说明                         | 类型                    | 默认值  |
| ------------- | ---------------------------- | ----------------------- | ------- |
| `key`         | 唯一标识，用于区分每个提示项 | `string \| number`      | -       |
| `label`       | 提示标签，显示提示的主要内容 | `VNodeChild`            | -       |
| `description` | 提示描述，提供额外的信息     | `VNodeChild`            | -       |
| `icon`        | 提示图标，显示在提示项的左侧 | `VNodeChild`            | -       |
| `disabled`    | 设置为 `true` 时禁用点击事件 | `boolean`               | `false` |
| `children`    | 嵌套的子提示项               | `BasePromptsItemType[]` | -       |

### PromptsClickInfo

| 属性   | 说明               | 类型             |
| ------ | ------------------ | ---------------- |
| `data` | 被点击的提示项数据 | `PromptDataItem` |

### SemanticType

```ts
type SemanticType =
  | "root"
  | "list"
  | "item"
  | "itemContent"
  | "title"
  | "subList"
  | "subItem";
```

### 插槽

| 插槽名        | 说明           | 类型                                                  |
| ------------- | -------------- | ----------------------------------------------------- |
| `title`       | 顶部标题插槽   | `({ originNode }) => VNodeChild`                      |
| `labelRender` | 提示项标题插槽 | `({ item, originNode, index, nested }) => VNodeChild` |
| `description` | 提示项描述插槽 | `({ item, originNode, index, nested }) => VNodeChild` |
| `iconRender`  | 提示项图标插槽 | `({ item, originNode, index, nested }) => VNodeChild` |

插槽优先级高于同名属性内容，且会同时作用于一级项与嵌套子项。

## 语义化 DOM

<demo src="./demo/semantic.vue" simplify>Prompts 语义结构</demo>
