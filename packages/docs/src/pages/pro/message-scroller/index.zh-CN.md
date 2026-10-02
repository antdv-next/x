---
title: MessageScroller
subtitle: 会话流式滚动容器
description: 面向 Agent 会话的流式滚动容器，内容流入时自动贴底，读者上滑即脱离跟随，并可用消息导航导轨快速定位历史。
order: 2
packageName: x-pro
---

## 何时使用 {#when-to-use}

- 当消息列表由高频流式生成驱动，需要视口始终钉在最新内容上时。
- 当宿主应用需要感知用户是否仍停留在最新位置，以驱动「回到最新」、「未读计数」或侧边导轨联动时。
- 当会话内容不局限于标准气泡，还包含思考链、工具调用卡片、代码沙箱等异构节点时。
- 当需要从外部命令式定位到某条历史消息，或恢复自动跟随时。

## 代码演示 {#examples}

<demo src="./demo/basic.vue">基础用法</demo>
<demo src="./demo/follow.vue">跟随状态</demo>
<demo src="./demo/rail.vue">消息导航导轨</demo>
<demo src="./demo/controller.vue">命令式滚动控制</demo>
<demo src="./demo/slots.vue">自定义导轨与预览</demo>
<demo src="./demo/semantic.vue">语义化样式</demo>

## 跟随状态 {#following}

组件把「是否停留在最新位置」作为一等状态对外暴露：

- 视口是原生 `overflow-y: auto` 容器，`wheel`、`touchstart`、方向键与滚动事件都会参与状态判定；
- 距离底部小于 `followThreshold` 时回到跟随态，超过阈值即为脱离态；
- **脱离态下，流式内容继续推入导致的高度变化不会移动视口**，历史阅读不被打扰；
- 滚动条自身也承担滚动职责，因此滚轮、拖动原生滚动条、触摸惯性滚动与键盘滚动都会被识别；
- 状态变化通过 `followChange` 事件与 `v-model:follow` 双向绑定对外同步。

## 消息导航导轨 {#navigation-rail}

`navigation="rail"` 开启后：

- 导轨按 `itemSelector` 扫描视口中的消息节点，并依据 `items` 元数据生成预览内容，未提供元数据时退化为节点文本；
- 刻度按与激活项的索引距离衰减：距离 0 取 1，距离 1 取 0.68，距离 2 取 0.44，更远取 0.25；
- 预览卡片是单例，通过 `translateY` 在各激活项之间连续滑动，不会为每条消息重复创建 DOM；
- 激活项优先级为 `hovered ?? pinned ?? focused ?? active`：刻度高亮遵循该优先级，预览卡片只在悬停、触屏锁定或键盘聚焦时出现；
- 触屏点击会锁定预览卡片，点击导轨外才解除；
- 导轨开启时视口内部隐藏原生滚动条并预留右侧安全间距，消息数量超出可视高度时导轨单项高度自动压缩。

## API {#api}

### 属性 {#properties}

标注 ✓ 的属性支持通过 [`XProProvider`](/pro-cn#global-config) 全局配置。

| 参数            | 说明                                                       | 类型                            | 默认值                | 版本 | 全局配置 |
| --------------- | ---------------------------------------------------------- | ------------------------------- | --------------------- | ---- | -------- |
| prefixCls       | 组件样式前缀                                               | `string`                        | -                     | -    | ×        |
| rootClass       | 组件根元素 class                                           | `string`                        | -                     | -    | ×        |
| follow          | 是否处于跟随状态，受控，支持 `v-model:follow`              | `boolean`                       | -                     | -    | ✓        |
| followThreshold | 判定视口处于底部的距离阈值，单位 px                        | `number`                        | `56`                  | -    | ✓        |
| smooth          | 内容流入时是否使用平滑滚动贴底                             | `boolean`                       | `true`                | -    | ✓        |
| busy            | 内容仍在流式流入，映射为 `aria-busy`                       | `boolean`                       | -                     | -    | ✓        |
| navigation      | 开启消息导航导轨                                           | `'rail'`                        | -                     | -    | ✓        |
| items           | 导轨预览项元数据，按 `id` 关联到消息节点                   | `MessageScrollerItem[]`         | -                     | -    | ✓        |
| itemSelector    | 定位消息 DOM 节点的选择器，属性值即导轨项 `id`             | `string`                        | `'[data-message-id]'` | -    | ✓        |
| backToBottom    | 脱离跟随时是否展示回到最新按钮                             | `boolean`                       | `false`               | -    | ✓        |
| classes         | 用于自定义组件内部各语义化结构的 class，支持对象或函数     | `MessageScrollerClassNamesType` | -                     | -    | ✓        |
| styles          | 用于自定义组件内部各语义化结构的行内 style，支持对象或函数 | `MessageScrollerStylesType`     | -                     | -    | ✓        |

### 事件 {#events}

| 事件           | 说明                       | 类型                                                         | 版本 |
| -------------- | -------------------------- | ------------------------------------------------------------ | ---- |
| followChange   | 跟随状态变化时触发         | `(following: boolean) => void`                               | -    |
| update:follow  | 配合 `v-model:follow` 使用 | `(following: boolean) => void`                               | -    |
| scroll         | 视口滚动时触发             | `(event: Event) => void`                                     | -    |
| railItemSelect | 选中导轨消息项时触发       | `(id: string \| number, item?: MessageScrollerItem) => void` | -    |

### 插槽 {#slots}

| 插槽         | 说明                                             | 类型                                                                                               | 版本 |
| ------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ---- |
| default      | 会话内容，消息节点需带 `itemSelector` 指向的属性 | `() => any`                                                                                        | -    |
| railItem     | 自定义导轨刻度项                                 | `(slotProps: { item: MessageScrollerItem, active: boolean, index: number, scale: number }) => any` | -    |
| preview      | 自定义导轨预览卡片内容                           | `(slotProps: { item: MessageScrollerItem, index: number }) => any`                                 | -    |
| backToBottom | 自定义回到最新按钮                               | `(slotProps: { scrollToEnd: () => void, following: boolean }) => any`                              | -    |

### 方法 {#methods}

组件 `ref` 会暴露以下实例能力：

| 名称            | 说明                                 | 参数                                                                  | 版本 |
| --------------- | ------------------------------------ | --------------------------------------------------------------------- | ---- |
| scrollToEnd     | 滚动到底部                           | `(options?: { behavior?: ScrollBehavior })`                           | -    |
| scrollToItem    | 定位到指定消息，居中显示             | `(target: string \| number, options?: { behavior?: ScrollBehavior })` | -    |
| setFollowing    | 设置跟随状态，设为 `true` 时同时贴底 | `(following: boolean) => void`                                        | -    |
| following       | 当前是否处于跟随状态                 | `boolean`                                                             | -    |
| nativeElement   | 组件根元素                           | `HTMLElement \| null`                                                 | -    |
| viewportElement | 原生滚动视口元素                     | `HTMLElement \| null`                                                 | -    |
| contentElement  | 视口内容层元素                       | `HTMLElement \| null`                                                 | -    |

## 语义化 DOM {#semantic-dom}

<demo src="./demo/_semantic.vue" simplify></demo>
