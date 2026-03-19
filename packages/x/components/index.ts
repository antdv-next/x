import type { App } from "vue";

import { version } from "../package.json";
import Actions, {
  ActionsAudio,
  ActionsCopy,
  ActionsFeedback,
  ActionsItem,
  XActions,
  XActionsAudio,
  XActionsCopy,
  XActionsFeedback,
  XActionsItem,
} from "./actions";
import Bubble, {
  BubbleDivider,
  BubbleList,
  BubbleSystem,
  XBubble,
  XBubbleDivider,
  XBubbleList,
  XBubbleSystem,
} from "./bubble";
import CodeHighlighter, { XCodeHighlighter } from "./code-highlighter";
import Conversations, {
  ConversationsCreation,
  XConversations,
} from "./conversations";
import FileCard, { FileCardList, XFileCard, XFileCardList } from "./file-card";
import XProvider from "./x-provider";

const components = [
  XBubble,
  XBubbleList,
  XBubbleSystem,
  XBubbleDivider,
  XCodeHighlighter,
  XConversations,
  ConversationsCreation,
  XProvider,
  XActions,
  XActionsAudio,
  XActionsCopy,
  XActionsFeedback,
  XActionsItem,
  XFileCard,
  XFileCardList,
];

const componentAliases = new Map<string, string[]>([
  ["XBubble", ["ABubble"]],
  ["XBubbleList", ["ABubbleList"]],
  ["XBubbleSystem", ["ABubbleSystem"]],
  ["XBubbleDivider", ["ABubbleDivider"]],
  ["XActions", ["AActions"]],
  ["XActionsAudio", ["AActionsAudio"]],
  ["XActionsCopy", ["AActionsCopy"]],
  ["XActionsFeedback", ["AActionsFeedback"]],
  ["XActionsItem", ["AActionsItem"]],
  ["XFileCard", ["AFileCard"]],
  ["XFileCardList", ["AFileCardList"]],
]);

export default {
  install(app: App) {
    components.forEach(component => {
      if (!component.name) return;

      app.component(component.name, component);
      componentAliases.get(component.name)?.forEach(alias => {
        app.component(alias, component);
      });
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
  BubbleDivider,
  BubbleList,
  BubbleSystem,
  CodeHighlighter,
  Conversations,
  ConversationsCreation,
  FileCard,
  FileCardList,
  XProvider,
  version,
  XActions,
  XActionsAudio,
  XActionsCopy,
  XActionsFeedback,
  XActionsItem,
  XBubble,
  XBubbleDivider,
  XBubbleList,
  XBubbleSystem,
  XCodeHighlighter,
  XConversations,
  XFileCard,
  XFileCardList,
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

export type {
  CodeHighlighterProps,
  CodeHighlighterRef,
  CodeHighlighterSemanticType,
} from "./code-highlighter";

export type { XProviderProps } from "./x-provider";
