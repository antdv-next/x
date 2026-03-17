---
title: Conversations
description: Used to switch between multiple agents, update conversation turns, and manage conversation history
---

## When To Use

- Switch between multiple agents, update conversation turns
- Need to manage multiple conversations
- View a list of historical conversations

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/controlled-mode.vue">Controlled Mode</demo>
<demo src="./demo/with-menu.vue">Operations</demo>
<demo src="./demo/menu-trigger.vue">Custom Operations</demo>
<demo src="./demo/group.vue">Group</demo>
<demo src="./demo/group-collapsible.vue">Group collapsible</demo>
<demo src="./demo/controlled-collapsible.vue"> controlled collapsible mode</demo>
<demo src="./demo/new-chat.vue">New Chat</demo>
<demo src="./demo/custom-new-chat.vue">Custom New Chat</demo>
<demo src="./demo/shortcut-keys.vue">Shortcut key Operation</demo>
<demo src="./demo/infinite-load.vue">Scrolling loaded</demo>

## API

### ConversationsProps

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `activeKey` | Currently selected value | `string \| number` | - |
| `defaultActiveKey` | Default selected value | `string \| number` | - |
| `items` | Data source for conversation list | `ItemType[]` | `[]` |
| `onActiveChange` | Callback for selection change | `(value: string \| number, item?: ItemType) => void` | - |
| `menu` | Operation menu for conversations | `ConversationsItemMenu \| ((conversation: ConversationItemType) => ConversationsItemMenu)` | - |
| `groupable` | If grouping is supported, it defaults to the `Conversation.group` field | `boolean \| GroupableProps` | - |
| `shortcutKeys` | Shortcut key operations | `{ creation?: ShortcutKeys<number>; items?: ShortcutKeys<'number'> \| ShortcutKeys<number>[] }` | - |
| `creation` | New conversation configuration | `CreationProps` | - |
| `styles` | Semantic structure styles | `Partial<Record<'root' \| 'creation' \| 'group' \| 'item', CSSProperties>>` | - |
| `classes` | Semantic structure class names | `Partial<Record<'root' \| 'creation' \| 'group' \| 'item', string>>` | - |
| `rootClassName` | Root node className | `string` | - |

### ItemType

```ts
type ItemType = ConversationItemType | DividerItemType
```

#### ConversationItemType

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `key` | Unique identifier | `string \| number` | - |
| `label` | Conversation name | `VNodeChild` | - |
| `group` | Conversation type, linked to `ConversationsProps.groupable` | `string` | - |
| `icon` | Conversation icon | `VNodeChild` | - |
| `disabled` | Whether to disable | `boolean` | - |

#### DividerItemType

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `type` | Divider type | `'divider'` | `'divider'` |
| `dashed` | Whether dashed | `boolean` | `false` |

### GroupableProps

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `label` | Group title | `VNodeChild \| ((group: string, info: { groupInfo: GroupInfoType }) => VNodeChild)` | - |
| `collapsible` | Collapsible configuration | `boolean \| ((group: string) => boolean)` | - |
| `defaultExpandedKeys` | Default expanded or collapsed groups | `string[]` | - |
| `onExpand` | Expand or collapse callback | `(expandedKeys: string[]) => void` | - |
| `expandedKeys` | Expanded group keys | `string[]` | - |

### Conversations.Creation

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `label` | Custom label content | `VNodeChild \| ((info) => VNodeChild)` | - |
| `align` | Content alignment | `'start' \| 'center' \| 'end'` | `'center'` |
| `icon` | Custom icon | `VNodeChild \| (() => VNodeChild)` | - |
| `disabled` | Disable create button | `boolean` | `false` |
| `onClick` | Click callback | `(event?: MouseEvent) => void` | - |
