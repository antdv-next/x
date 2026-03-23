---
title: Think
subtitle: Think
description: A collapsible panel for displaying AI deep thinking processes.
---

## When To Use

Use when you need to display AI reasoning or chain-of-thought content.

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/status.vue">Status Control</demo>
<demo src="./demo/expand.vue">Controlled Expand</demo>

## API

### Think

| Property               | Description                                                       | Type                                                              | Default               |
| ---------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------- |
| `title`                | Title displayed in the status header                              | `VNodeChild`                                                      | -                     |
| `icon`                 | Custom icon when not loading                                      | `VNodeChild`                                                      | Built-in sparkle icon |
| `loading`              | Loading state. `true` shows spinner, VNode shows custom indicator | `VNodeChild`                                                      | `false`               |
| `expanded` (`v-model`) | Whether content is expanded (controlled)                          | `boolean`                                                         | -                     |
| `defaultExpanded`      | Initial expanded state (uncontrolled)                             | `boolean`                                                         | `true`                |
| `blink`                | Enable shimmer animation on title text                            | `boolean`                                                         | `false`               |
| `prefixCls`            | CSS class prefix                                                  | `string`                                                          | `'antd-think'`        |
| `rootClass`            | Root CSS class name                                               | `string`                                                          | -                     |
| `classes`              | Semantic class overrides                                          | `Partial<Record<'root' \| 'status' \| 'content', string>>`        | -                     |
| `styles`               | Semantic style overrides                                          | `Partial<Record<'root' \| 'status' \| 'content', CSSProperties>>` | -                     |

### Think Events

| Event             | Description                     | Parameters                    |
| ----------------- | ------------------------------- | ----------------------------- |
| `expand`          | Fired on expand/collapse        | `(expanded: boolean) => void` |
| `update:expanded` | Expanded state change (v-model) | `(expanded: boolean) => void` |

### Think Slots

| Slot      | Description                   |
| --------- | ----------------------------- |
| `default` | Thinking content              |
| `title`   | Custom title (overrides prop) |
| `icon`    | Custom icon (overrides prop)  |

### Think Ref

| Property        | Description      | Type             |
| --------------- | ---------------- | ---------------- |
| `nativeElement` | Root DOM element | `HTMLDivElement` |

## Semantic DOM

```
<div class="antd-think">                       <!-- root -->
  <div class="antd-think-status-wrapper">       <!-- status -->
    <div class="antd-think-status-icon">...</div>
    <div class="antd-think-status-text">...</div>
    <span class="antd-think-status-down-icon">▶</span>
  </div>
  <div class="antd-think-content">              <!-- content -->
    <!-- slot: default -->
  </div>
</div>
```
