# 完整示例项目

## 带有对话管理的完整项目

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
  const conversations = ref([{ key: "1", label: "新对话" }]);
  const activeKey = ref("1");
  const senderRef = ref<InstanceType<typeof Sender> | null>(null);

  // 新建对话
  const handleNewConversation = () => {
    const newKey = Date.now().toString();
    conversations.value.push({
      key: newKey,
      label: `对话 ${conversations.value.length + 1}`,
    });
    activeKey.value = newKey;
  };

  // 删除对话
  const handleDeleteConversation = (key: string) => {
    const filtered = conversations.value.filter(item => item.key !== key);
    if (filtered.length === 0) {
      const newKey = Date.now().toString();
      conversations.value = [{ key: newKey, label: "新对话" }];
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
          content: "已取消",
          role: "assistant" as const,
          timestamp: Date.now(),
        };
      }
      return {
        content: "请求失败",
        role: "assistant" as const,
        timestamp: Date.now(),
      };
    },
  });

  const menuConfig: ConversationsProps["menu"] = conversation => ({
    items: [
      {
        label: "删除",
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
      {/* 会话列表 */}
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

      {/* 聊天区域 */}
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
            "对话"}
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
            placeholder="输入消息..."
          />
        </div>
      </div>
    </div>
  );
});

export default App;
```

## 带状态管理的重新发送

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
      content: "正在思考中...",
      role: "assistant",
      timestamp: Date.now(),
    },
    requestFallback: (_, { error, errorInfo, messageInfo }) => {
      if (error.name === "AbortError") {
        return {
          content: messageInfo?.message?.content || "已取消回复",
          role: "assistant" as const,
          timestamp: Date.now(),
        };
      }
      return {
        content: errorInfo?.error?.message || "网络异常，请稍后重试",
        role: "assistant" as const,
        timestamp: Date.now(),
      };
    },
  });

  // 跟踪正在重新生成的消息ID
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
              {regeneratingId.value === msg.id ? "生成中..." : "重新生成"}
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
          placeholder="输入消息..."
          allowSpeech
          prefix={
            <Sender.Header
              title="AI 助手"
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
