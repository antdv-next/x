---
title: ThoughtChain
description: The ThoughtChain component is used to visualize and track the call chain of an Agent to Actions and Tools.
---

## When To Use

- To debug and trace the call chain in a complex Agent System.
- For use in similar chain-like scenarios.

## Examples

<demo src="./demo/basic.vue">Basic Usage</demo>
<demo src="./demo/status.vue">Node Status</demo>
<demo src="./demo/simple.vue">Simple ThoughtChain</demo>
<demo src="./demo/collapsible.vue">Collapsible</demo>
<demo src="./demo/controlled-collapsible.vue">Controlled Collapsible</demo>
<demo src="./demo/customization.vue">Customization</demo>
<demo src="./demo/slot.vue">Slots</demo>
<demo src="./demo/nested.vue">Nested Usage</demo>
<demo src="./demo/single-row.vue">Single Row</demo>

## API

### ThoughtChainProps

| Property               | Description                               | Type                                                                                           | Default   | Version |
| ---------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- | --------- | ------- |
| items                  | Collection of thought nodes               | `ThoughtChainItemType[]`                                                                       | -         | -       |
| defaultExpandedKeys    | Initially expanded nodes                  | `string[]`                                                                                     | -         | -       |
| expandedKeys (v-model) | Currently expanded nodes                  | `string[]`                                                                                     | -         | -       |
| onExpand               | Callback for when expanded nodes change   | `(expandedKeys: string[]) => void`                                                             | -         | -       |
| line                   | Line style, no line is shown when `false` | `boolean \| 'solid' \| 'dashed' \| 'dotted'`                                                   | `'solid'` | -       |
| classes                | Class names for semantic structure        | `Record<'root'\|'item'\|'itemIcon'\|'itemHeader'\|'itemContent'\|'itemFooter', string>`        | -         | -       |
| prefixCls              | Custom prefix                             | `string`                                                                                       | -         | -       |
| styles                 | Styles for semantic structure             | `Record<'root'\|'item'\|'itemIcon'\|'itemHeader'\|'itemContent'\|'itemFooter', CSSProperties>` | -         | -       |
| rootClass              | Root element class name                   | `string`                                                                                       | -         | -       |

### ThoughtChain Slots

> Slots take priority over the same-named `VNodeChild` fields in `items`.

| Slot Name     | Description                | Type                                                                                       |
| ------------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| `iconRender`  | Custom node icon content   | `({ item, index, expanded, collapsible, toggleExpand, originNode, status }) => VNodeChild` |
| `title`       | Custom node title content  | `({ item, index, expanded, collapsible, toggleExpand, originNode }) => VNodeChild`         |
| `description` | Custom node description    | `({ item, index, expanded, collapsible, toggleExpand, originNode }) => VNodeChild`         |
| `content`     | Custom node content area   | `({ item, index, expanded, collapsible, toggleExpand, originNode }) => VNodeChild`         |
| `footer`      | Custom node footer content | `({ item, index, expanded, collapsible, toggleExpand, originNode }) => VNodeChild`         |

### ThoughtChainItemType

| Property    | Description                                          | Type                                           | Default     | Version |
| ----------- | ---------------------------------------------------- | ---------------------------------------------- | ----------- | ------- |
| content     | Content of the thought node                          | `VNodeChild`                                   | -           | -       |
| description | Description of the thought node                      | `VNodeChild`                                   | -           | -       |
| footer      | Footer of the thought node                           | `VNodeChild`                                   | -           | -       |
| icon        | Icon of the thought node, not displayed when `false` | `false \| VNodeChild`                          | DefaultIcon | -       |
| key         | Unique identifier for the thought node               | `string`                                       | -           | -       |
| status      | Status of the thought node                           | `'loading' \| 'success' \| 'error' \| 'abort'` | -           | -       |
| title       | Title of the thought node                            | `VNodeChild`                                   | -           | -       |
| collapsible | Whether the thought node is collapsible              | `boolean`                                      | `false`     | -       |
| blink       | Blink mode                                           | `boolean`                                      | -           | -       |

### ThoughtChain.Item

| Property    | Description                      | Type                                           | Default | Version |
| ----------- | -------------------------------- | ---------------------------------------------- | ------- | ------- |
| prefixCls   | Custom prefix                    | `string`                                       | -       | -       |
| icon        | Icon of the thought chain        | `VNodeChild`                                   | -       | -       |
| title       | Title of the thought chain       | `VNodeChild`                                   | -       | -       |
| description | Description of the thought chain | `VNodeChild`                                   | -       | -       |
| status      | Status of the thought chain      | `'loading' \| 'success' \| 'error' \| 'abort'` | -       | -       |
| variant     | Variant configuration            | `'solid' \| 'outlined' \| 'text'`              | -       | -       |
| blink       | Blink mode                       | `boolean`                                      | -       | -       |

### ThoughtChain.Item Slots

> Named slots override the `icon`, `title`, and `description` props.

| Slot Name     | Description        | Type                                     |
| ------------- | ------------------ | ---------------------------------------- |
| `iconRender`  | Custom icon        | `({ originNode, status }) => VNodeChild` |
| `title`       | Custom title       | `({ originNode }) => VNodeChild`         |
| `description` | Custom description | `({ originNode }) => VNodeChild`         |

## Semantic DOM

### ThoughtChain

<demo src="./demo/semantic.vue" simplify>ThoughtChain Semantic Structure</demo>

### ThoughtChain.Item

<demo src="./demo/semantic-item.vue" simplify>ThoughtChain.Item Semantic Structure</demo>
