import type { App } from "vue";

import { version } from "../package.json";
import Actions, {
  ActionsAudio,
  ActionsCopy,
  ActionsFeedback,
  ActionsItem,
} from "./actions";
import Attachments from "./attachments";
import Bubble, { BubbleDivider, BubbleList, BubbleSystem } from "./bubble";
import CodeHighlighter from "./code-highlighter";
import Conversations, { ConversationsCreation } from "./conversations";
import FileCard, { FileCardList } from "./file-card";
import Notification, { XNotification } from "./notification";
import Sender, { SenderHeader, SenderSwitch } from "./sender";
import Sources from "./sources";
import Think from "./think";
import ThoughtChain, { ThoughtChainItem } from "./thought-chain";
import XProvider from "./x-provider";

const components = [
  Bubble,
  BubbleList,
  BubbleSystem,
  BubbleDivider,
  CodeHighlighter,
  Conversations,
  ConversationsCreation,
  XProvider,
  Actions,
  Sources,
  ActionsAudio,
  ActionsCopy,
  ActionsFeedback,
  ActionsItem,
  FileCard,
  FileCardList,
  Attachments,
  Sender,
  SenderHeader,
  SenderSwitch,
  Think,
  ThoughtChain,
  ThoughtChainItem,
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
  ["XAttachments", ["AAttachments"]],
  ["XSender", ["ASender"]],
  ["XSenderHeader", ["ASenderHeader"]],
  ["XSenderSwitch", ["ASenderSwitch"]],
  ["XThink", ["AThink"]],
  ["XThoughtChain", ["AThoughtChain"]],
  ["XThoughtChainItem", ["AThoughtChainItem"]],
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
  Attachments,
  Bubble,
  BubbleDivider,
  BubbleList,
  BubbleSystem,
  CodeHighlighter,
  Conversations,
  ConversationsCreation,
  FileCard,
  FileCardList,
  Notification,
  XNotification,
  Sender,
  SenderHeader,
  SenderSwitch,
  Sources,
  Think,
  ThoughtChain,
  ThoughtChainItem,
  XProvider,
  version,
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

export type { ThinkProps, ThinkRef } from "./think";

export type {
  ThoughtChainItemProps,
  ThoughtChainItemStatus,
  ThoughtChainItemType,
  ThoughtChainProps,
  ThoughtChainRef,
} from "./thought-chain";

export type {
  ConversationItemType,
  ConversationsProps,
  ConversationsRef,
  CreationProps,
  DividerItemType,
  GroupableProps,
} from "./conversations";

export type { SourcesProps } from "./sources";
export type {
  CodeHighlighterProps,
  CodeHighlighterRef,
  CodeHighlighterSemanticType,
} from "./code-highlighter";

export type { SenderProps, SenderRef } from "./sender";
export type { XProviderProps } from "./x-provider";

export type { AttachmentsProps, AttachmentsRef } from "./attachments";
export type {
  UseNotificationType,
  XNotificationOpenArgs,
} from "./notification/interface";
