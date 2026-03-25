---
category: Components
group:
  title: 唤醒
  order: 1
title: Welcome
subtitle: 欢迎
description: 用于展示欢迎语、能力说明和附加操作。
---

## 何时使用

- 用于应用首页、空态页或对话入口，帮助用户快速理解当前产品能力。

## 代码演示

<demo src="./demo/basic.vue">基础用法</demo>
<demo src="./demo/variant.vue">变体</demo>
<demo src="./demo/background.vue">背景定制</demo>

## API

### WelcomeProps

| 属性          | 说明                                     | 类型                                                                                      | 默认值     |
| ------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| `icon`        | 左侧图标，传入图片地址时会自动渲染为图片 | `VNodeChild`                                                                              | -          |
| `title`       | 标题内容                                 | `VNodeChild`                                                                              | -          |
| `description` | 描述内容                                 | `VNodeChild`                                                                              | -          |
| `extra`       | 右侧附加操作区域                         | `VNodeChild`                                                                              | -          |
| `variant`     | 视觉变体                                 | `'filled' \| 'borderless'`                                                                | `'filled'` |
| `rootClass`   | 根节点类名                               | `string`                                                                                  | -          |
| `classes`     | 语义化 class                             | `Partial<Record<'root' \| 'title' \| 'description' \| 'icon' \| 'extra', string>>`        | -          |
| `styles`      | 语义化 style                             | `Partial<Record<'root' \| 'title' \| 'description' \| 'icon' \| 'extra', CSSProperties>>` | -          |

## 语义化 DOM {#semantic-dom}

<demo src="./demo/semantic.vue" simplify>Welcome 语义结构</demo>
