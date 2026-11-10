### 1. Message Management

#### Get Message List

```ts
const { messages } = useXChat({ provider });
// messages is a Vue Ref: Ref<MessageInfo<MessageType>[]>
// Access via messages.value
// Actual message data is in msg.message
```

#### Manually Set Messages

```ts
const { setMessages } = useXChat({ provider });

// Clear messages
setMessages([]);

// Add welcome message - note it's MessageInfo structure
setMessages([
  {
    id: "welcome",
    message: {
      content: "Welcome to AI Assistant",
      role: "assistant",
    },
    status: "success",
  },
]);

// Updater form: receives the current list and returns the next one
setMessages(prev => [...prev, welcomeMessage]);
```

`setMessages` returns a boolean indicating whether the update was applied.

#### Update Single Message

```ts
const { setMessage } = useXChat({ provider });

// Update message content - need to update message object
setMessage("msg-id", {
  message: { content: "New content", role: "assistant" },
});

// Mark as error - update status
setMessage("msg-id", { status: "error" });

// Updater form
setMessage("msg-id", prev => ({ ...prev, status: "success" }));
```

`setMessage` and `removeMessage` also return booleans.

### 2. Request Control

#### Send Message

```ts
const { onRequest } = useXChat({ provider });

// Basic usage
onRequest({ query: "User question" });

// With additional parameters
onRequest({
  query: "User question",
  context: "Previous conversation content",
  userId: "user123",
});
```

#### Abort Request

```tsx
const { abort, isRequesting } = useXChat({ provider });

// In Vue template or TSX render function
<button onClick={abort} disabled={!isRequesting.value}>
  Stop generation
</button>;
```

#### Resend

The resend feature allows users to regenerate replies for specific messages, which is very useful when AI answers are unsatisfactory or errors occur.

#### Basic Usage

```tsx
import { useXChat } from "@antdv-next/x-sdk";
import { defineComponent } from "vue";

const ChatComponent = defineComponent(() => {
  const { messages, onReload } = useXChat({ provider });

  return () => (
    <div>
      {messages.value.map(msg => (
        <div key={msg.id}>
          <span>{msg.message.content}</span>
          {msg.message.role === "assistant" && (
            <button onClick={() => onReload(msg.id, {})}>Regenerate</button>
          )}
        </div>
      ))}
    </div>
  );
});
```

#### Resend Notes

1. **Can only regenerate AI replies**: Usually can only use resend on messages with `role === 'assistant'`
2. **Status management**: Resend will set the corresponding message status to `loading`
3. **Parameter passing**: `onReload(id, requestParams, { extraInfo })` — `requestParams` is required (pass `{}` if none), and `extraInfo` is stored on the message for your own bookkeeping
4. **Error handling**: It is recommended to use `requestFallback` to handle resend failures

### 3. Error Handling

#### Unified Error Handling

```ts
const { messages } = useXChat({
  provider,
  requestFallback: (_, { error, errorInfo, messageInfo }) => {
    // Network error
    if (!navigator.onLine) {
      return {
        content: "Network connection failed, please check network",
        role: "assistant" as const,
      };
    }

    // User interruption
    if (error.name === "AbortError") {
      return {
        content: messageInfo?.message?.content || "Reply cancelled",
        role: "assistant" as const,
      };
    }

    // Server error
    return {
      content:
        errorInfo?.message ||
        errorInfo?.error?.message ||
        error.message ||
        "Network error, please try again later",
      role: "assistant" as const,
    };
  },
});
```

### 4. Message Display During Request

Generally no configuration is needed, default use with Bubble component's loading state. For custom loading content, refer to:

```tsx
import { useXChat } from "@antdv-next/x-sdk";
import { defineComponent } from "vue";

const ChatComponent = defineComponent(() => {
  const { messages, onRequest } = useXChat({ provider });

  return () => (
    <div>
      {messages.value.map(msg => (
        <div key={msg.id}>
          {msg.message.role}: {msg.message.content}
        </div>
      ))}
      <button onClick={() => onRequest({ query: "Hello" })}>Send</button>
    </div>
  );
});
```

#### Custom Request Placeholder

When requestPlaceholder is set, placeholder messages will be displayed before the request starts, used with Bubble component's loading state.

```ts
const { messages } = useXChat({
  provider,
  requestPlaceholder: (_, { messages }) => {
    return {
      content: messages.length > 0 ? "Generating..." : "Thinking...",
      role: "assistant",
    };
  },
});
```

The placeholder function receives `{ messages }` only — it does not receive the error. Use `requestFallback` for error information.

### 5. Multi-conversation Management

Use `conversationKey` to isolate message stores, and `useXConversations` to manage the conversation list:

```ts
import { useXChat, useXConversations } from "@antdv-next/x-sdk";

const {
  conversations,
  activeConversationKey,
  addConversation,
  removeConversation,
  setActiveConversationKey,
} = useXConversations({
  defaultConversations: [{ key: "1", label: "New conversation" }],
  defaultActiveConversationKey: "1",
});

const { messages, onRequest, queueRequest } = useXChat({
  provider,
  conversationKey: activeConversationKey,
});
```

- Changing `activeConversationKey` switches the message store that `useXChat` exposes.
- `queueRequest(activeConversationKey.value, params)` waits until the conversation's async `defaultMessages` finish loading before sending.
- `isDefaultMessagesRequesting` is useful for disabling the sender while history loads.
- Conversations created by `useXConversations` are shared across `useXChat` instances that use the same key.
