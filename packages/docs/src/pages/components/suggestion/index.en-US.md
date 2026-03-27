---
category: Components
group:
  title: Expression
  order: 2
title: Suggestion
subtitle: Quick Commands
description: A suggestion component that provides quick command choices in input scenarios.
---

## When To Use

- Provide quick command suggestions in chat input scenarios.
- Support keyboard navigation and selection for nested suggestion options.

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/block.vue">Block</demo>
<demo src="./demo/trigger.vue">Custom Trigger</demo>

## API

### SuggestionProps

| Property       | Description                                | Type                                                             | Default |
| -------------- | ------------------------------------------ | ---------------------------------------------------------------- | ------- |
| `items`        | Suggestion list, supports dynamic function | `SuggestionItem[] \| ((info?: T) => SuggestionItem[])`           | `[]`    |
| `open`         | Controlled popup open state                | `boolean`                                                        | -       |
| `onOpenChange` | Callback when popup open state changes     | `(open: boolean) => void`                                        | -       |
| `onSelect`     | Callback when selecting an item            | `(value: string, selectedOptions: SuggestionItem[]) => void`     | -       |
| `block`        | Take full width                            | `boolean`                                                        | `false` |
| `classes`      | Semantic class names                       | `Partial<Record<'root' \| 'content' \| 'popup', string>>`        | -       |
| `styles`       | Semantic styles                            | `Partial<Record<'root' \| 'content' \| 'popup', CSSProperties>>` | -       |
| `rootClass`    | Root class name                            | `string`                                                         | -       |

Other forwarded props are based on [CascaderProps](https://antdv-next.com/components/cascader), excluding fields controlled by Suggestion (`open/onOpenChange/value/options/multiple/classes/styles`, etc.).

### Default Slot (scoped slot)

```ts
type RenderChildrenProps<T = any> = {
  onTrigger: (info?: T | false) => void;
  onKeyDown: (event: KeyboardEvent) => void | false;
  open: boolean;
};
```

Calling `onTrigger(false)` closes the popup.

### SuggestionItem

| Property   | Description        | Type               | Default |
| ---------- | ------------------ | ------------------ | ------- |
| `label`    | Item label content | `VNodeChild`       | -       |
| `value`    | Item value         | `string`           | -       |
| `icon`     | Item icon          | `VNodeChild`       | -       |
| `extra`    | Extra item content | `VNodeChild`       | -       |
| `children` | Child items        | `SuggestionItem[]` | -       |

## Semantic DOM

<demo src="./demo/semantic.vue" simplify>Suggestion Semantic DOM</demo>
