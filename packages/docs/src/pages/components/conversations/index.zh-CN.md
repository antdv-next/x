---
title: Conversations
subtitle: 管理对话
description: 用于切换多个智能体，更新对话轮次，对话历史切换
---

## 何时使用

- 切换多个智能体，更新对话轮次
- 需要对多个会话进行管理
- 查看历史会话列表

## 代码演示

<demo src="./demo/basic.vue">基本</demo>
<demo src="./demo/controlled-mode.vue">受控模式</demo>
<demo src="./demo/with-menu.vue">会话操作</demo>
<demo src="./demo/menu-trigger.vue">自定义操作</demo>
<demo src="./demo/group.vue">分组展示</demo>
<demo src="./demo/group-collapsible.vue">分组折叠展示</demo>
<demo src="./demo/controlled-collapsible.vue">折叠受控模式</demo>
<demo src="./demo/new-chat.vue">新会话</demo>
<demo src="./demo/custom-new-chat.vue">自定义新会话</demo>
<demo src="./demo/shortcut-keys.vue">快捷键操作</demo>
<demo src="./demo/infinite-load.vue">滚动加载</demo>

## API

### ConversationsProps

| 属性               | 说明                                                     | 类型                                                                                            | 默认值 |
| ------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| `activeKey`        | 当前选中的值                                             | `string \| number`                                                                              | -      |
| `defaultActiveKey` | 初始化选中的值                                           | `string \| number`                                                                              | -      |
| `items`            | 会话列表数据源                                           | `ItemType[]`                                                                                    | `[]`   |
| `onActiveChange`   | 选中变更回调                                             | `(value: string \| number, item?: ItemType) => void`                                            | -      |
| `menu`             | 会话操作菜单                                             | `ConversationsItemMenu \| ((conversation: ConversationItemType) => ConversationsItemMenu)`      | -      |
| `groupable`        | 是否支持分组, 开启后默认按 `Conversation.group` 字段分组 | `boolean \| GroupableProps`                                                                     | -      |
| `shortcutKeys`     | 快捷键操作                                               | `{ creation?: ShortcutKeys<number>; items?: ShortcutKeys<'number'> \| ShortcutKeys<number>[] }` | -      |
| `creation`         | 新会话操作配置                                           | `CreationProps`                                                                                 | -      |
| `styles`           | 语义化结构 style                                         | `Partial<Record<'root' \| 'creation' \| 'group' \| 'item', CSSProperties>>`                     | -      |
| `classes`          | 语义化结构 className                                     | `Partial<Record<'root' \| 'creation' \| 'group' \| 'item', string>>`                            | -      |
| `rootClass`        | 根节点类名                                               | `string`                                                                                        | -      |

### ItemType

```ts
type ItemType = ConversationItemType | DividerItemType;
```

#### ConversationItemType

| 属性       | 说明                                                 | 类型               | 默认值 |
| ---------- | ---------------------------------------------------- | ------------------ | ------ |
| `key`      | 唯一标识                                             | `string \| number` | -      |
| `label`    | 会话名称                                             | `VNodeChild`       | -      |
| `group`    | 会话分组类型，与 `ConversationsProps.groupable` 联动 | `string`           | -      |
| `icon`     | 会话图标                                             | `VNodeChild`       | -      |
| `disabled` | 是否禁用                                             | `boolean`          | -      |

#### DividerItemType

| 属性     | 说明           | 类型        | 默认值      |
| -------- | -------------- | ----------- | ----------- |
| `type`   | 会话列表分割线 | `'divider'` | `'divider'` |
| `dashed` | 是否虚线       | `boolean`   | `false`     |

### GroupableProps

| 属性                  | 说明            | 类型                                                                                | 默认值 |
| --------------------- | --------------- | ----------------------------------------------------------------------------------- | ------ |
| `label`               | 分组标题        | `VNodeChild \| ((group: string, info: { groupInfo: GroupInfoType }) => VNodeChild)` | -      |
| `collapsible`         | 可折叠配置      | `boolean \| ((group: string) => boolean)`                                           | -      |
| `defaultExpandedKeys` | 默认展开或收起  | `string[]`                                                                          | -      |
| `onExpand`            | 展开或收起回调  | `(expandedKeys: string[]) => void`                                                  | -      |
| `expandedKeys`        | 展开分组的 keys | `string[]`                                                                          | -      |

### Conversations.Creation

| 属性       | 说明               | 类型                                   | 默认值     |
| ---------- | ------------------ | -------------------------------------- | ---------- |
| `label`    | 自定义文本内容     | `VNodeChild \| ((info) => VNodeChild)` | -          |
| `align`    | 内容对齐方式       | `'start' \| 'center' \| 'end'`         | `'center'` |
| `icon`     | 自定义图标         | `VNodeChild \| (() => VNodeChild)`     | -          |
| `disabled` | 是否禁用新会话按钮 | `boolean`                              | `false`    |
| `onClick`  | 点击回调           | `(event?: MouseEvent) => void`         | -          |

## 语义化 DOM

<demo src="./demo/semantic.vue" simplify>Conversations 语义结构</demo>
