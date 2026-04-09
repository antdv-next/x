---
title: Mermaid
description: Render Mermaid diagrams with image/code view switching, zoom, drag, download and copy actions.
group:
  title: Feedback
  order: 4
---

## When To Use

- Render Mermaid diagrams in chat and AI response scenarios.
- Provide both visual diagram mode and source-code mode.
- Allow users to inspect, zoom, and export diagrams.

## Examples

<demo src="./demo/basic.vue">Basic</demo>

<demo src="./demo/custom-header.vue">Custom Header</demo>

<demo src="./demo/header-actions.vue">Header Actions</demo>

## API

### Props

| Property             | Description                                             | Type                                                                                                   | Default                                                        |
| -------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| content              | Mermaid source code                                     | `string`                                                                                               | -                                                              |
| renderType           | Render type (controlled)                                | `'image' \| 'code'`                                                                                    | -                                                              |
| defaultRenderType    | Initial render type (uncontrolled)                      | `'image' \| 'code'`                                                                                    | `'image'`                                                      |
| header               | Custom header node, set `null` to hide header           | `VNodeChild \| null`                                                                                   | -                                                              |
| config               | Mermaid initialize config                               | `MermaidConfig`                                                                                        | -                                                              |
| actions              | Header action config                                    | `{ enableZoom?: boolean; enableDownload?: boolean; enableCopy?: boolean; customActions?: ItemType[] }` | `{ enableZoom: true, enableDownload: true, enableCopy: true }` |
| codeHighlighterProps | Extra props for built-in `CodeHighlighter` in code mode | `Partial<Omit<CodeHighlighterProps, 'content' \| 'language'>>`                                         | -                                                              |
| classes              | Semantic class overrides                                | `Partial<Record<'root' \| 'header' \| 'graph' \| 'code', string>>`                                     | -                                                              |
| styles               | Semantic style overrides                                | `Partial<Record<'root' \| 'header' \| 'graph' \| 'code', CSSProperties>>`                              | -                                                              |

### ItemType

`actions.customActions` accepts `ItemType[]`:

```ts
type ItemType = {
  key?: string | number;
  label?: string;
  icon?: VNodeChild;
  onItemClick?: (info?: ItemType) => void;
  danger?: boolean;
  subItems?: Omit<
    ItemType,
    "subItems" | "triggerSubMenuAction" | "actionRender"
  >[];
  triggerSubMenuAction?: MenuProps["triggerSubMenuAction"];
  actionRender?: ((item: ItemType) => VNodeChild) | VNodeChild;
};
```

### Slots

| Slot Name                | Description                             | Type                                          |
| ------------------------ | --------------------------------------- | --------------------------------------------- |
| `header`                 | Custom header area                      | `() => VNodeChild`                            |
| `customActionIconRender` | Custom icon for `actions.customActions` | `({ item, index, originNode }) => VNodeChild` |
| `customActionRender`     | Custom action node for `customActions`  | `({ item, index, originNode }) => VNodeChild` |

The `header` slot takes precedence over the `header` prop. Passing `header={null}` hides the default header.
`customActionIconRender` and `customActionRender` only apply to `actions.customActions`.

### Events

| Event             | Description                         | Payload                             |
| ----------------- | ----------------------------------- | ----------------------------------- |
| update:renderType | Triggered when render type changes  | `(next: 'image' \| 'code') => void` |
| renderTypeChange  | Alias event for render type changes | `(next: 'image' \| 'code') => void` |

### Ref

| Property      | Description      | Type             |
| ------------- | ---------------- | ---------------- |
| nativeElement | Root DOM element | `HTMLDivElement` |

## Semantic DOM

<demo src="./demo/semantic.vue" simplify>Mermaid Semantic DOM</demo>
