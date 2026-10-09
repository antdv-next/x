---
title: TodoList
subtitle: 任务清单
description: 面向 Agent 任务计划的折叠清单，用形变状态图标呈现每一步的进展，全部完成后自动收起，新任务到来时重新展开。
order: 4
packageName: x-pro
---

## 何时使用 {#when-to-use}

- 当 Agent 在执行前先给出任务计划，用户需要一眼看清「在做什么、做完多少、还剩什么」时。
- 当计划条目会随执行逐步更新状态（待处理 → 进行中 → 完成 / 取消），且需要状态切换有明确的视觉反馈时。
- 当计划可能很长、需要限高滚动，并在新增步骤时自动跟随时。
- 当面板应当「完成即收起」以让出空间，但用户手动收起后不应被新任务顶开时。

## 代码演示 {#examples}

<demo src="./demo/basic.vue">基础用法</demo>
<demo src="./demo/status.vue">状态与进度</demo>
<demo src="./demo/streaming.vue">流式执行</demo>
<demo src="./demo/control.vue">受控展开</demo>
<demo src="./demo/slots.vue">自定义行内容</demo>
<demo src="./demo/semantic.vue">语义化样式</demo>

## 状态 {#status}

每个条目有四种状态，共用一个 SVG，靠状态类切换形态：

- `pending`：虚线圆，表示尚未开始；
- `in-progress`：进度弧 + 无限旋转的外圈，`progress`（0–100）控制弧长；
- `completed`：对勾，靠 `stroke-dashoffset` 描绘出来；
- `cancelled`：叉号，同样描绘出来。

状态缺省补为 `pending`。头部图标不另造一套动画，而是复用同一套图标，状态由列表派生：有任一在跑即 `in-progress`，全部进入终态时按是否有完成取 `completed` 或 `cancelled`，其余为 `pending`。

## 自动折叠与展开 {#collapse}

这是本组件最需要留意的语义：

- **折叠的触发条件是「无事可做」，而不是「全部完成」。** 计数器显示的是 `completed / total`（只数成功），但折叠发生在每一项都进入终态时——`completed` **或** `cancelled`，且列表非空。一个「3 完成 + 1 取消」的计划会收起；若严格要求字面意义上的「全部 completed」，一个已跑完的计划会永远敞着。
- **空列表不触发折叠**：没有任务可做时不代表计划已完成。
- **自动展开只撤销「自己造成的」折叠。** 组件记录当前折叠是否由自动折叠发起；用户手动切换会清掉这个标记。因此用户主动收起面板后，新增任务不会把它顶开——否则宿主无法用这一属性表达「收起」的意图。
- `collapseOnComplete` 置为 `false` 可完全关闭这套行为。

## 滚动跟随 {#scroll-follow}

新增条目时容器平滑滚动到底部，让最新任务保持可见；删除条目不会把视口甩到底部。折叠状态下不滚动。开启 `prefers-reduced-motion` 时改为即时滚动。

## API {#api}

### 属性 {#properties}

标注 ✓ 的属性支持通过 [`XProProvider`](/pro/introduction#global-config) 全局配置。

| 参数               | 说明                                                       | 类型                     | 默认值     | 版本 | 全局配置 |
| ------------------ | ---------------------------------------------------------- | ------------------------ | ---------- | ---- | -------- |
| prefixCls          | 组件样式前缀                                               | `string`                 | -          | -    | ×        |
| rootClass          | 组件根元素 class                                           | `string`                 | -          | -    | ×        |
| items              | 任务条目                                                   | `TodoItem[]`             | -          | -    | ×        |
| title              | 头部标题                                                   | `string`                 | `'To-dos'` | -    | ✓        |
| open               | 是否展开，受控，支持 `v-model:open`                        | `boolean`                | -          | -    | ✓        |
| defaultOpen        | 初始展开状态，非受控                                       | `boolean`                | `true`     | -    | ✓        |
| collapseOnComplete | 全部任务进入终态后是否自动折叠                             | `boolean`                | `true`     | -    | ✓        |
| maxHeight          | 任务列表最大高度，单位 px，超出后滚动                      | `number`                 | `248`      | -    | ✓        |
| classes            | 用于自定义组件内部各语义化结构的 class，支持对象或函数     | `TodoListClassNamesType` | -          | -    | ✓        |
| styles             | 用于自定义组件内部各语义化结构的行内 style，支持对象或函数 | `TodoListStylesType`     | -          | -    | ✓        |

### TodoItem {#todo-item}

| 字段     | 说明                                          | 类型                                                       | 默认值      |
| -------- | --------------------------------------------- | ---------------------------------------------------------- | ----------- |
| id       | 稳定标识，用于列表 diff 与滚动定位            | `string`                                                   | -           |
| title    | 任务标题                                      | `string`                                                   | -           |
| status   | 任务状态                                      | `'pending' \| 'in-progress' \| 'completed' \| 'cancelled'` | `'pending'` |
| progress | 任务进度，取值 0–100，仅 `in-progress` 下渲染 | `number`                                                   | -           |
| detail   | 行尾的紧凑元信息，例如耗时或文件数            | `string`                                                   | -           |

### 事件 {#events}

| 事件        | 说明                     | 类型                      | 版本 |
| ----------- | ------------------------ | ------------------------- | ---- |
| openChange  | 展开状态变化时触发       | `(open: boolean) => void` | -    |
| update:open | 配合 `v-model:open` 使用 | `(open: boolean) => void` | -    |

### 插槽 {#slots}

| 插槽       | 说明                          | 类型                                                                                              | 版本 |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------------------- | ---- |
| header     | 自定义头部标题                | `(slotProps: { open: boolean, completed: number, total: number, status: TodoItemStatus }) => any` | -    |
| itemTitle  | 自定义任务行标题，优先于 prop | `(slotProps: { item: TodoItem, index: number, status: TodoItemStatus }) => any`                   | -    |
| itemDetail | 自定义任务行详情，优先于 prop | `(slotProps: { item: TodoItem, index: number, status: TodoItemStatus }) => any`                   | -    |

### 方法 {#methods}

组件 `ref` 会暴露以下实例能力：

| 名称            | 说明         | 参数                                                | 版本 |
| --------------- | ------------ | --------------------------------------------------- | ---- |
| setOpen         | 设置展开状态 | `(open: boolean) => void`                           | -    |
| scrollToEnd     | 滚动到底部   | `(options?: { behavior?: ScrollBehavior }) => void` | -    |
| open            | 当前是否展开 | `boolean`                                           | -    |
| nativeElement   | 组件根元素   | `HTMLElement \| null`                               | -    |
| viewportElement | 滚动容器     | `HTMLElement \| null`                               | -    |

## 语义化 DOM {#semantic-dom}

<demo src="./demo/_semantic.vue" simplify></demo>
