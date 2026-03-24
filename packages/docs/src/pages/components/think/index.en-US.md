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

| Slot      | Description                   |
| --------- | ----------------------------- |
| `default` | Thinking content              |
| `title`   | Custom title (overrides prop) |
| `icon`    | Custom icon (overrides prop)  |

## Semantic DOM

<demo src="./demo/semantic.vue" simplify>Think Semantic Structure</demo>
