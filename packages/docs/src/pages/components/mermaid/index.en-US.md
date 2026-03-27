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

## Migration

### React API to Vue API

| Old (React)                 | New (Vue)                                    | Notes                                              |
| --------------------------- | -------------------------------------------- | -------------------------------------------------- |
| `<Mermaid>{code}</Mermaid>` | `<Mermaid :content="code" />`                | `children` is replaced by `content`.               |
| `onRenderTypeChange`        | `@render-type-change` / `v-model:renderType` | Supports both event and two-way binding.           |
| `className` / `classNames`  | `class` / `classes`                          | Aligns with current Vue component conventions.     |
| `highlightProps`            | `codeHighlighterProps`                       | Passed to built-in `CodeHighlighter` in code mode. |

### Quick Example

```vue
<script setup lang="ts">
import { Mermaid } from "@antdv-next/x";

const code = `graph TD\nA-->B`;
</script>

<template>
  <Mermaid :content="code" v-model:renderType="mode" />
</template>
```
