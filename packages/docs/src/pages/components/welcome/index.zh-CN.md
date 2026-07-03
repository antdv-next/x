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
<demo src="./demo/slot.vue">插槽内容</demo>

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

### Slots

| 插槽名        | 说明             | 类型               |
| ------------- | ---------------- | ------------------ |
| `icon`        | 自定义左侧图标   | `() => VNodeChild` |
| `title`       | 自定义标题内容   | `() => VNodeChild` |
| `description` | 自定义描述内容   | `() => VNodeChild` |
| `extra`       | 自定义附加操作区 | `() => VNodeChild` |

插槽渲染优先级：对应插槽 > 对应 prop。

## 语义化 DOM {#semantic-dom}

<demo src="./demo/semantic.vue" simplify>Welcome 语义结构</demo>

## 主题变量（Design Token）

<ComponentTokenTable component="Welcome"></ComponentTokenTable>

查看 [定制主题](/docs/customize-theme) 了解如何使用主题变量。
