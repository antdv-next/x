# 完整示例

## 带会话管理的聊天应用

```tsx
import { BubbleList, Conversations, Sender } from "@antdv-next/x";
import { useXChat, useXConversations } from "@antdv-next/x-sdk";
import { computed, defineComponent } from "vue";

import type { ChatMessage } from "../providers/ChatProvider";

import { chatProvider } from "../services/chatService";

const App = defineComponent(() => {
  const {
    conversations,
    activeConversationKey,
    addConversation,
    removeConversation,
    setActiveConversationKey,
  } = useXConversations({
    defaultConversations: [{ key: "1", label: "新会话" }],
    defaultActiveConversationKey: "1",
  });

  const { messages, onRequest, isRequesting, abort } = useXChat<
    ChatMessage,
    ChatMessage,
    { query: string },
    { content: string }
  >({
    provider: chatProvider,
    conversationKey: activeConversationKey,
  });

  const bubbleItems = computed(() =>
    messages.value.map(({ id, message, status }) => ({
      key: id,
      role: message.role,
      content: message.content,
      loading: status === "loading",
    })),
  );

  const handleNewConversation = () => {
    const key = Date.now().toString();
    addConversation({ key, label: `会话 ${conversations.value.length + 1}` });
    setActiveConversationKey(key);
  };

  const handleDeleteConversation = (key: string) => {
    removeConversation(key);
    if (activeConversationKey.value === key) {
      setActiveConversationKey(conversations.value[0]?.key ?? "");
    }
  };

  return () => (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "240px", borderRight: "1px solid #f0f0f0" }}>
        <Conversations
          items={conversations.value}
          activeKey={activeConversationKey.value}
          creation={{ onClick: handleNewConversation }}
          onActiveChange={key => setActiveConversationKey(key)}
          menu={conversation => ({
            items: [{ key: "delete", label: "删除", danger: true }],
            onClick: ({ key }) => {
              if (key === "delete") handleDeleteConversation(conversation.key);
            },
          })}
        />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
          <BubbleList
            items={bubbleItems.value}
            role={{
              assistant: { placement: "start" },
              user: { placement: "end" },
            }}
          />
        </div>

        <div style={{ padding: "16px", borderTop: "1px solid #f0f0f0" }}>
          <Sender
            loading={isRequesting.value}
            placeholder="请输入消息..."
            onSubmit={content => onRequest({ query: content })}
            onCancel={abort}
          />
        </div>
      </div>
    </div>
  );
});

export default App;
```

## 重新生成回复

```tsx
import { BubbleList, Sender, SenderHeader } from "@antdv-next/x";
import { useXChat } from "@antdv-next/x-sdk";
import { Button } from "antdv-next";
import { computed, defineComponent, ref } from "vue";

import type { ChatMessage } from "../providers/ChatProvider";

import { chatProvider } from "../services/chatService";

const ChatWithRegenerate = defineComponent(() => {
  const senderRef = ref<InstanceType<typeof Sender> | null>(null);
  const { messages, onReload, isRequesting, onRequest, abort } = useXChat<
    ChatMessage,
    ChatMessage,
    { query: string },
    { content: string }
  >({
    provider: chatProvider,
    requestPlaceholder: { content: "正在思考中...", role: "assistant" },
    requestFallback: (_, { error, errorInfo, messageInfo }) => {
      if (error.name === "AbortError") {
        return {
          content: messageInfo?.message?.content || "已取消回复",
          role: "assistant",
        };
      }
      return {
        content: errorInfo?.error?.message || "网络异常",
        role: "assistant",
      };
    },
  });

  const regeneratingId = ref<string | number | null>(null);

  const handleRegenerate = (messageId: string | number) => {
    regeneratingId.value = messageId;
    // requestParams 必传；没有额外参数时传 {}
    onReload(messageId, {}, { extraInfo: { regenerate: true } });
  };

  const bubbleItems = computed(() =>
    messages.value.map(({ id, message, status }) => ({
      key: id,
      role: message.role,
      content: message.content,
      loading: status === "loading",
      footer:
        message.role === "assistant" ? (
          <Button
            type="text"
            size="small"
            loading={regeneratingId.value === id && isRequesting.value}
            disabled={isRequesting.value && regeneratingId.value !== id}
            onClick={() => handleRegenerate(id)}
          >
            {regeneratingId.value === id ? "生成中..." : "重新生成"}
          </Button>
        ) : null,
    })),
  );

  return () => (
    <div>
      <BubbleList
        items={bubbleItems.value}
        role={{
          assistant: { placement: "start" },
          user: { placement: "end" },
        }}
      />
      <Sender
        ref={senderRef}
        loading={isRequesting.value}
        placeholder="请输入消息..."
        allowSpeech
        onSubmit={content => {
          onRequest({ query: content });
          senderRef.value?.clear?.();
        }}
        onCancel={abort}
        prefix={
          <SenderHeader
            title="AI 助手"
            open={false}
            styles={{ content: { padding: 0 } }}
          />
        }
      />
    </div>
  );
});

export default ChatWithRegenerate;
```
