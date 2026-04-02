# Complete Example Projects

## Project with Conversation Management

```tsx
import { defineComponent, ref } from "vue";
import { useXChat } from "@antdv-next/x-sdk";
import { chatProvider } from "../services/chatService";
import type { ChatMessage } from "../providers/ChatProvider";
import {
  Bubble,
  Sender,
  Conversations,
  type ConversationsProps,
} from "@antdv-next/x";

const App = defineComponent(() => {
  const conversations = ref([{ key: "1", label: "New Conversation" }]);
  const activeKey = ref("1");
  const senderRef = ref<InstanceType<typeof Sender> | null>(null);

  // Create new conversation
  const handleNewConversation = () => {
    const newKey = Date.now().toString();
    conversations.value.push({
      key: newKey,
      label: `Conversation ${conversations.value.length + 1}`,
    });
    activeKey.value = newKey;
  };

  // Delete conversation
  const handleDeleteConversation = (key: string) => {
    const filtered = conversations.value.filter(item => item.key !== key);
    if (filtered.length === 0) {
      const newKey = Date.now().toString();
      conversations.value = [{ key: newKey, label: "New Conversation" }];
    } else {
      conversations.value = filtered;
    }

    if (activeKey.value === key) {
      activeKey.value = conversations.value[0]?.key || "1";
    }
  };

  const { messages, onRequest, isRequesting, abort } = useXChat<
    ChatMessage,
    ChatMessage,
    { query: string },
    { content: string; time: string; status: "success" | "error" }
  >({
    provider: chatProvider,
    conversationKey: activeKey,
    requestFallback: (_, { error }) => {
      if (error.name === "AbortError") {
        return {
          content: "Cancelled",
          role: "assistant" as const,
          timestamp: Date.now(),
        };
      }
      return {
        content: "Request failed",
        role: "assistant" as const,
        timestamp: Date.now(),
      };
    },
  });

  const menuConfig: ConversationsProps["menu"] = conversation => ({
    items: [
      {
        label: "Delete",
        key: "delete",
        danger: true,
      },
    ],
    onClick: ({ key: menuKey }) => {
      if (menuKey === "delete") {
        handleDeleteConversation(conversation.key);
      }
    },
  });

  return () => (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Conversation List */}
      <div
        style={{
          width: "240px",
          borderRight: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Conversations
          creation={{
            onClick: handleNewConversation,
          }}
          items={conversations.value}
          activeKey={activeKey.value}
          menu={menuConfig}
          onActiveChange={key => {
            activeKey.value = key;
          }}
        />
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            fontSize: "16px",
            fontWeight: 500,
          }}
        >
          {conversations.value.find(c => c.key === activeKey.value)?.label ||
            "Conversation"}
        </div>

        <div style={{ flex: 1, padding: "16px", overflow: "auto" }}>
          <Bubble.List
            role={{
              assistant: {
                placement: "start",
              },
              user: {
                placement: "end",
              },
            }}
            items={messages.value.map(msg => ({
              key: msg.id,
              content: msg.message.content,
              role: msg.message.role,
              loading: msg.status === "loading",
            }))}
          />
        </div>

        <div style={{ padding: "16px", borderTop: "1px solid #f0f0f0" }}>
          <Sender
            loading={isRequesting.value}
            ref={senderRef}
            onSubmit={(content: string) => {
              onRequest({ query: content });
              senderRef.value?.clear?.();
            }}
            onCancel={abort}
            placeholder="Enter message..."
          />
        </div>
      </div>
    </div>
  );
});

export default App;
```

## With State Management Resend

```tsx
import { defineComponent, ref } from "vue";
import { useXChat } from "@antdv-next/x-sdk";
import { Bubble, Sender } from "@antdv-next/x";
import { Button } from "antdv-next";
import { chatProvider } from "../services/chatService";
import type { ChatMessage } from "../providers/ChatProvider";

const ChatWithRegenerate = defineComponent(() => {
  const senderRef = ref<InstanceType<typeof Sender> | null>(null);
  const { messages, onReload, isRequesting, onRequest, abort } = useXChat<
    ChatMessage,
    ChatMessage,
    { query: string },
    { content: string; time: string; status: "success" | "error" }
  >({
    provider: chatProvider,
    requestPlaceholder: {
      content: "Thinking...",
      role: "assistant",
      timestamp: Date.now(),
    },
    requestFallback: (_, { error, errorInfo, messageInfo }) => {
      if (error.name === "AbortError") {
        return {
          content: messageInfo?.message?.content || "Reply cancelled",
          role: "assistant" as const,
          timestamp: Date.now(),
        };
      }
      return {
        content:
          errorInfo?.error?.message || "Network error, please try again later",
        role: "assistant" as const,
        timestamp: Date.now(),
      };
    },
  });

  // Track message ID being regenerated
  const regeneratingId = ref<string | number | null>(null);

  const handleRegenerate = (messageId: string | number): void => {
    regeneratingId.value = messageId;
    onReload(
      messageId,
      {},
      {
        extraInfo: { regenerate: true },
      },
    );
  };

  return () => (
    <div>
      <Bubble.List
        role={{
          assistant: {
            placement: "start",
          },
          user: {
            placement: "end",
          },
        }}
        items={messages.value.map(msg => ({
          key: msg.id,
          content: msg.message.content,
          role: msg.message.role,
          loading: msg.status === "loading",
          footer: msg.message.role === "assistant" && (
            <Button
              type="text"
              size="small"
              loading={regeneratingId.value === msg.id && isRequesting.value}
              onClick={() => handleRegenerate(msg.id)}
              disabled={isRequesting.value && regeneratingId.value !== msg.id}
            >
              {regeneratingId.value === msg.id ? "Generating..." : "Regenerate"}
            </Button>
          ),
        }))}
      />
      <div>
        <Sender
          loading={isRequesting.value}
          onSubmit={(content: string) => {
            onRequest({ query: content });
            senderRef.value?.clear?.();
          }}
          onCancel={abort}
          ref={senderRef}
          placeholder="Enter message..."
          allowSpeech
          prefix={
            <Sender.Header
              title="AI Assistant"
              open={false}
              styles={{
                content: { padding: 0 },
              }}
            />
          }
        />
      </div>
    </div>
  );
});

export default ChatWithRegenerate;
```
