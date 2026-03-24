---
title: Think
subtitle: 思考过程
description: 展示大模型深度思考过程。
---

## 何时使用

- 用于在对话时展示大模型的深度思考过程。

## 代码演示

<demo src="./demo/basic.vue">基础用法</demo>
<demo src="./demo/status.vue">设置状态</demo>
<demo src="./demo/expand.vue">是否展开</demo>

## API

### ThinkProps

| 属性               | 说明             | 类型                                                | 默认值  | 版本 |
| ------------------ | ---------------- | --------------------------------------------------- | ------- | ---- |
| classes            | 语义化结构类名   | [Record\<SemanticDOM, string\>](#语义化-dom)        | -       | -    |
| styles             | 语义化结构样式   | [Record\<SemanticDOM, CSSProperties\>](#语义化-dom) | -       | -    |
| default            | 内容（默认插槽） | `VNodeChild`                                        | -       | -    |
| title              | 状态文本         | `VNodeChild`                                        | -       | -    |
| icon               | 状态图标         | `VNodeChild`                                        | -       | -    |
| loading            | 加载中           | `boolean \| VNodeChild`                             | `false` | -    |
| defaultExpanded    | 默认是否展开     | `boolean`                                           | `true`  | -    |
| expanded (v-model) | 是否展开         | `boolean`                                           | -       | -    |
| onExpand           | 展开事件         | `(expand: boolean) => void`                         | -       | -    |
| blink              | 闪动模式         | `boolean`                                           | -       | -    |

### Think 插槽

| 插槽      | 说明                          |
| --------- | ----------------------------- |
| `default` | 思考内容                      |
| `title`   | 自定义标题（优先级高于 prop） |
| `icon`    | 自定义图标（优先级高于 prop） |

## 语义化 DOM

<demo src="./demo/semantic.vue" simplify>Think 语义结构</demo>
