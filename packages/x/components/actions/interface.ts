import type { DropdownProps, MenuProps } from "antdv-next";
import type {
  ClassValue,
  CSSProperties,
  HTMLAttributes,
  StyleValue,
  VNodeChild,
} from "vue";

export type SemanticType = "root" | "item" | "itemDropdown";

export interface ActionsRef {
  nativeElement: HTMLDivElement;
}

export interface ItemType {
  key?: string | number;
  label?: string;
  icon?: VNodeChild;
  onItemClick?: (info?: ItemType) => void;
  danger?: boolean;
  subItems?: Omit<
    ItemType,
    "subItems" | "triggerSubMenuAction" | "actionRender"
  >[];
  triggerSubMenuAction?: MenuProps["triggerSubMenuAction"];
  actionRender?: ((item: ItemType) => VNodeChild) | VNodeChild;
}

export interface ActionsClickInfo {
  item: ItemType;
  key: string;
  keyPath: string[];
  domEvent: MouseEvent | KeyboardEvent | Event;
}

export interface ActionsProps extends Omit<
  HTMLAttributes,
  "onClick" | "class" | "style"
> {
  items: ItemType[];
  onClick?: (menuInfo: ActionsClickInfo) => void;
  dropdownProps?: DropdownProps;
  variant?: "borderless" | "filled" | "outlined";
  prefixCls?: string;
  rootClass?: string;
  class?: ClassValue;
  style?: StyleValue;
  classes?: Partial<Record<SemanticType, string>>;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  fadeIn?: boolean;
  fadeInLeft?: boolean;
}

export interface ActionsItemProps extends Omit<
  ActionsProps,
  "items" | "variant"
> {
  item: ItemType;
}
