---
category: Components
group:
  title: 数据流
  order: 1
title: useXConversations
order: 2
subtitle: 会话管理
description: 用于多会话的对话保持和增删改查。
packageName: x-sdk
---

## 何时使用

- 需要进行会话列表管理，包括会话创建、删除、更新等操作时使用。

## 代码演示

<!-- prettier-ignore -->
<demo src="./demos/x-conversations/basic.vue">基础使用</demo>
<demo src="./demos/x-conversations/operations.vue">会话操作</demo>
<demo src="./demos/x-conversations/multi-instances.vue">多实例</demo>
<demo src="./demos/x-conversations/with-x-chat.vue">配合 useXChat 对话消息管理</demo>
<demo src="./demos/x-conversations/async-defaultMessages.vue">请求远程历史消息</demo>
<demo src="./demos/x-conversations/session-key.vue">SessionId - ConversationKey</demo>

## API

### useXConversations

```tsx | pure
type useXConversations = (config: XConversationConfig) => {
  conversations: ConversationData[];
  activeConversationKey: string;
  setActiveConversationKey: (key: string) => boolean;
  addConversation: (
    conversation: ConversationData,
    placement?: "prepend" | "append",
  ) => boolean;
  removeConversation: (key: string) => boolean;
  setConversation: (key: string, conversation: ConversationData) => boolean;
  getConversation: (key: string) => ConversationData;
  setConversations: (conversations: ConversationData[]) => boolean;
  getMessages: (conversationKey: string) => any[];
};
```

### XConversationConfig

```tsx | pure
interface XConversationConfig {
  defaultConversations?: ConversationData[];
  defaultActiveConversationKey?: string;
}
```

### ConversationData

```tsx | pure
interface ConversationData extends AnyObject {
  key: string;
  label?: string;
}
```
