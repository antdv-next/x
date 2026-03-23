---
title: Think
subtitle: 思考
description: 用于展示 AI 深度思考过程的可折叠面板。
---

## 何时使用

当需要展示 AI 的推理过程、思维链内容时使用。

## 代码演示

<demo src="./demo/basic.vue">基本用法</demo>
<demo src="./demo/status.vue">状态控制</demo>
<demo src="./demo/expand.vue">受控展开</demo>

## API

### Think

| 属性                   | 说明                                                           | 类型                                                              | 默认值            |
| ---------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------- |
| `title`                | 状态栏标题                                                     | `VNodeChild`                                                      | -                 |
| `icon`                 | 非加载状态的自定义图标                                         | `VNodeChild`                                                      | 内置 sparkle 图标 |
| `loading`              | 加载状态，`true` 显示 spinner，传入 VNode 显示自定义加载指示器 | `VNodeChild`                                                      | `false`           |
| `expanded` (`v-model`) | 内容是否展开（受控）                                           | `boolean`                                                         | -                 |
| `defaultExpanded`      | 初始展开状态（非受控）                                         | `boolean`                                                         | `true`            |
| `blink`                | 标题文字闪烁动画                                               | `boolean`                                                         | `false`           |
| `prefixCls`            | CSS 类名前缀                                                   | `string`                                                          | `'antd-think'`    |
| `rootClass`            | 根节点 CSS 类名                                                | `string`                                                          | -                 |
| `classes`              | 语义化结构 className                                           | `Partial<Record<'root' \| 'status' \| 'content', string>>`        | -                 |
| `styles`               | 语义化结构 style                                               | `Partial<Record<'root' \| 'status' \| 'content', CSSProperties>>` | -                 |

### Think 事件

| 事件              | 说明                    | 回调参数                      |
| ----------------- | ----------------------- | ----------------------------- |
| `expand`          | 展开/折叠时触发         | `(expanded: boolean) => void` |
| `update:expanded` | 展开状态变化（v-model） | `(expanded: boolean) => void` |

### Think 插槽

| 插槽      | 说明                          |
| --------- | ----------------------------- |
| `default` | 思考内容                      |
| `title`   | 自定义标题（优先级高于 prop） |
| `icon`    | 自定义图标（优先级高于 prop） |

### Think Ref

| 属性            | 说明        | 类型             |
| --------------- | ----------- | ---------------- |
| `nativeElement` | 根 DOM 元素 | `HTMLDivElement` |

## 语义化 DOM

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
