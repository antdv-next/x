# useXChat API

## 函数签名

```ts
type useXChat<
  ChatMessage extends SimpleType = string,
  ParsedMessage extends SimpleType = ChatMessage,
  Input = RequestParams<ChatMessage>,
  Output = SSEOutput,
> = (config: XChatConfig<ChatMessage, ParsedMessage, Input, Output>) => {
  onRequest: ...
  onReload: ...
  abort: () => void
  isRequesting: ComputedRef<boolean>
  isDefaultMessagesRequesting: Readonly<Ref<boolean>>
  messages: ShallowRef<MessageInfo<ChatMessage>[]>
  parsedMessages: ComputedRef<MessageInfo<ParsedMessage>[]>
  setMessages: ...
  setMessage: ...
  removeMessage: ...
  queueRequest: ...
}
```

## XChatConfig

| 属性               | 说明                                                                                                                                                                             | 类型                                                                                                                                                                                                         | 默认值                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| provider           | 数据提供方，把请求和响应 chunk 转换成标准消息流。内置 `DefaultChatProvider`、`OpenAIChatProvider`、`DeepSeekChatProvider`，也可以继承 `AbstractChatProvider` 实现自己的 Provider | `MaybeRef<AbstractChatProvider<ChatMessage, Input, Output>>`                                                                                                                                                 | -                           |
| conversationKey    | 会话唯一标识。修改该 ref 会切换消息 store；默认生成一个 `Symbol`                                                                                                                 | `MaybeRef<string \| undefined>`                                                                                                                                                                              | `Symbol('ConversationKey')` |
| defaultMessages    | 初始消息。可以是数组、ref，或接收 `{ conversationKey }` 的同步/异步函数                                                                                                          | `MaybeRef<DefaultMessageInfo<ChatMessage>[]>` \| `(info: { conversationKey?: string }) => DefaultMessageInfo<ChatMessage>[] \| Promise<DefaultMessageInfo<ChatMessage>[]>`                                   | -                           |
| parser             | 把 `ChatMessage` 转换成组件消费的 `ParsedMessage`。支持返回一条或多条                                                                                                            | `(message: ChatMessage) => ParsedMessage \| ParsedMessage[]`                                                                                                                                                 | -                           |
| requestPlaceholder | 请求进行中展示的占位消息；不提供时不会添加占位消息                                                                                                                               | `MaybeRef<ChatMessage>` \| `(requestParams: Partial<Input>, info: { messages: ChatMessage[] }) => ChatMessage`                                                                                               | -                           |
| requestFallback    | 请求失败时展示的兜底消息。不提供时会把 loading 消息标记为 `error` / `abort`。`errorInfo` 可选；`messageInfo` 是当前 loading/updating 消息                                        | `MaybeRef<ChatMessage>` \| `(requestParams: Partial<Input>, info: { error: Error; errorInfo?: any; messages: ChatMessage[]; messageInfo: MessageInfo<ChatMessage> }) => ChatMessage \| Promise<ChatMessage>` | -                           |

> `provider` 在类型上是可选的，但缺少它时 `onRequest`、`onReload`、`abort` 会抛出 `provider is required`。实际使用中始终传入 provider。

## 返回值

| 属性                        | 说明                                                            | 类型                                                                                                                                                          |
| --------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| onRequest                   | 添加一条本地消息并触发请求                                      | `(requestParams: Partial<Input>, opts?: { extraInfo?: AnyObject }) => void`                                                                                   |
| onReload                    | 重新生成某条消息。`requestParams` 必传，没有额外参数时传 `{}`   | `(id: string \| number, requestParams: Partial<Input>, opts?: { extraInfo?: AnyObject }) => void`                                                             |
| abort                       | 取消当前请求                                                    | `() => void`                                                                                                                                                  |
| isRequesting                | 当前会话是否在请求中                                            | `ComputedRef<boolean>`                                                                                                                                        |
| isDefaultMessagesRequesting | `defaultMessages` 是否仍在加载（可用于禁用发送框）              | `Readonly<Ref<boolean>>`                                                                                                                                      |
| messages                    | 当前消息列表                                                    | `ShallowRef<MessageInfo<ChatMessage>[]>`                                                                                                                      |
| parsedMessages              | 经过 `parser` 转换后的消息列表                                  | `ComputedRef<MessageInfo<ParsedMessage>[]>`                                                                                                                   |
| setMessages                 | 替换或更新整个列表，不触发请求。支持数组或 updater 函数         | `(messages: MessageInfo<ChatMessage>[] \| ((ori: MessageInfo<ChatMessage>[]) => MessageInfo<ChatMessage>[])) => boolean`                                      |
| setMessage                  | 更新单条消息，不触发请求。支持 partial 或 updater 函数          | `(id: string \| number, message: Partial<MessageInfo<ChatMessage>> \| ((message: MessageInfo<ChatMessage>) => Partial<MessageInfo<ChatMessage>>)) => boolean` |
| removeMessage               | 删除单条消息，不触发请求                                        | `(id: string \| number) => boolean`                                                                                                                           |
| queueRequest                | 把请求加入队列，等待该会话的 `defaultMessages` 加载完成后再发送 | `(conversationKey: string \| number \| symbol, requestParams: Partial<Input>, opts?: { extraInfo?: AnyObject }) => void`                                      |

## MessageInfo

```ts
interface MessageInfo<Message> {
  id: number | string;
  message: Message;
  status: MessageStatus;
  extraInfo?: AnyObject;
}
```

`DefaultMessageInfo` 是 `Pick<MessageInfo, "message"> & Partial<Omit<MessageInfo, "message">>`：`id` 可省略，默认 `default_<index>`；`status` 默认 `local`。

## MessageStatus

```ts
type MessageStatus =
  "local" | "loading" | "updating" | "success" | "error" | "abort";
```

## 相关：useXConversations

会话列表本身交给同包的 `useXConversations`：

```ts
const {
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
  removeConversation,
  setConversation,
  getConversation,
  setConversations,
  getMessages,
} = useXConversations({
  defaultConversations: [{ key: "1", label: "新会话" }],
  defaultActiveConversationKey: "1",
});
```

把 `activeConversationKey` 传给 `useXChat({ conversationKey: activeConversationKey })`，每个会话就会各自保留消息 store。
