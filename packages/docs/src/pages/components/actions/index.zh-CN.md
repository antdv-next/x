---
title: Actions
subtitle: 操作列表
description: 用于快速配置 AI 场景中常见的消息操作。
---

## 何时使用

Actions 组件用于快速配置一些 AI 场景下所需要的操作按钮/功能

## 代码演示

<demo src="./demo/basic.vue">基本</demo>
<demo src="./demo/sub.vue">更多菜单项</demo>
<demo src="./demo/preset.vue">预设模板</demo>
<demo src="./demo/variant.vue">使用变体</demo>
<demo src="./demo/fade-in.vue">渐入效果</demo>

## API

### Actions

| 属性            | 说明                            | 类型                                                                 | 默认值         |
| --------------- | ------------------------------- | -------------------------------------------------------------------- | -------------- |
| `items`         | 操作项列表                      | `ItemType[]`                                                         | `[]`           |
| `onClick`       | 点击操作项回调                  | `({ item, key, keyPath, domEvent }) => void`                         | -              |
| `dropdownProps` | 下拉菜单参数（透传 `Dropdown`） | `DropdownProps`                                                      | -              |
| `variant`       | 变体                            | `'borderless' \| 'filled' \| 'outlined'`                             | `'borderless'` |
| `fadeIn`        | 开启渐入动画                    | `boolean`                                                            | `false`        |
| `fadeInLeft`    | 开启从左到右渐入动画            | `boolean`                                                            | `false`        |
| `classes`       | 语义化 className                | `Partial<Record<'root' \| 'item' \| 'itemDropdown', string>>`        | -              |
| `styles`        | 语义化 style                    | `Partial<Record<'root' \| 'item' \| 'itemDropdown', CSSProperties>>` | -              |

> 推荐优先使用 `ActionsCopy`、`ActionsFeedback`、`ActionsAudio`、`ActionsItem` 导出。`Actions.Copy`、`Actions.Feedback`、`Actions.Audio`、`Actions.Item` 旧写法仍兼容。

推荐写法：

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

| 属性                   | 说明                                     | 类型                                                                       | 默认值    |
| ---------------------- | ---------------------------------------- | -------------------------------------------------------------------------- | --------- |
| `key`                  | 操作项唯一标识                           | `string \| number`                                                         | -         |
| `label`                | 操作项提示文本                           | `string`                                                                   | -         |
| `icon`                 | 操作项图标                               | `VNodeChild`                                                               | -         |
| `onItemClick`          | 单项点击回调（优先于 `Actions.onClick`） | `(info?: ItemType) => void`                                                | -         |
| `danger`               | 危险态                                   | `boolean`                                                                  | `false`   |
| `subItems`             | 子操作项                                 | `Omit<ItemType, 'subItems' \| 'triggerSubMenuAction' \| 'actionRender'>[]` | -         |
| `triggerSubMenuAction` | 子菜单触发方式                           | `'hover' \| 'click'`                                                       | `'hover'` |
| `actionRender`         | 自定义渲染操作项                         | `VNodeChild \| ((item: ItemType) => VNodeChild)`                           | -         |

### ActionsFeedback

| 属性       | 说明             | 类型                               | 默认值      |
| ---------- | ---------------- | ---------------------------------- | ----------- |
| `value`    | 反馈状态值       | `'like' \| 'dislike' \| 'default'` | `'default'` |
| `onChange` | 反馈状态变化回调 | `(value) => void`                  | -           |

### ActionsCopy

| 属性   | 说明     | 类型         | 默认值 |
| ------ | -------- | ------------ | ------ |
| `text` | 复制文本 | `string`     | `''`   |
| `icon` | 复制图标 | `VNodeChild` | -      |

### ActionsAudio

| 属性     | 说明     | 类型                                             | 默认值      |
| -------- | -------- | ------------------------------------------------ | ----------- |
| `status` | 音频状态 | `'loading' \| 'error' \| 'running' \| 'default'` | `'default'` |

### ActionsItem

| 属性          | 说明     | 类型                                             | 默认值      |
| ------------- | -------- | ------------------------------------------------ | ----------- |
| `status`      | 状态     | `'loading' \| 'error' \| 'running' \| 'default'` | `'default'` |
| `label`       | 提示文本 | `string`                                         | -           |
| `defaultIcon` | 默认图标 | `VNodeChild`                                     | -           |
| `runningIcon` | 运行图标 | `VNodeChild`                                     | -           |

## 语义化 DOM

<demo src="./demo/semantic.vue" simplify>Actions 语义结构</demo>

<demo src="./demo/semantic-copy.vue" simplify>ActionsCopy 语义结构</demo>

<demo src="./demo/semantic-feedback.vue" simplify>ActionsFeedback 语义结构</demo>

<demo src="./demo/semantic-audio.vue" simplify>ActionsAudio 语义结构</demo>

<demo src="./demo/semantic-item.vue" simplify>ActionsItem 语义结构</demo>
