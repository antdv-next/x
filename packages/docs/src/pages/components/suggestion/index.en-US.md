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
<demo src="./demo/render-slot.vue">Custom Item Render</demo>

## API

### SuggestionProps

| Property    | Description                                | Type                                                             | Default |
| ----------- | ------------------------------------------ | ---------------------------------------------------------------- | ------- |
| `items`     | Suggestion list, supports dynamic function | `SuggestionItem[] \| ((info?: T) => SuggestionItem[])`           | `[]`    |
| `open`      | Controlled popup open state                | `boolean`                                                        | -       |
| `block`     | Take full width                            | `boolean`                                                        | `false` |
| `classes`   | Semantic class names                       | `Partial<Record<'root' \| 'content' \| 'popup', string>>`        | -       |
| `styles`    | Semantic styles                            | `Partial<Record<'root' \| 'content' \| 'popup', CSSProperties>>` | -       |
| `rootClass` | Root class name                            | `string`                                                         | -       |

Other forwarded props are based on [CascaderProps](https://antdv-next.com/components/cascader), excluding fields controlled by Suggestion (`open/value/options/multiple/classes/styles`, etc.).

### Events

| Event        | Description                             | Type                                                         |
| ------------ | --------------------------------------- | ------------------------------------------------------------ |
| `openChange` | Triggered when popup open state changes | `(open: boolean) => void`                                    |
| `select`     | Triggered when selecting an item        | `(value: string, selectedOptions: SuggestionItem[]) => void` |

### Default Slot (scoped slot)

```ts
type RenderChildrenProps<T = any> = {
  onTrigger: (info?: T | false) => void;
  onKeyDown: (event: KeyboardEvent) => void | false;
  open: boolean;
};
```

Calling `onTrigger(false)` closes the popup.

### Named Slots

| Slot Name     | Description           | Type                                   |
| ------------- | --------------------- | -------------------------------------- |
| `labelRender` | Suggestion label slot | `({ item, originNode }) => VNodeChild` |
| `iconRender`  | Suggestion icon slot  | `({ item, originNode }) => VNodeChild` |
| `extraRender` | Suggestion extra slot | `({ item, originNode }) => VNodeChild` |

Each slot receives the current suggestion `item` and its default rendered node as `originNode`. When a slot is not provided, Suggestion falls back to `item.label`, `item.icon`, and `item.extra`.

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
