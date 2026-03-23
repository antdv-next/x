---
title: ThoughtChain
subtitle: 思维链
description: 用于展示 AI Agent 的思维链路和工具调用过程。
---

## 何时使用

当需要可视化和追踪 AI Agent 的调用链路时使用。

## 代码演示

<demo src="./demo/basic.vue">基本用法</demo>
<demo src="./demo/collapsible.vue">可折叠</demo>
<demo src="./demo/line-style.vue">连接线样式</demo>
<demo src="./demo/item.vue">Item 子组件</demo>

## API

### ThoughtChain

| 属性                       | 说明                            | 类型                                           | 默认值                 |
| -------------------------- | ------------------------------- | ---------------------------------------------- | ---------------------- |
| `items`                    | 思维链节点集合                  | `ThoughtChainItemType[]`                       | `[]`                   |
| `expandedKeys` (`v-model`) | 当前展开节点 key 列表（受控）   | `string[]`                                     | -                      |
| `defaultExpandedKeys`      | 初始展开节点 key 列表（非受控） | `string[]`                                     | `[]`                   |
| `line`                     | 连接线样式，`false` 隐藏连接线  | `boolean \| 'solid' \| 'dashed' \| 'dotted'`   | `'solid'`              |
| `prefixCls`                | CSS 类名前缀                    | `string`                                       | `'antd-thought-chain'` |
| `rootClass`                | 根节点 CSS 类名                 | `string`                                       | -                      |
| `classes`                  | 语义化结构 className            | `Partial<Record<SemanticType, string>>`        | -                      |
| `styles`                   | 语义化结构 style                | `Partial<Record<SemanticType, CSSProperties>>` | -                      |

`SemanticType` = `'root' | 'item' | 'itemHeader' | 'itemIcon' | 'itemContent' | 'itemFooter'`

### ThoughtChain 事件

| 事件                  | 说明                    | 回调参数                           |
| --------------------- | ----------------------- | ---------------------------------- |
| `expand`              | 展开/折叠时触发         | `(expandedKeys: string[]) => void` |
| `update:expandedKeys` | 展开状态变化（v-model） | `(expandedKeys: string[]) => void` |

### ThoughtChainItemType

| 属性          | 说明                         | 类型                                           | 默认值            |
| ------------- | ---------------------------- | ---------------------------------------------- | ----------------- |
| `key`         | 节点唯一标识                 | `string`                                       | 自动生成（index） |
| `title`       | 节点标题                     | `VNodeChild`                                   | -                 |
| `description` | 节点描述                     | `VNodeChild`                                   | -                 |
| `content`     | 节点内容（可折叠）           | `VNodeChild`                                   | -                 |
| `footer`      | 底部区域                     | `VNodeChild`                                   | -                 |
| `icon`        | 自定义图标，`false` 隐藏图标 | `false \| VNodeChild`                          | 数字序号          |
| `status`      | 节点状态                     | `'loading' \| 'success' \| 'error' \| 'abort'` | -                 |
| `collapsible` | 是否可折叠                   | `boolean`                                      | `false`           |
| `blink`       | 标题闪烁动画                 | `boolean`                                      | -                 |

### ThoughtChain.Item

内联 chip/badge 子组件，用于在 ThoughtChain 节点内容中展示工具调用等操作。

| 属性          | 说明                 | 类型                                                                           | 默认值    |
| ------------- | -------------------- | ------------------------------------------------------------------------------ | --------- |
| `title`       | 标题                 | `VNodeChild`                                                                   | -         |
| `description` | 描述文字             | `VNodeChild`                                                                   | -         |
| `icon`        | 自定义图标           | `VNodeChild`                                                                   | -         |
| `status`      | 状态指示器           | `'loading' \| 'success' \| 'error' \| 'abort'`                                 | -         |
| `variant`     | 视觉变体             | `'solid' \| 'outlined' \| 'text'`                                              | `'solid'` |
| `blink`       | 闪烁动画             | `boolean`                                                                      | `false`   |
| `disabled`    | 禁用状态             | `boolean`                                                                      | `false`   |
| `onClick`     | 点击回调             | `(e: MouseEvent) => void`                                                      | -         |
| `classes`     | 语义化结构 className | `Partial<Record<'root' \| 'icon' \| 'title' \| 'description', string>>`        | -         |
| `styles`      | 语义化结构 style     | `Partial<Record<'root' \| 'icon' \| 'title' \| 'description', CSSProperties>>` | -         |

### ThoughtChain Ref

| 属性            | 说明        | 类型             |
| --------------- | ----------- | ---------------- |
| `nativeElement` | 根 DOM 元素 | `HTMLDivElement` |

## 语义化 DOM

```
<div class="antd-thought-chain">                              <!-- root -->
  <div class="antd-thought-chain-node">                       <!-- item -->
    <div class="antd-thought-chain-node-icon">                <!-- itemIcon -->
      <span class="antd-thought-chain-node-index-icon">1</span>
    </div>
    <div class="antd-thought-chain-node-box">
      <div class="antd-thought-chain-node-header">            <!-- itemHeader -->
        <span class="antd-thought-chain-node-title">...</span>
        <span class="antd-thought-chain-node-description">...</span>
      </div>
      <div class="antd-thought-chain-node-content">           <!-- itemContent -->
        <div class="antd-thought-chain-node-content-box">...</div>
      </div>
      <div class="antd-thought-chain-node-footer">            <!-- itemFooter -->
        ...
      </div>
    </div>
  </div>
</div>
```
