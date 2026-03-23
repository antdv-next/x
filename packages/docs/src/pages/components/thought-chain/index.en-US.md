---
title: ThoughtChain
subtitle: Thought Chain
description: Visualize and track AI Agent's call chain and tool invocations.
---

## When To Use

Use when you need to visualize and track an AI Agent's reasoning chain.

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/collapsible.vue">Collapsible</demo>
<demo src="./demo/line-style.vue">Line Style</demo>
<demo src="./demo/item.vue">Item Sub-component</demo>

## API

### ThoughtChain

| Property                   | Description                                 | Type                                           | Default                |
| -------------------------- | ------------------------------------------- | ---------------------------------------------- | ---------------------- |
| `items`                    | Collection of thought nodes                 | `ThoughtChainItemType[]`                       | `[]`                   |
| `expandedKeys` (`v-model`) | Currently expanded node keys (controlled)   | `string[]`                                     | -                      |
| `defaultExpandedKeys`      | Initially expanded node keys (uncontrolled) | `string[]`                                     | `[]`                   |
| `line`                     | Connector line style, `false` hides lines   | `boolean \| 'solid' \| 'dashed' \| 'dotted'`   | `'solid'`              |
| `prefixCls`                | CSS class prefix                            | `string`                                       | `'antd-thought-chain'` |
| `rootClass`                | Root CSS class name                         | `string`                                       | -                      |
| `classes`                  | Semantic class overrides                    | `Partial<Record<SemanticType, string>>`        | -                      |
| `styles`                   | Semantic style overrides                    | `Partial<Record<SemanticType, CSSProperties>>` | -                      |

`SemanticType` = `'root' | 'item' | 'itemHeader' | 'itemIcon' | 'itemContent' | 'itemFooter'`

### ThoughtChain Events

| Event                 | Description                    | Parameters                         |
| --------------------- | ------------------------------ | ---------------------------------- |
| `expand`              | Fired on expand/collapse       | `(expandedKeys: string[]) => void` |
| `update:expandedKeys` | Expanded keys change (v-model) | `(expandedKeys: string[]) => void` |

### ThoughtChainItemType

| Property      | Description                      | Type                                           | Default                |
| ------------- | -------------------------------- | ---------------------------------------------- | ---------------------- |
| `key`         | Unique node identifier           | `string`                                       | Auto-generated (index) |
| `title`       | Node title                       | `VNodeChild`                                   | -                      |
| `description` | Node description                 | `VNodeChild`                                   | -                      |
| `content`     | Main content (collapsible)       | `VNodeChild`                                   | -                      |
| `footer`      | Footer area                      | `VNodeChild`                                   | -                      |
| `icon`        | Custom icon, `false` hides it    | `false \| VNodeChild`                          | Numbered index         |
| `status`      | Node status                      | `'loading' \| 'success' \| 'error' \| 'abort'` | -                      |
| `collapsible` | Whether content can be collapsed | `boolean`                                      | `false`                |
| `blink`       | Enable blink animation on title  | `boolean`                                      | -                      |

### ThoughtChain.Item

Inline chip/badge sub-component for displaying tool calls within ThoughtChain content.

| Property      | Description              | Type                                                                           | Default   |
| ------------- | ------------------------ | ------------------------------------------------------------------------------ | --------- |
| `title`       | Title                    | `VNodeChild`                                                                   | -         |
| `description` | Description text         | `VNodeChild`                                                                   | -         |
| `icon`        | Custom icon              | `VNodeChild`                                                                   | -         |
| `status`      | Status indicator         | `'loading' \| 'success' \| 'error' \| 'abort'`                                 | -         |
| `variant`     | Visual variant           | `'solid' \| 'outlined' \| 'text'`                                              | `'solid'` |
| `blink`       | Enable blink animation   | `boolean`                                                                      | `false`   |
| `disabled`    | Disabled state           | `boolean`                                                                      | `false`   |
| `onClick`     | Click handler            | `(e: MouseEvent) => void`                                                      | -         |
| `classes`     | Semantic class overrides | `Partial<Record<'root' \| 'icon' \| 'title' \| 'description', string>>`        | -         |
| `styles`      | Semantic style overrides | `Partial<Record<'root' \| 'icon' \| 'title' \| 'description', CSSProperties>>` | -         |

### ThoughtChain Ref

| Property        | Description      | Type             |
| --------------- | ---------------- | ---------------- |
| `nativeElement` | Root DOM element | `HTMLDivElement` |

## Semantic DOM

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
