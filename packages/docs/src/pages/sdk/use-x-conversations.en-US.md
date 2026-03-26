---
category: Components
group:
  title: Data Flow
  order: 1
title: useXConversations
order: 2
description: Manage conversation persistence and CRUD operations for multiple sessions.

packageName: x-sdk
---

## When To Use

- Use when you need to manage conversation lists, including operations like creating, deleting, and updating conversations.

## Code Demo

<!-- prettier-ignore -->
<demo src="./demo/x-conversations-basic.vue">Basic Usage</demo>
<demo src="./demo/x-conversations-operations.vue">Conversation Operations</demo>
<demo src="./demo/x-conversations-multi-instances.vue">Multiple Instances</demo>
<demo src="./demo/x-conversations-with-x-chat.vue">Integration with `useXChat` for message management</demo>
<demo src="./demo/x-conversations-async-defaultMessages.vue">Request Remote Historical Messages</demo>
<demo src="./demo/x-conversations-session-key.vue">SessionId - ConversationKey</demo>

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
