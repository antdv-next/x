import { onScopeDispose, ref } from "vue";

import type { AnyObject } from "../_util/types";

import { ConversationStore } from "./store";

export interface ConversationData extends AnyObject {
  key: string;
}

interface XConversationConfig {
  defaultConversations?: ConversationData[];
  defaultActiveConversationKey?: string;
}

export default function useXConversations(config: XConversationConfig) {
  const store = new ConversationStore(
    config?.defaultConversations || [],
    config?.defaultActiveConversationKey || "",
  );

  const conversations = ref<ConversationData[]>(store.getSnapshot());
  const activeConversationKey = ref(store.getActiveConversationKey());

  const syncStore = () => {
    conversations.value = store.getSnapshot();
    activeConversationKey.value = store.getActiveConversationKey();
  };

  const unsubscribe = store.subscribe(syncStore);
  syncStore();

  onScopeDispose(() => {
    unsubscribe();
    store.destroy();
  });

  return {
    conversations,
    activeConversationKey,
    setActiveConversationKey: store.setActiveConversationKey,
    addConversation: store.addConversation,
    removeConversation: store.removeConversation,
    setConversation: store.setConversation,
    getConversation: store.getConversation,
    setConversations: store.setConversations,
    getMessages: store.getMessages,
  };
}
