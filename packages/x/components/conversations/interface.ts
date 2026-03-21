import type { MenuProps } from "antdv-next";
import type {
  ClassValue,
  CSSProperties,
  HTMLAttributes,
  StyleValue,
  VNodeChild,
} from "vue";

import type { CollapsibleOptions } from "../_utils/hooks/useCollapsiable";
import type { AnyObject } from "../_utils/type";

type PrefixKeysInfo = [keyof KeyboardEvent, string, string];

export type PrefixKeysType = {
  Ctrl: PrefixKeysInfo;
  Alt: PrefixKeysInfo;
  Meta: PrefixKeysInfo;
  Shift: PrefixKeysInfo;
};

export type CodeKeyType = number | "number" | keyof PrefixKeysType;

export type ShortcutKeys<CustomKey = number | "number"> =
  | [keyof PrefixKeysType, keyof PrefixKeysType, CustomKey]
  | [keyof PrefixKeysType, CustomKey];

export type ShortcutKeyInfoType = {
  shortcutKeys: ShortcutKeys | ShortcutKeys[];
  shortcutKeysIcon: string[] | string[][];
};

export type SemanticType = "root" | "creation" | "group" | "item";

export interface ConversationsRef {
  nativeElement: HTMLUListElement;
}

export interface ConversationItemType
  extends AnyObject, Omit<HTMLAttributes, "onClick" | "class" | "style"> {
  key: string | number;
  label?: VNodeChild;
  group?: string;
  icon?: VNodeChild;
  disabled?: boolean;
  class?: ClassValue;
  style?: StyleValue;
}

export interface DividerItemType {
  type: "divider";
  key?: string | number;
  dashed?: boolean;
}

export type ItemType = ConversationItemType | DividerItemType;

export type GroupLabel =
  | VNodeChild
  | ((
      group: string,
      info: {
        groupInfo: GroupInfoType;
      },
    ) => VNodeChild)
  | undefined;

export type Collapsible = boolean | ((group: string) => boolean);

export interface GroupableProps extends CollapsibleOptions {
  label?: GroupLabel;
  collapsible?: Collapsible;
}

export interface GroupInfoType {
  data: ItemType[];
  name: string;
  label: GroupLabel;
  enableGroup: boolean;
  collapsible: boolean;
}

export interface ConversationsItemMenu extends Omit<MenuProps, "trigger"> {
  trigger?:
    | VNodeChild
    | ((
        conversation: ConversationItemType,
        info: { originNode: VNodeChild },
      ) => VNodeChild);
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
}

export interface CreationLabelProps {
  shortcutKeysIcon?: string[];
  prefixCls: string;
}

export interface CreationLabelInfo {
  shortcutKeyInfo?: ShortcutKeyInfoType;
  components: { CreationLabel: (props: CreationLabelProps) => VNodeChild };
}

export interface CreationProps {
  label?: VNodeChild | ((info: CreationLabelInfo) => VNodeChild);
  align?: "start" | "center" | "end";
  prefixCls?: string;
  classes?: ClassValue;
  style?: CSSProperties;
  shortcutKeyInfo?: ShortcutKeyInfoType;
  disabled?: boolean;
  icon?: VNodeChild | (() => VNodeChild);
  onClick?: (event?: MouseEvent) => void;
}

export interface ConversationsProps extends Omit<
  HTMLAttributes,
  "onClick" | "class" | "style"
> {
  items?: ItemType[];
  activeKey?: ConversationItemType["key"];
  defaultActiveKey?: ConversationItemType["key"];
  onActiveChange?: (
    value: ConversationItemType["key"],
    item?: ItemType,
  ) => void;
  menu?:
    | ConversationsItemMenu
    | ((value: ConversationItemType) => ConversationsItemMenu);
  groupable?: boolean | GroupableProps;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  classes?: Partial<Record<SemanticType, string>>;
  prefixCls?: string;
  rootClass?: string;
  class?: ClassValue;
  style?: StyleValue;
  shortcutKeys?: {
    creation?: ShortcutKeys<number>;
    items?: ShortcutKeys<"number"> | ShortcutKeys<number>[];
  };
  creation?: CreationProps;
}
