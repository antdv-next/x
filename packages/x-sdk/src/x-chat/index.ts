import type { MaybeRef } from "vue";

import {
  computed,
  isRef,
  onScopeDispose,
  reactive,
  ref,
  shallowRef,
  watch,
} from "vue";

import type { AnyObject } from "../_util/types";
import type { ConversationData } from "../x-conversations";
import type { SSEOutput } from "../x-stream";
import type { ConversationKey } from "./store";

import resolveMaybeRef from "../_util/resolveMaybeRef";
import { AbstractChatProvider } from "../chat-providers";
import { AbstractXRequestClass } from "../x-request";
import { ChatMessagesStore, chatMessagesStoreHelper } from "./store";

export type SimpleType = string | number | boolean | object;

enum MessageStatusEnum {
  local = "local",
  loading = "loading",
  updating = "updating",
  success = "success",
  error = "error",
  abort = "abort",
}

export type MessageStatus = `${MessageStatusEnum}`;

type RequestPlaceholderFn<Input, Message> = (
  requestParams: Partial<Input>,
  info: { messages: Message[] },
) => Message;

type RequestFallbackFn<Input, MessageInfoType, Message> = (
  requestParams: Partial<Input>,
  info: {
    error: Error;
    errorInfo?: any;
    messages: Message[];
    messageInfo: MessageInfoType;
  },
) => Message | Promise<Message>;

export type RequestParams<Message> = {
  [Key: PropertyKey]: Message;
} & AnyObject;

type ParserFn<ChatMessage, BubbleMessage> = (
  message: ChatMessage,
) => BubbleMessage | BubbleMessage[];

type DefaultMessagesFn<ChatMessage extends SimpleType> =
  | ((info: {
      conversationKey?: ConversationData["key"];
    }) => Promise<DefaultMessageInfo<ChatMessage>[]>)
  | ((info?: {
      conversationKey?: ConversationData["key"];
    }) => DefaultMessageInfo<ChatMessage>[]);

export interface XChatConfig<
  ChatMessage extends SimpleType = string,
  BubbleMessage extends SimpleType = ChatMessage,
  Input = ChatMessage,
  Output = ChatMessage,
> {
  provider?: MaybeRef<AbstractChatProvider<ChatMessage, Input, Output>>;
  conversationKey?: MaybeRef<ConversationData["key"] | undefined>;
  defaultMessages?:
    | MaybeRef<DefaultMessageInfo<ChatMessage>[]>
    | DefaultMessagesFn<ChatMessage>;
  parser?: ParserFn<ChatMessage, BubbleMessage> | undefined;
  requestPlaceholder?:
    | MaybeRef<ChatMessage>
    | RequestPlaceholderFn<Input, ChatMessage>;
  requestFallback?:
    | MaybeRef<ChatMessage>
    | RequestFallbackFn<Input, MessageInfo<ChatMessage>, ChatMessage>;
}

export interface MessageInfo<Message extends SimpleType> {
  id: number | string;
  message: Message;
  status: MessageStatus;
  extraInfo?: AnyObject;
}

export type DefaultMessageInfo<Message extends SimpleType> = Pick<
  MessageInfo<Message>,
  "message"
> &
  Partial<Omit<MessageInfo<Message>, "message">>;

export type RequestResultObject<Message> = {
  message: Message | Message[];
  status: MessageStatus;
};

export type StandardRequestResult<Message extends SimpleType> = Omit<
  RequestResultObject<Message>,
  "message" | "status"
> & {
  message: Message;
  status?: MessageStatus;
};

function toArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

const IsRequestingMap = reactive(new Map<ConversationKey, boolean>());
const generateConversationKey = () => Symbol("ConversationKey");

export default function useXChat<
  ChatMessage extends SimpleType = string,
  ParsedMessage extends SimpleType = ChatMessage,
  Input = RequestParams<ChatMessage>,
  Output = SSEOutput,
>(config: XChatConfig<ChatMessage, ParsedMessage, Input, Output>) {
  const idRef = ref(0);
  const requestHandlerRef =
    shallowRef<AbstractXRequestClass<Input, Output, ChatMessage>>();

  const providerRef = isRef(config.provider)
    ? config.provider
    : shallowRef(config.provider);
  let provider = providerRef.value;

  const originalConversationKey = config.conversationKey
    ? resolveMaybeRef(config.conversationKey)
    : undefined;

  const conversationKey = ref<ConversationKey>(
    originalConversationKey ?? generateConversationKey(),
  );

  if (config.conversationKey && isRef(config.conversationKey)) {
    watch(config.conversationKey, value => {
      if (value !== undefined && value !== null) {
        conversationKey.value = value;
      }
    });
  }

  const messageQueueMap = new Map<
    ConversationKey,
    Array<{
      requestParams: Partial<Input>;
      opts?: { extraInfo: AnyObject };
    }>
  >();

  const activeStore = shallowRef<ChatMessagesStore<MessageInfo<ChatMessage>>>();
  const messages = shallowRef<MessageInfo<ChatMessage>[]>([]);
  const isDefaultMessagesRequestingRef = shallowRef(false);
  const parsedMessages = computed(() => {
    const parser = config.parser;
    const list: MessageInfo<ParsedMessage>[] = [];

    messages.value.forEach(agentMsg => {
      const sourceMessage = agentMsg.message as ChatMessage;
      const rawParsedMsg = parser ? parser(sourceMessage) : sourceMessage;
      const bubbleMsgs = toArray(rawParsedMsg as ParsedMessage);

      bubbleMsgs.forEach((bubbleMsg, bubbleMsgIndex) => {
        let key = agentMsg.id;
        if (bubbleMsgs.length > 1) {
          key = `${key}_${bubbleMsgIndex}`;
        }

        list.push({
          id: key,
          message: bubbleMsg,
          status: agentMsg.status,
        });
      });
    });

    return list;
  });

  let unsubscribeStore: (() => void) | null = null;

  const resolveDefaultMessages = async (
    currentConversationKey: ConversationKey,
  ) => {
    const sourceDefaultMessages = config.defaultMessages;
    const defaultMessages =
      typeof sourceDefaultMessages === "function"
        ? sourceDefaultMessages
        : resolveMaybeRef(sourceDefaultMessages);
    const messageList =
      typeof defaultMessages === "function"
        ? await defaultMessages({
            conversationKey: currentConversationKey as ConversationData["key"],
          })
        : defaultMessages;

    return (messageList || []).map((info, index) => ({
      id: `default_${index}`,
      status: "local" as const,
      ...info,
    }));
  };

  const createStore = (currentConversationKey: ConversationKey) => {
    const existingStore = chatMessagesStoreHelper.get(currentConversationKey);
    if (existingStore) {
      return existingStore as ChatMessagesStore<MessageInfo<ChatMessage>>;
    }

    return new ChatMessagesStore<MessageInfo<ChatMessage>>(
      () => resolveDefaultMessages(currentConversationKey),
      currentConversationKey,
    );
  };

  const syncStoreSnapshot = () => {
    if (!activeStore.value) {
      messages.value = [];
      isDefaultMessagesRequestingRef.value = false;
      return;
    }

    const snapshot = activeStore.value.getSnapshot();
    messages.value = snapshot.messages;
    isDefaultMessagesRequestingRef.value = snapshot.isDefaultMessagesRequesting;
  };

  const bindStore = (currentConversationKey: ConversationKey) => {
    if (unsubscribeStore) {
      unsubscribeStore();
      unsubscribeStore = null;
    }

    activeStore.value = createStore(currentConversationKey);
    syncStoreSnapshot();
    unsubscribeStore = activeStore.value.subscribe(syncStoreSnapshot);
  };

  bindStore(conversationKey.value);

  watch(conversationKey, nextConversationKey => {
    bindStore(nextConversationKey);
  });

  onScopeDispose(() => {
    if (unsubscribeStore) {
      unsubscribeStore();
      unsubscribeStore = null;
    }
  });

  const setMessages = (
    updater:
      | MessageInfo<ChatMessage>[]
      | ((ori: MessageInfo<ChatMessage>[]) => MessageInfo<ChatMessage>[]),
  ) => {
    return activeStore.value?.setMessages(updater) ?? false;
  };

  const getMessages = () => {
    return activeStore.value?.getMessages() ?? [];
  };

  const setMessage = (
    id: string | number,
    message:
      | Partial<MessageInfo<ChatMessage>>
      | ((
          message: MessageInfo<ChatMessage>,
        ) => Partial<MessageInfo<ChatMessage>>),
  ) => {
    return activeStore.value?.setMessage(id, message) ?? false;
  };

  const removeMessage = (id: string | number) => {
    return activeStore.value?.removeMessage(id) ?? false;
  };

  const createMessage = (
    message: ChatMessage,
    status: MessageStatus,
    extraInfo?: AnyObject,
  ) => {
    const msg: MessageInfo<ChatMessage> = {
      id: `msg_${idRef.value}`,
      message,
      status,
    };
    if (extraInfo) {
      msg.extraInfo = extraInfo;
    }
    idRef.value += 1;

    return msg;
  };

  const getFilteredMessages = (msgs: MessageInfo<ChatMessage>[]) =>
    msgs.filter(info => info.status !== "loading").map(info => info.message);

  const setupProvider = (
    nextProvider: AbstractChatProvider<ChatMessage, Input, Output> | undefined,
  ) => {
    provider = nextProvider;
    if (nextProvider) {
      nextProvider.injectGetMessages(() => {
        return getFilteredMessages(getMessages());
      });
      requestHandlerRef.value = nextProvider.request;
    } else {
      requestHandlerRef.value = undefined;
    }
  };

  setupProvider(provider);

  watch(providerRef, setupProvider);
  const getRequestMessages = () => getFilteredMessages(getMessages());

  const innerOnRequest = (
    requestParams: Partial<Input>,
    opts?: {
      updatingId?: number | string;
      reload?: boolean;
      extraInfo?: AnyObject;
    },
  ) => {
    if (!provider) {
      return;
    }
    const activeProvider = provider;

    const { updatingId, reload } = opts || {};
    let loadingMsgId: number | string | null | undefined = null;
    const sourceRequestPlaceholder = config.requestPlaceholder;
    const requestPlaceholder =
      typeof sourceRequestPlaceholder === "function"
        ? sourceRequestPlaceholder
        : resolveMaybeRef(sourceRequestPlaceholder);
    const localMessage = activeProvider.transformLocalMessage(requestParams);
    const localMessages = (
      Array.isArray(localMessage) ? localMessage : [localMessage]
    ).map(message => createMessage(message, "local", opts?.extraInfo));
    if (reload) {
      loadingMsgId = updatingId;
      setMessages((ori: MessageInfo<ChatMessage>[]) => {
        const nextMessages = [...ori];
        if (requestPlaceholder) {
          let placeholderMsg: ChatMessage;
          if (typeof requestPlaceholder === "function") {
            placeholderMsg = (
              requestPlaceholder as RequestPlaceholderFn<Input, ChatMessage>
            )(requestParams, {
              messages: getFilteredMessages(nextMessages),
            });
          } else {
            placeholderMsg = requestPlaceholder;
          }
          nextMessages.forEach(info => {
            if (info.id === updatingId) {
              info.status = "loading";
              info.message = placeholderMsg;
              if (opts?.extraInfo) {
                info.extraInfo = opts?.extraInfo;
              }
            }
          });
        }
        return nextMessages;
      });
    } else {
      setMessages((ori: MessageInfo<ChatMessage>[]) => {
        let nextMessages = [...ori, ...localMessages];
        if (requestPlaceholder) {
          let placeholderMsg: ChatMessage;
          if (typeof requestPlaceholder === "function") {
            placeholderMsg = (
              requestPlaceholder as RequestPlaceholderFn<Input, ChatMessage>
            )(requestParams, {
              messages: getFilteredMessages(nextMessages),
            });
          } else {
            placeholderMsg = requestPlaceholder;
          }
          const loadingMsg = createMessage(placeholderMsg, "loading");
          loadingMsgId = loadingMsg.id;

          nextMessages = [...nextMessages, loadingMsg];
        }

        return nextMessages;
      });
    }

    let updatingMsgId: number | string | null | undefined = null;
    const updateMessage = (
      status: MessageStatus,
      chunk: Output,
      chunks: Output[],
      responseHeaders: Headers,
    ) => {
      let msg = getMessages().find(info => info.id === updatingMsgId);
      if (!msg) {
        if (reload && updatingId) {
          msg = getMessages().find(info => info.id === updatingId);
          if (msg) {
            msg.status = status;
            msg.message = activeProvider.transformMessage({
              chunk,
              status,
              chunks,
              responseHeaders,
            });
            setMessages((ori: MessageInfo<ChatMessage>[]) => {
              return [...ori];
            });
            updatingMsgId = msg.id;
          }
        } else {
          const transformData = activeProvider.transformMessage({
            chunk,
            status,
            chunks,
            responseHeaders,
          });
          msg = createMessage(transformData, status);
          setMessages((ori: MessageInfo<ChatMessage>[]) => {
            const oriWithoutPending = ori.filter(
              (info: { id: string | number | null | undefined }) =>
                info.id !== loadingMsgId,
            );
            return [...oriWithoutPending, msg!];
          });
          updatingMsgId = msg.id;
        }
      } else {
        setMessages((ori: MessageInfo<ChatMessage>[]) => {
          return ori.map((info: MessageInfo<ChatMessage>) => {
            if (info.id === updatingMsgId) {
              const transformData = activeProvider.transformMessage({
                originMessage: info.message,
                chunk,
                chunks,
                status,
                responseHeaders,
              });
              return {
                ...info,
                message: transformData,
                status,
              };
            }
            return info;
          });
        });
      }
      msg = getMessages().find(info => info.id === updatingMsgId) || msg;
      return msg;
    };
    activeProvider.injectRequest({
      onUpdate: (chunk: Output, headers: Headers) => {
        const msg = updateMessage("updating", chunk, [], headers);
        return msg;
      },
      onSuccess: (chunks: Output[], headers: Headers) => {
        if (conversationKey.value) {
          IsRequestingMap.delete(conversationKey.value);
        }
        const msg = updateMessage(
          "success",
          undefined as Output,
          chunks,
          headers,
        );
        return msg;
      },
      onError: async (error: Error, errorInfo: any) => {
        if (conversationKey.value) {
          IsRequestingMap.delete(conversationKey.value);
        }
        let fallbackMsg: ChatMessage;
        const sourceRequestFallback = config.requestFallback;
        const requestFallback =
          typeof sourceRequestFallback === "function"
            ? sourceRequestFallback
            : resolveMaybeRef(sourceRequestFallback);
        if (requestFallback) {
          if (typeof requestFallback === "function") {
            const currentMessages = getRequestMessages();
            const msg = getMessages().find(
              info => info.id === loadingMsgId || info.id === updatingMsgId,
            );

            fallbackMsg = await (
              requestFallback as RequestFallbackFn<
                Input,
                MessageInfo<ChatMessage>,
                ChatMessage
              >
            )(requestParams, {
              error,
              errorInfo,
              messageInfo: msg as MessageInfo<ChatMessage>,
              messages: currentMessages,
            });
          } else {
            fallbackMsg = requestFallback;
          }
          setMessages((ori: MessageInfo<ChatMessage>[]) => [
            ...ori.filter(
              (info: { id: string | number | null | undefined }) =>
                info.id !== loadingMsgId && info.id !== updatingMsgId,
            ),
            createMessage(
              fallbackMsg,
              error.name === "AbortError" ? "abort" : "error",
            ),
          ]);
        } else {
          const existingMessageInfo = getMessages().find(
            info => info.id !== loadingMsgId && info.id !== updatingMsgId,
          );
          fallbackMsg = existingMessageInfo?.message as ChatMessage;
          setMessages((ori: MessageInfo<ChatMessage>[]) => {
            return ori.map((info: MessageInfo<ChatMessage>) => {
              if (info.id === loadingMsgId || info.id === updatingMsgId) {
                return {
                  ...info,
                  status: error.name === "AbortError" ? "abort" : "error",
                };
              }
              return info;
            });
          });
        }
        return fallbackMsg;
      },
    });
    if (conversationKey.value) {
      IsRequestingMap.set(conversationKey.value, true);
    }
    activeProvider.request.run(
      activeProvider.transformParams(
        requestParams,
        activeProvider.request.options,
      ),
    );
  };

  const onRequest = (
    requestParams: Partial<Input>,
    opts?: { extraInfo: AnyObject },
  ) => {
    if (!providerRef.value) {
      throw new Error("provider is required");
    }
    innerOnRequest(requestParams, opts);
  };

  const onReload = (
    id: string | number,
    requestParams: Partial<Input>,
    opts?: { extraInfo: AnyObject },
  ) => {
    if (!providerRef.value) {
      throw new Error("provider is required");
    }
    if (!id || !getMessages().find(info => info.id === id)) {
      throw new Error(`message [${id}] is not found`);
    }
    innerOnRequest(requestParams, {
      updatingId: id,
      reload: true,
      extraInfo: opts?.extraInfo,
    });
  };

  const processMessageQueue = () => {
    const requestParamsList = messageQueueMap.get(conversationKey.value);
    if (requestParamsList && requestParamsList.length > 0) {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        requestParamsList.forEach(({ requestParams, opts }) => {
          onRequest(requestParams, opts);
        });
        messageQueueMap.delete(conversationKey.value);
      });
    }
  };

  watch(isDefaultMessagesRequestingRef, requesting => {
    if (!requesting) {
      processMessageQueue();
    }
  });

  if (config.defaultMessages && isRef(config.defaultMessages)) {
    watch(
      config.defaultMessages,
      () => {
        activeStore.value?.refreshDefaultMessages();
      },
      { deep: true },
    );
  }

  const queueRequest = (
    currentConversationKey: ConversationKey,
    requestParams: Partial<Input>,
    opts?: { extraInfo: AnyObject },
  ) => {
    if (!messageQueueMap.has(currentConversationKey)) {
      messageQueueMap.set(currentConversationKey, []);
    }
    messageQueueMap.get(currentConversationKey)!.push({
      requestParams,
      opts,
    });
  };

  return {
    onRequest,
    isDefaultMessagesRequesting: computed(
      () => isDefaultMessagesRequestingRef.value,
    ),
    messages,
    parsedMessages,
    setMessages,
    removeMessage,
    setMessage,
    abort: () => {
      if (!provider) {
        throw new Error("provider is required");
      }
      requestHandlerRef.value?.abort();
    },
    isRequesting: computed(() =>
      conversationKey.value
        ? IsRequestingMap.get(conversationKey.value) || false
        : false,
    ),
    onReload,
    queueRequest,
  } as const;
}
