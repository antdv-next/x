---
title: Actions
description: Quick action list for common AI chat interactions.
---

## When To Use

Use it as an operation area below messages, such as retry, edit, copy, feedback, and audio controls.

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/sub.vue">Sub Menu Items</demo>
<demo src="./demo/preset.vue">Preset Composition</demo>
<demo src="./demo/variant.vue">Variants</demo>
<demo src="./demo/fade-in.vue">Fade In</demo>

## API

### Actions

| Property        | Description                                | Type                                                                 | Default        |
| --------------- | ------------------------------------------ | -------------------------------------------------------------------- | -------------- |
| `items`         | Action item list                           | `ItemType[]`                                                         | `[]`           |
| `onClick`       | Callback when an item is clicked           | `({ item, key, keyPath, domEvent }) => void`                         | -              |
| `dropdownProps` | Dropdown options (forwarded to `Dropdown`) | `DropdownProps`                                                      | -              |
| `variant`       | Visual variant                             | `'borderless' \| 'filled' \| 'outlined'`                             | `'borderless'` |
| `fadeIn`        | Enable fade-in animation                   | `boolean`                                                            | `false`        |
| `fadeInLeft`    | Enable left-to-right fade-in animation     | `boolean`                                                            | `false`        |
| `classes`       | Semantic class names                       | `Partial<Record<'root' \| 'item' \| 'itemDropdown', string>>`        | -              |
| `styles`        | Semantic styles                            | `Partial<Record<'root' \| 'item' \| 'itemDropdown', CSSProperties>>` | -              |

Prefer `ActionsCopy`, `ActionsFeedback`, `ActionsAudio`, and `ActionsItem` exports. Legacy `Actions.Copy`, `Actions.Feedback`, `Actions.Audio`, and `Actions.Item` syntax remains compatible.

Recommended usage:

```vue
<script setup lang="ts">
import { Actions, ActionsCopy } from "@antdv-next/x";
</script>

<template>
  <Actions :items="items" />
  <ActionsCopy text="copy value" />
  <a-actions-copy text="copy value" />
</template>
```

### ItemType

| Property               | Description                                                  | Type                                                                       | Default   |
| ---------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- | --------- |
| `key`                  | Unique item key                                              | `string \| number`                                                         | -         |
| `label`                | Item tooltip label                                           | `string`                                                                   | -         |
| `icon`                 | Item icon                                                    | `VNodeChild`                                                               | -         |
| `onItemClick`          | Item click callback (higher priority than `Actions.onClick`) | `(info?: ItemType) => void`                                                | -         |
| `danger`               | Danger state                                                 | `boolean`                                                                  | `false`   |
| `subItems`             | Sub action items                                             | `Omit<ItemType, 'subItems' \| 'triggerSubMenuAction' \| 'actionRender'>[]` | -         |
| `triggerSubMenuAction` | Sub-menu trigger action                                      | `'hover' \| 'click'`                                                       | `'hover'` |
| `actionRender`         | Custom rendered item content                                 | `VNodeChild \| ((item: ItemType) => VNodeChild)`                           | -         |

### ActionsFeedback

| Property   | Description                    | Type                               | Default     |
| ---------- | ------------------------------ | ---------------------------------- | ----------- |
| `value`    | Feedback value                 | `'like' \| 'dislike' \| 'default'` | `'default'` |
| `onChange` | Feedback value change callback | `(value) => void`                  | -           |

### ActionsCopy

| Property | Description  | Type         | Default |
| -------- | ------------ | ------------ | ------- |
| `text`   | Text to copy | `string`     | `''`    |
| `icon`   | Copy icon    | `VNodeChild` | -       |

### ActionsAudio

| Property | Description  | Type                                             | Default     |
| -------- | ------------ | ------------------------------------------------ | ----------- |
| `status` | Audio status | `'loading' \| 'error' \| 'running' \| 'default'` | `'default'` |

### ActionsItem

| Property      | Description   | Type                                             | Default     |
| ------------- | ------------- | ------------------------------------------------ | ----------- |
| `status`      | Item status   | `'loading' \| 'error' \| 'running' \| 'default'` | `'default'` |
| `label`       | Tooltip label | `string`                                         | -           |
| `defaultIcon` | Default icon  | `VNodeChild`                                     | -           |
| `runningIcon` | Running icon  | `VNodeChild`                                     | -           |

## Semantic DOM

<demo src="./demo/semantic.vue" simplify>Actions Semantic DOM</demo>

<demo src="./demo/semantic-copy.vue" simplify>ActionsCopy Semantic DOM</demo>

<demo src="./demo/semantic-feedback.vue" simplify>ActionsFeedback Semantic DOM</demo>

<demo src="./demo/semantic-audio.vue" simplify>ActionsAudio Semantic DOM</demo>

<demo src="./demo/semantic-item.vue" simplify>ActionsItem Semantic DOM</demo>
