---
title: Sources
description: Show the source address of the referenced data.
---

## When To Use

- Show the referenced data source address in online search mode.

## Examples

<!-- prettier-ignore -->
<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/icon.vue">Icon</demo>
<demo src="./demo/expand.vue">Expand</demo>
<demo src="./demo/inline.vue">Inline</demo>

## API

### SourcesProps

| Property            | Description                  | Type                                                 | Default | Version |
| ------------------- | ---------------------------- | ---------------------------------------------------- | ------- | ------- |
| classes             | DOM class                    | [Record<SemanticType, string>](#semantic-dom)        | -       | -       |
| styles              | DOM style                    | [Record<SemanticType, CSSProperties>](#semantic-dom) | -       | -       |
| title               | Title content                | VNodeChild                                           | -       | -       |
| items               | Sources content list         | SourcesItem[]                                        | -       | -       |
| expandIconPosition  | Expand icon position         | 'start' \| 'end'                                     | 'start' | -       |
| defaultExpanded     | Default expand state         | boolean                                              | true    | -       |
| expanded            | Expand state                 | boolean                                              | -       | -       |
| onExpand            | Callback when expand changes | (expand: boolean) => void                            | -       | -       |
| onClick             | Callback when click          | (item: SourcesItem) => void                          | -       | -       |
| inline              | Inline mode                  | boolean                                              | false   | -       |
| activeKey           | Active key in inline mode    | string \| number                                     | -       | -       |
| popoverOverlayWidth | Popover overlay width        | number \| string                                     | 300     | -       |

```typescript
type SemanticType = "root" | "title" | "content";

interface SourcesItem {
  key?: string | number;
  title: VNodeChild;
  url?: string;
  icon?: VNodeChild;
  description?: VNodeChild;
}
```
