### 1. 消息管理

#### 获取消息列表

```ts
const { messages } = useXChat({ provider });
// messages 是 Vue Ref: Ref<MessageInfo<MessageType>[]>
// 通过 messages.value 访问
// 实际消息数据在 msg.message 中
```

#### 手动设置消息

```ts
const { setMessages } = useXChat({ provider });

// 清空消息
setMessages([]);

// 添加欢迎消息 - 注意是 MessageInfo 结构
setMessages([
  {
    id: "welcome",
    message: {
      content: "欢迎使用 AI 助手",
      role: "assistant",
    },
    status: "success",
  },
]);

// updater 形式：接收当前列表并返回新列表
setMessages(prev => [...prev, welcomeMessage]);
```

`setMessages` 返回布尔值，表示更新是否生效。

#### 更新单条消息

```ts
const { setMessage } = useXChat({ provider });

// 更新消息内容 - 需要更新 message 对象
setMessage("msg-id", {
  message: { content: "新的内容", role: "assistant" },
});

// 标记为错误 - 更新 status
setMessage("msg-id", { status: "error" });

// updater 形式
setMessage("msg-id", prev => ({ ...prev, status: "success" }));
```

`setMessage` 和 `removeMessage` 同样返回布尔值。

### 2. 请求控制

#### 发送消息

```ts
const { onRequest } = useXChat({ provider });

// 基础使用
onRequest({ query: "用户问题" });

// 带额外参数
onRequest({
  query: "用户问题",
  context: "之前的对话内容",
  userId: "user123",
});
```

#### 中断请求

```tsx
const { abort, isRequesting } = useXChat({ provider });

// 在 Vue 模板或 TSX render 函数中
<button onClick={abort} disabled={!isRequesting.value}>
  停止生成
</button>;
```

#### 重新发送

重新发送功能允许用户重新生成特定消息的回复，这在AI回答不满意或出现错误时非常有用。

#### 基础使用

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
            <button onClick={() => onReload(msg.id, {})}>重新生成</button>
          )}
        </div>
      ))}
    </div>
  );
});
```

#### 重新发送的注意事项

1. **只能重新生成AI回复**：通常只能对 `role === 'assistant'` 的消息使用重新发送
2. **状态管理**：重新发送会将对应消息状态设为 `loading`
3. **参数传递**：`onReload(id, requestParams, { extraInfo })` —— `requestParams` 必传，没有时传 `{}`；`extraInfo` 会存到消息上供业务自己使用
4. **错误处理**：建议配合 `requestFallback` 处理重新发送失败的情况

### 3. 错误处理

#### 统一错误处理

```ts
const { messages } = useXChat({
  provider,
  requestFallback: (_, { error, errorInfo, messageInfo }) => {
    // 网络错误
    if (!navigator.onLine) {
      return {
        content: "网络连接失败，请检查网络",
        role: "assistant" as const,
      };
    }

    // 用户中断
    if (error.name === "AbortError") {
      return {
        content: messageInfo?.message?.content || "已取消回复",
        role: "assistant" as const,
      };
    }

    // 服务器错误
    return {
      content: errorInfo?.error?.message || "网络异常，请稍后重试",
      role: "assistant" as const,
    };
  },
});
```

### 4. 请求中的消息展示

一般情况下无需配置，默认配合 Bubble 组件的 loading 状态使用，如需自定义 loading 时的内容可参考：

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
      <button onClick={() => onRequest({ query: "你好" })}>发送</button>
    </div>
  );
});
```

#### 自定义请求占位符

当设置 requestPlaceholder 时，会在请求开始前显示占位消息，配合 Bubble 组件的 loading 状态使用。

```ts
const { messages } = useXChat({
  provider,
  requestPlaceholder: (_, { messages }) => {
    return {
      content: messages.length > 0 ? "正在生成中..." : "正在思考中...",
      role: "assistant",
    };
  },
});
```

占位符函数只接收 `{ messages }`，拿不到错误信息；错误信息请用 `requestFallback`。

### 5. 多会话管理

用 `conversationKey` 隔离消息 store，用 `useXConversations` 管理会话列表：

```ts
import { useXChat, useXConversations } from "@antdv-next/x-sdk";

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

const { messages, onRequest, queueRequest } = useXChat({
  provider,
  conversationKey: activeConversationKey,
});
```

- 修改 `activeConversationKey` 会切换 `useXChat` 暴露的消息 store。
- `queueRequest(activeConversationKey.value, params)` 会等待该会话的异步 `defaultMessages` 加载完成后再发送。
- `isDefaultMessagesRequesting` 可用于在历史消息加载期间禁用发送框。
- `useXConversations` 创建的会话会被使用相同 key 的 `useXChat` 实例共享。
