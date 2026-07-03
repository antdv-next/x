---
title: Think
description: Show deep thinking process.
---

## When To Use

Used to show deep thinking process.

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/status.vue">Status</demo>
<demo src="./demo/expand.vue">Expand</demo>
<demo src="./demo/slot.vue">Slots</demo>

## API

### ThinkProps

| Property           | Description                  | Type                                                  | Default | Version |
| ------------------ | ---------------------------- | ----------------------------------------------------- | ------- | ------- |
| classes            | Semantic DOM class           | [Record\<SemanticDOM, string\>](#semantic-dom)        | -       | -       |
| styles             | Semantic DOM style           | [Record\<SemanticDOM, CSSProperties\>](#semantic-dom) | -       | -       |
| default            | Content (default slot)       | `VNodeChild`                                          | -       | -       |
| title              | Text of status               | `VNodeChild`                                          | -       | -       |
| icon               | Show icon                    | `VNodeChild`                                          | -       | -       |
| loading            | Loading                      | `boolean \| VNodeChild`                               | `false` | -       |
| defaultExpanded    | Default Expand state         | `boolean`                                             | `true`  | -       |
| expanded (v-model) | Expand state                 | `boolean`                                             | -       | -       |
| onExpand           | Callback when expand changes | `(expand: boolean) => void`                           | -       | -       |
| blink              | Blink mode                   | `boolean`                                             | -       | -       |

### Think Slots

| Slot      | Description                   | Type               |
| --------- | ----------------------------- | ------------------ |
| `default` | Thinking content              | `() => VNodeChild` |
| `title`   | Custom title (overrides prop) | `() => VNodeChild` |
| `icon`    | Custom icon (overrides prop)  | `() => VNodeChild` |

Slot priority:
`icon` slot > `loading` prop (custom node or default loading icon) > `icon` prop > default ThinkIcon

`title` slot > `title` prop

## Semantic DOM

<demo src="./demo/semantic.vue" simplify>Think Semantic Structure</demo>

## Design Token

<ComponentTokenTable component="Think"></ComponentTokenTable>

See [Customize Theme](/docs/customize-theme-en) to learn how to use Design Token.
