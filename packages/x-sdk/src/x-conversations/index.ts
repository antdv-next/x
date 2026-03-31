import type { MaybeRef } from "vue";

import { isRef, onScopeDispose, ref, shallowRef, watch } from "vue";

import type { AnyObject } from "../_util/types";

import resolveMaybeRef from "../_util/resolveMaybeRef";
import { ConversationStore } from "./store";

export interface ConversationData extends AnyObject {
  key: string;
}

export interface XConversationConfig {
  defaultConversations?: MaybeRef<ConversationData[]>;
  defaultActiveConversationKey?: MaybeRef<string>;
}

export default function useXConversations(config: XConversationConfig) {
  const store = new ConversationStore(
    resolveMaybeRef(config?.defaultConversations) || [],
    resolveMaybeRef(config?.defaultActiveConversationKey) || "",
  );

  const conversations = shallowRef<ConversationData[]>(store.getSnapshot());
  const activeConversationKey = ref(store.getActiveConversationKey());

  const syncStore = () => {
    conversations.value = store.getSnapshot();
    activeConversationKey.value = store.getActiveConversationKey();
  };

  const unsubscribe = store.subscribe(syncStore);
  syncStore();

  if (config?.defaultConversations && isRef(config.defaultConversations)) {
    watch(
      config.defaultConversations,
      list => {
        store.setConversations(list || []);
      },
      { deep: true },
    );
  }

  if (
    config?.defaultActiveConversationKey &&
    isRef(config.defaultActiveConversationKey)
  ) {
    watch(config.defaultActiveConversationKey, key => {
      if (typeof key === "string") {
        store.setActiveConversationKey(key);
      }
    });
  }

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
