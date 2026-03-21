export type ConversationKey = string | number | symbol;

export const chatMessagesStoreHelper = {
  _chatMessagesStores: new Map<ConversationKey, ChatMessagesStore<any>>(),
  get: (conversationKey: ConversationKey) => {
    return chatMessagesStoreHelper._chatMessagesStores.get(conversationKey);
  },
  set: (key: ConversationKey, store: ChatMessagesStore<any>) => {
    chatMessagesStoreHelper._chatMessagesStores.set(key, store);
  },
  delete: (key: ConversationKey) => {
    chatMessagesStoreHelper._chatMessagesStores.delete(key);
  },
  getMessages: (conversationKey: ConversationKey) => {
    const store =
      chatMessagesStoreHelper._chatMessagesStores.get(conversationKey);
    return store?.getMessages();
  },
};

export interface ChatStoreSnapshot<T> {
  messages: T[];
  isDefaultMessagesRequesting: boolean;
}

export class ChatMessagesStore<T extends { id: number | string }> {
  private listeners: (() => void)[] = [];
  private conversationKey: ConversationKey | undefined;
  private snapshotResult: ChatStoreSnapshot<T> = {
    messages: [],
    isDefaultMessagesRequesting: false,
  };
  private throttleTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingEmit = false;
  private readonly throttleInterval: number = 50;
  private isDestroyed = false;

  private emitListeners() {
    this.listeners.forEach(listener => {
      listener();
    });
  }

  private throttledEmitListeners() {
    if (!this.throttleTimer) {
      this.emitListeners();
      this.pendingEmit = false;

      this.throttleTimer = setTimeout(() => {
        this.throttleTimer = null;
        if (this.pendingEmit) {
          this.emitListeners();
          this.pendingEmit = false;
        }
      }, this.throttleInterval);
    } else {
      this.pendingEmit = true;
    }
  }

  constructor(
    defaultMessages: () => Promise<T[]>,
    conversationKey?: ConversationKey,
  ) {
    void this.initializeMessages(defaultMessages, value => {
      this.setSnapshotResult("isDefaultMessagesRequesting", value);
      this.emitListeners();
    });

    if (conversationKey) {
      this.conversationKey = conversationKey;
      chatMessagesStoreHelper.set(this.conversationKey, this);
    }
  }

  private async initializeMessages(
    defaultMessages: () => Promise<T[]>,
    setDefaultMessagesRequesting: (defaultValueLoading: boolean) => void,
  ) {
    try {
      setDefaultMessagesRequesting(true);
      const messages = await defaultMessages();

      if (!this.isDestroyed) {
        this.setMessagesInternal(messages, false);
      }
    } catch (error) {
      console.warn("Failed to initialize messages:", error);
      if (!this.isDestroyed) {
        this.setMessagesInternal([], false);
      }
    } finally {
      setDefaultMessagesRequesting(false);
    }
  }

  private setSnapshotResult = <K extends keyof ChatStoreSnapshot<T>>(
    key: K,
    value: ChatStoreSnapshot<T>[K],
  ) => {
    this.snapshotResult = {
      ...this.snapshotResult,
      [key]: value,
    };
  };

  private setMessagesInternal = (
    messages: T[] | ((ori: T[]) => T[]),
    throttle = true,
  ) => {
    let list: T[];
    if (typeof messages === "function") {
      list = messages(this.snapshotResult.messages);
    } else {
      list = messages as T[];
    }
    this.setSnapshotResult("messages", list);

    if (throttle) {
      this.throttledEmitListeners();
    } else {
      this.emitListeners();
    }
    return true;
  };

  setMessages = (messages: T[] | ((ori: T[]) => T[])) => {
    return this.setMessagesInternal(messages, true);
  };

  getMessages = () => {
    return this.snapshotResult.messages;
  };

  getMessage = (id: string | number) => {
    return this.getMessages().find(item => item.id === id);
  };

  addMessage = (message: T) => {
    const exist = this.getMessage(message.id);
    if (!exist) {
      this.setMessages([...this.snapshotResult.messages, message]);
      return true;
    }
    return false;
  };

  setMessage = (
    id: string | number,
    message: Partial<T> | ((message: T) => Partial<T>),
  ) => {
    const originMessage = this.getMessage(id);
    if (originMessage) {
      const mergeMessage =
        typeof message === "function" ? message(originMessage) : message;
      Object.assign(originMessage, mergeMessage);
      this.setMessages([...this.snapshotResult.messages]);
      return true;
    }
    return false;
  };

  removeMessage = (id: string | number) => {
    const index = this.getMessages().findIndex(item => item.id === id);
    if (index !== -1) {
      this.snapshotResult.messages.splice(index, 1);
      this.setMessages([...this.getMessages()]);
      return true;
    }
    return false;
  };

  getSnapshot = () => {
    return this.snapshotResult;
  };

  subscribe = (callback: () => void) => {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
      if (this.listeners.length === 0) {
        if (this.throttleTimer) {
          clearTimeout(this.throttleTimer);
          this.throttleTimer = null;
        }
        this.pendingEmit = false;
      }
    };
  };

  destroy = () => {
    this.isDestroyed = true;
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    this.pendingEmit = false;
    this.listeners = [];
  };
}
