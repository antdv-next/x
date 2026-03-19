---
title: Bubble
subtitle: 对话气泡
description: 用于聊天消息展示的气泡组件。
---

## 何时使用

常用于聊天的时候。

## 代码演示

<demo src="./demo/basic.vue">基本</demo>
<demo src="./demo/variant-and-shape.vue">变体与形状</demo>
<demo src="./demo/sider-and-placement.vue">边栏与位置</demo>
<demo src="./demo/system.vue">系统信息气泡</demo>
<demo src="./demo/divider.vue">分割线气泡</demo>
<demo src="./demo/header.vue">气泡头</demo>
<demo src="./demo/footer.vue">气泡尾</demo>
<demo src="./demo/loading.vue">加载中</demo>
<demo src="./demo/animation.vue">动画</demo>
<demo src="./demo/stream.vue">流式传输</demo>
<demo src="./demo/custom-content.vue">自定义渲染内容</demo>
<demo src="./demo/markdown.vue">渲染markdown内容</demo>
<demo src="./demo/gpt-vis.vue">使用 GPT-Vis 渲染图表</demo>
<demo src="./demo/editable.vue">可编辑气泡</demo>

## 列表演示

<demo src="./demo/list.vue">气泡列表</demo>
<demo src="./demo/list-scroll.vue">滚动条控制</demo>
<demo src="./demo/semantic-list-custom.vue">语义化自定义</demo>
<demo src="./demo/list-extra.vue">列表扩展参数</demo>

## API

### Bubble

| 属性                         | 说明                 | 类型                                                                                                           | 默认值           |
| ---------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------- |
| `content`                    | 气泡内容             | `string \| number \| VNode \| object`                                                                          | -                |
| `placement`                  | 气泡位置             | `'start' \| 'end'`                                                                                             | `'start'`        |
| `variant`                    | 气泡样式变体         | `'filled' \| 'outlined' \| 'shadow' \| 'borderless'`                                                           | `'filled'`       |
| `shape`                      | 气泡形状             | `'default' \| 'round' \| 'corner'`                                                                             | `'default'`      |
| `loading`                    | 加载状态             | `boolean`                                                                                                      | `false`          |
| `typing`                     | 打字动画配置         | `boolean \| BubbleAnimationOption \| ((content, info) => ...)`                                                 | `false`          |
| `streaming`                  | 流式传输标记         | `boolean`                                                                                                      | `false`          |
| `editable`                   | 是否可编辑           | `boolean \| EditableBubbleOption`                                                                              | `false`          |
| `contentRender`              | 自定义内容渲染       | `(content, info) => VNodeChild`                                                                                | -                |
| `classes`                    | 语义化结构 className | `Partial<Record<'root' \| 'body' \| 'avatar' \| 'header' \| 'content' \| 'footer' \| 'extra', string>>`        | -                |
| `styles`                     | 语义化结构 style     | `Partial<Record<'root' \| 'body' \| 'avatar' \| 'header' \| 'content' \| 'footer' \| 'extra', CSSProperties>>` | -                |
| `header/footer/avatar/extra` | 插槽属性（支持函数） | `BubbleSlot`                                                                                                   | -                |
| `footerPlacement`            | 底部插槽位置         | `'outer-start' \| 'outer-end' \| 'inner-start' \| 'inner-end'`                                                 | 跟随 `placement` |
| `onTyping`                   | 动画过程回调         | `(renderedContent, currentContent) => void`                                                                    | -                |
| `onTypingComplete`           | 动画结束回调         | `(content) => void`                                                                                            | -                |
| `onEditConfirm`              | 编辑确认回调         | `(content) => void`                                                                                            | -                |
| `onEditCancel`               | 编辑取消回调         | `() => void`                                                                                                   | -                |

> 推荐优先使用 `BubbleList`、`BubbleSystem`、`BubbleDivider` 导出。`Bubble.List`、`Bubble.System`、`Bubble.Divider` 旧写法仍兼容。

### BubbleList

| 属性         | 说明                        | 类型                                                                                                                                                            | 默认值 |
| ------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `items`      | 列表数据，`key`/`role` 必填 | `BubbleItemType[]`                                                                                                                                              | -      |
| `autoScroll` | 新消息时自动滚动到底部      | `boolean`                                                                                                                                                       | `true` |
| `role`       | 不同角色默认配置            | `RoleType`                                                                                                                                                      | -      |
| `onScroll`   | 滚动事件回调                | `(event) => void`                                                                                                                                               | -      |
| `classes`    | 语义化结构 className        | `Partial<Record<'root' \| 'scroll' \| 'bubble' \| 'body' \| 'avatar' \| 'header' \| 'content' \| 'footer' \| 'extra' \| 'system' \| 'divider', string>>`        | -      |
| `styles`     | 语义化结构 style            | `Partial<Record<'root' \| 'scroll' \| 'bubble' \| 'body' \| 'avatar' \| 'header' \| 'content' \| 'footer' \| 'extra' \| 'system' \| 'divider', CSSProperties>>` | -      |

`BubbleList` 暴露 `scrollTo`：

```ts
scrollTo(options: {
  key?: string | number
  top?: number | 'top' | 'bottom'
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
}): void
```

### BubbleSystem

基于 `Bubble` 的系统消息形态，默认 `variant='shadow'`。

| 属性      | 说明                 | 类型                                                            | 默认值 |
| --------- | -------------------- | --------------------------------------------------------------- | ------ |
| `classes` | 语义化结构 className | `Partial<Record<'root' \| 'body' \| 'content', string>>`        | -      |
| `styles`  | 语义化结构 style     | `Partial<Record<'root' \| 'body' \| 'content', CSSProperties>>` | -      |

### BubbleDivider

基于 `Bubble` 的分割线形态，通过 `dividerProps` 透传 `Divider` 参数。

| 属性      | 说明                 | 类型                                                            | 默认值 |
| --------- | -------------------- | --------------------------------------------------------------- | ------ |
| `classes` | 语义化结构 className | `Partial<Record<'root' \| 'body' \| 'content', string>>`        | -      |
| `styles`  | 语义化结构 style     | `Partial<Record<'root' \| 'body' \| 'content', CSSProperties>>` | -      |

## 语义化 DOM

<demo src="./demo/semantic.vue" simplify>Bubble 语义结构</demo>

<demo src="./demo/semantic-system.vue" simplify>BubbleSystem 语义结构</demo>

<demo src="./demo/semantic-divider.vue" simplify>BubbleDivider 语义结构</demo>

<demo src="./demo/semantic-list.vue" simplify>BubbleList 语义结构</demo>
