// @antdv-next/x-pro — community agent components for Antdv X.
// This package is a community extension: it is not ported from, affiliated
// with, or synced to the Ant Design X upstream.
import type { ComponentToken as MessageScrollerComponentToken } from "./message-scroller/style";
import type { ComponentToken as TodoListComponentToken } from "./todo-list/style";

declare module "antdv-next/theme/interface/components" {
  interface ComponentTokenMap {
    MessageScroller?: MessageScrollerComponentToken;
    TodoList?: TodoListComponentToken;
  }
}

export { MessageScroller } from "./message-scroller";
export type {
  MessageScrollerClassNamesType,
  MessageScrollerEmits,
  MessageScrollerItem,
  MessageScrollerNavigation,
  MessageScrollerProps,
  MessageScrollerRef,
  MessageScrollerSemanticClassNames,
  MessageScrollerSemanticStyles,
  MessageScrollerSlots,
  MessageScrollerStylesType,
} from "./message-scroller";

export { default as XProProvider } from "./config-provider";
export {
  useXProComponentConfig,
  useXProConfig,
  useXProConfigProvider,
} from "./config-provider";
export type {
  MessageScrollerConfig,
  TodoListConfig,
  XProConfigContextProps,
  XProProviderEmits,
  XProProviderProps,
  XProProviderSlots,
} from "./config-provider";

export { TodoList } from "./todo-list";
export type {
  TodoHeaderSlotProps,
  TodoItem,
  TodoItemSlotProps,
  TodoItemStatus,
  TodoListClassNamesType,
  TodoListEmits,
  TodoListProps,
  TodoListRef,
  TodoListSemanticClassNames,
  TodoListSemanticStyles,
  TodoListSlots,
  TodoListStylesType,
} from "./todo-list";

export { default as enUS } from "./locale/en_US";
export { default as zhCN } from "./locale/zh_CN";
export type {
  MessageScrollerLocale,
  TodoListLocale,
  XProLocale,
} from "./locale/types";
