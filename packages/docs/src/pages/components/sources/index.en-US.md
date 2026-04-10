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
<demo src="./demo/render-slot.vue">Slot Render</demo>

## API

### SourcesProps

| Property            | Description               | Type                                                 | Default | Version |
| ------------------- | ------------------------- | ---------------------------------------------------- | ------- | ------- |
| classes             | DOM class                 | [Record<SemanticType, string>](#semantic-dom)        | -       | -       |
| styles              | DOM style                 | [Record<SemanticType, CSSProperties>](#semantic-dom) | -       | -       |
| rootClass           | Root element class name   | string                                               | -       | -       |
| title               | Title content             | VNodeChild                                           | -       | -       |
| items               | Sources content list      | SourcesItem[]                                        | -       | -       |
| expandIconPosition  | Expand icon position      | 'start' \| 'end'                                     | 'start' | -       |
| defaultExpanded     | Default expand state      | boolean                                              | true    | -       |
| expanded            | Expand state              | boolean                                              | -       | -       |
| onClick             | Callback when click       | (item: SourcesItem) => void                          | -       | -       |
| inline              | Inline mode               | boolean                                              | false   | -       |
| activeKey           | Active key in inline mode | string \| number                                     | -       | -       |
| popoverOverlayWidth | Popover overlay width     | number \| string                                     | 300     | -       |

### Events

| Event    | Description                   | Type                        |
| -------- | ----------------------------- | --------------------------- |
| `expand` | Triggered when expand changes | `(expand: boolean) => void` |

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

### Slots

| Slot Name     | Description              | Type                                          |
| ------------- | ------------------------ | --------------------------------------------- |
| `title`       | Top title slot           | `({ originNode }) => VNodeChild`              |
| `iconRender`  | Source icon render slot  | `({ item, index, originNode }) => VNodeChild` |
| `titleRender` | Source title render slot | `({ item, index, originNode }) => VNodeChild` |
| `description` | Source description slot  | `({ item, index, originNode }) => VNodeChild` |

Slots take precedence over prop content. The same item slots apply to both default expand mode and inline mode.

## Semantic DOM {#semantic-dom}

<demo src="./demo/semantic.vue" simplify>Sources Semantic DOM</demo>
