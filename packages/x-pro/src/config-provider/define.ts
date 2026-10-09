import type { ConfigProviderProps } from "antdv-next/config-provider";
import type { CSSProperties } from "vue";

import type { XProLocale } from "../locale/types";
import type {
  MessageScrollerItem,
  MessageScrollerNavigation,
  MessageScrollerProps,
} from "../message-scroller/types";
import type {
  TodoListClassNamesType,
  TodoListProps,
  TodoListStylesType,
} from "../todo-list/types";

export interface MessageScrollerConfig {
  followThreshold?: number;
  smooth?: boolean;
  navigation?: MessageScrollerNavigation;
  items?: MessageScrollerItem[];
  itemSelector?: string;
  backToBottom?: boolean;
  class?: string;
  style?: CSSProperties;
  classes?:
    | Record<string, string>
    | ((info: { props: MessageScrollerProps }) => Record<string, string>);
  styles?:
    | Record<string, CSSProperties>
    | ((info: {
        props: MessageScrollerProps;
      }) => Record<string, CSSProperties>);
}

/**
 * TodoList 的包级默认配置。
 *
 * 刻意不含 `items`：每个实例各自的任务数据没有包级默认值的语义。
 */
export interface TodoListConfig extends Omit<
  TodoListProps,
  "items" | "prefixCls" | "rootClass"
> {
  class?: string;
  style?: CSSProperties;
  classes?: TodoListClassNamesType;
  styles?: TodoListStylesType;
}

export interface XProConfigContextProps {
  messageScroller?: MessageScrollerConfig;
  todoList?: TodoListConfig;
}

export const X_PRO_CONFIG_KEYS = [
  "messageScroller",
  "todoList",
] as const satisfies readonly (keyof XProConfigContextProps)[];

export interface XProProviderProps
  extends Omit<ConfigProviderProps, "locale">, XProConfigContextProps {
  locale?: XProLocale;
}

export interface XProProviderSlots {
  renderEmpty?: NonNullable<ConfigProviderProps["renderEmpty"]>;
  transformCellText?: NonNullable<ConfigProviderProps["transformCellText"]>;
  default?: () => any;
  [key: string]: any;
}

export type XProProviderEmits = Record<string, any>;
