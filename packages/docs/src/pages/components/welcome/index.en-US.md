---
category: Components
group:
  title: Awakening
  order: 1
title: Welcome
subtitle: Welcome
description: Display a welcome message, capability summary, and extra actions.
---

## When To Use

- Use on landing pages, empty states, or chat entry areas to quickly communicate product capability.

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/variant.vue">Variants</demo>
<demo src="./demo/background.vue">Background</demo>

## API

### WelcomeProps

| Property      | Description                                                      | Type                                                                                      | Default    |
| ------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| `icon`        | Leading icon, auto-renders as an image when passing an image URL | `VNodeChild`                                                                              | -          |
| `title`       | Title content                                                    | `VNodeChild`                                                                              | -          |
| `description` | Description content                                              | `VNodeChild`                                                                              | -          |
| `extra`       | Extra actions area on the right                                  | `VNodeChild`                                                                              | -          |
| `variant`     | Visual variant                                                   | `'filled' \| 'borderless'`                                                                | `'filled'` |
| `rootClass`   | Root class name                                                  | `string`                                                                                  | -          |
| `classes`     | Semantic class names                                             | `Partial<Record<'root' \| 'title' \| 'description' \| 'icon' \| 'extra', string>>`        | -          |
| `styles`      | Semantic inline styles                                           | `Partial<Record<'root' \| 'title' \| 'description' \| 'icon' \| 'extra', CSSProperties>>` | -          |

## Semantic DOM {#semantic-dom}

<demo src="./demo/semantic.vue" simplify>Welcome semantic structure</demo>
