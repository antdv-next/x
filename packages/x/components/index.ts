import type { App } from "vue";

import { version } from "../package.json";
import Actions, {
  ActionsAudio,
  ActionsCopy,
  ActionsFeedback,
  ActionsItem,
  XActions,
} from "./actions";
import Bubble, {
  XBubble,
  XBubbleDivider,
  XBubbleList,
  XBubbleSystem,
} from "./bubble";
import Conversations, {
  ConversationsCreation,
  XConversations,
} from "./conversations";
import FileCard, { FileCardList } from "./file-card";
import XProvider from "./x-provider";

const components = [
  XBubble,
  XBubbleList,
  XBubbleSystem,
  XBubbleDivider,
  XConversations,
  ConversationsCreation,
  XProvider,
  XActions,
  ActionsAudio,
  ActionsCopy,
  ActionsFeedback,
  ActionsItem,
  FileCard,
  FileCardList,
];

export default {
  install(app: App) {
    components.forEach(component => {
      if (component.name) app.component(component.name, component);
    });
  },
  version,
};

export {
  Actions,
  ActionsAudio,
  ActionsCopy,
  ActionsFeedback,
  ActionsItem,
  Bubble,
  Conversations,
  ConversationsCreation,
  FileCard,
  FileCardList,
  XProvider,
  version,
  XActions,
  XBubble,
  XBubbleDivider,
  XBubbleList,
  XBubbleSystem,
  XConversations,
};

export type {
  ActionsAudioProps,
  ActionsClickInfo,
  ActionsCopyProps,
  ActionsFeedbackProps,
  ActionsItemProps,
  ActionsProps,
  ActionsRef,
  ItemType,
} from "./actions";

export type {
  BubbleItemType,
  BubbleListProps,
  BubbleListRef,
  BubbleProps,
  BubbleRef,
} from "./bubble";

export type { FileCardListProps, FileCardProps } from "./file-card";

export type {
  ConversationItemType,
  ConversationsProps,
  ConversationsRef,
  CreationProps,
  DividerItemType,
  GroupableProps,
  ShortcutKeys,
} from "./conversations";

export type { XProviderProps } from "./x-provider";
