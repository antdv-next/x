---
title: ThoughtChain
subtitle: 思维链
description: 思维链组件用于可视化和追踪 Agent 对 Actions 和 Tools 的调用链。
---

## 何时使用

- 调试和跟踪复杂 Agent System 中的调用链
- 类似的链式场景中使用

## 代码演示

<demo src="./demo/basic.vue">基本</demo>
<demo src="./demo/status.vue">节点状态</demo>
<demo src="./demo/simple.vue">简洁思维链</demo>
<demo src="./demo/collapsible.vue">可折叠的</demo>
<demo src="./demo/controlled-collapsible.vue">受控的折叠</demo>
<demo src="./demo/customization.vue">客制化</demo>
<demo src="./demo/nested.vue">嵌套使用</demo>
<demo src="./demo/single-row.vue">单行折叠</demo>

## API

### ThoughtChainProps

| 属性                   | 说明                              | 类型                                                                                           | 默认值    | 版本 |
| ---------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- | --------- | ---- |
| items                  | 思维节点集合                      | `ThoughtChainItemType[]`                                                                       | -         | -    |
| defaultExpandedKeys    | 初始化展开的节点                  | `string[]`                                                                                     | -         | -    |
| expandedKeys (v-model) | 当前展开的节点                    | `string[]`                                                                                     | -         | -    |
| onExpand               | 展开节点变化回调                  | `(expandedKeys: string[]) => void`                                                             | -         | -    |
| line                   | 线条样式，为 `false` 时不展示线条 | `boolean \| 'solid' \| 'dashed' \| 'dotted'`                                                   | `'solid'` | -    |
| classes                | 语义化结构的类名                  | `Record<'root'\|'item'\|'itemIcon'\|'itemHeader'\|'itemContent'\|'itemFooter', string>`        | -         | -    |
| prefixCls              | 自定义前缀                        | `string`                                                                                       | -         | -    |
| styles                 | 语义化结构的样式                  | `Record<'root'\|'item'\|'itemIcon'\|'itemHeader'\|'itemContent'\|'itemFooter', CSSProperties>` | -         | -    |
| rootClass              | 根元素样式类名                    | `string`                                                                                       | -         | -    |

### ThoughtChainItemType

| 属性        | 说明                              | 类型                                           | 默认值      | 版本 |
| ----------- | --------------------------------- | ---------------------------------------------- | ----------- | ---- |
| content     | 思维节点内容                      | `VNodeChild`                                   | -           | -    |
| description | 思维节点描述                      | `VNodeChild`                                   | -           | -    |
| footer      | 思维节点脚注                      | `VNodeChild`                                   | -           | -    |
| icon        | 思维节点图标，为 `false` 时不展示 | `false \| VNodeChild`                          | DefaultIcon | -    |
| key         | 思维节点唯一标识符                | `string`                                       | -           | -    |
| status      | 思维节点状态                      | `'loading' \| 'success' \| 'error' \| 'abort'` | -           | -    |
| title       | 思维节点标题                      | `VNodeChild`                                   | -           | -    |
| collapsible | 思维节点是否可折叠                | `boolean`                                      | `false`     | -    |
| blink       | 闪动效果                          | `boolean`                                      | -           | -    |

### ThoughtChain.Item

| 属性        | 说明       | 类型                                           | 默认值 | 版本 |
| ----------- | ---------- | ---------------------------------------------- | ------ | ---- |
| prefixCls   | 自定义前缀 | `string`                                       | -      | -    |
| icon        | 思维链图标 | `VNodeChild`                                   | -      | -    |
| title       | 思维链标题 | `VNodeChild`                                   | -      | -    |
| description | 思维链描述 | `VNodeChild`                                   | -      | -    |
| status      | 思维链状态 | `'loading' \| 'success' \| 'error' \| 'abort'` | -      | -    |
| variant     | 变体配置   | `'solid' \| 'outlined' \| 'text'`              | -      | -    |
| blink       | 闪动效果   | `boolean`                                      | -      | -    |

## 语义化 DOM

### ThoughtChain

<demo src="./demo/semantic.vue" simplify>ThoughtChain 语义结构</demo>

### ThoughtChain.Item

<demo src="./demo/semantic-item.vue" simplify>ThoughtChain.Item 语义结构</demo>
