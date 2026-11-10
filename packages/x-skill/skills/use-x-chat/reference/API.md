# useXChat API

## Signature

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

| Property           | Description                                                                                                                                                                                            | Type                                                                                                                                                                                                         | Default                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| provider           | Converts requests and response chunks into the standard message flow. Built-in `DefaultChatProvider`, `OpenAIChatProvider`, and `DeepSeekChatProvider` are available, or extend `AbstractChatProvider` | `MaybeRef<AbstractChatProvider<ChatMessage, Input, Output>>`                                                                                                                                                 | -                           |
| conversationKey    | Unique conversation identifier. Changing the ref switches the message store. Defaults to a generated `Symbol`                                                                                          | `MaybeRef<string \| undefined>`                                                                                                                                                                              | `Symbol('ConversationKey')` |
| defaultMessages    | Initial messages. May be an array, a ref, or a sync/async function receiving `{ conversationKey }`                                                                                                     | `MaybeRef<DefaultMessageInfo<ChatMessage>[]>` \| `(info: { conversationKey?: string }) => DefaultMessageInfo<ChatMessage>[] \| Promise<DefaultMessageInfo<ChatMessage>[]>`                                   | -                           |
| parser             | Converts `ChatMessage` into `ParsedMessage` for components. May return one message or an array                                                                                                         | `(message: ChatMessage) => ParsedMessage \| ParsedMessage[]`                                                                                                                                                 | -                           |
| requestPlaceholder | Placeholder message shown while a request is in flight; when absent, no placeholder message is added                                                                                                   | `MaybeRef<ChatMessage>` \| `(requestParams: Partial<Input>, info: { messages: ChatMessage[] }) => ChatMessage`                                                                                               | -                           |
| requestFallback    | Fallback message shown on failure. When absent, the loading message is marked `error` / `abort` instead. `errorInfo` is optional; `messageInfo` is the current loading/updating message                | `MaybeRef<ChatMessage>` \| `(requestParams: Partial<Input>, info: { error: Error; errorInfo?: any; messages: ChatMessage[]; messageInfo: MessageInfo<ChatMessage> }) => ChatMessage \| Promise<ChatMessage>` | -                           |

> `provider` is typed as optional, but `onRequest`, `onReload`, and `abort` throw `provider is required` when it is missing. In practice, always pass a provider.

## Return value

| Property                    | Description                                                                                   | Type                                                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| onRequest                   | Add a local message and trigger a request                                                     | `(requestParams: Partial<Input>, opts?: { extraInfo?: AnyObject }) => void`                                                                                   |
| onReload                    | Regenerate a message. `requestParams` is required; pass `{}` when there are no extra params   | `(id: string \| number, requestParams: Partial<Input>, opts?: { extraInfo?: AnyObject }) => void`                                                             |
| abort                       | Abort the current request                                                                     | `() => void`                                                                                                                                                  |
| isRequesting                | Whether the current conversation is requesting                                                | `ComputedRef<boolean>`                                                                                                                                        |
| isDefaultMessagesRequesting | Whether `defaultMessages` is still loading (useful to disable the sender)                     | `Readonly<Ref<boolean>>`                                                                                                                                      |
| messages                    | Current message list                                                                          | `ShallowRef<MessageInfo<ChatMessage>[]>`                                                                                                                      |
| parsedMessages              | Message list transformed through `parser`                                                     | `ComputedRef<MessageInfo<ParsedMessage>[]>`                                                                                                                   |
| setMessages                 | Replace or update the whole list without triggering a request. Accepts an array or an updater | `(messages: MessageInfo<ChatMessage>[] \| ((ori: MessageInfo<ChatMessage>[]) => MessageInfo<ChatMessage>[])) => boolean`                                      |
| setMessage                  | Update one message without triggering a request. Accepts a partial message or an updater      | `(id: string \| number, message: Partial<MessageInfo<ChatMessage>> \| ((message: MessageInfo<ChatMessage>) => Partial<MessageInfo<ChatMessage>>)) => boolean` |
| removeMessage               | Remove one message without triggering a request                                               | `(id: string \| number) => boolean`                                                                                                                           |
| queueRequest                | Queue a request until the conversation's `defaultMessages` finish loading                     | `(conversationKey: string \| number \| symbol, requestParams: Partial<Input>, opts?: { extraInfo?: AnyObject }) => void`                                      |

## MessageInfo

```ts
interface MessageInfo<Message> {
  id: number | string;
  message: Message;
  status: MessageStatus;
  extraInfo?: AnyObject;
}
```

`DefaultMessageInfo` is `Pick<MessageInfo, "message"> & Partial<Omit<MessageInfo, "message">>`: `id` is optional and defaults to `default_<index>`, `status` defaults to `local`.

## MessageStatus

```ts
type MessageStatus =
  "local" | "loading" | "updating" | "success" | "error" | "abort";
```

## Related: useXConversations

For the conversation list itself, use `useXConversations` from the same package:

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
  defaultConversations: [{ key: "1", label: "New conversation" }],
  defaultActiveConversationKey: "1",
});
```

Pass `activeConversationKey` to `useXChat({ conversationKey: activeConversationKey })` so each conversation keeps its own message store.
