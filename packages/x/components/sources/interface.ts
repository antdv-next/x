import type {
  ClassValue,
  CSSProperties,
  HTMLAttributes,
  StyleValue,
  VNodeChild,
} from "vue";

export type SemanticType = "root" | "title" | "content";

export interface SourcesItem {
  key?: string | number;
  title: VNodeChild;
  url?: string;
  icon?: VNodeChild;
  description?: VNodeChild;
}

export interface SourcesTitleSlotInfo {
  originNode: VNodeChild;
}

export interface SourcesItemSlotInfo {
  item: SourcesItem;
  index: number;
  originNode: VNodeChild;
}

export interface SourcesRef {
  nativeElement: HTMLElement;
}

export interface SourcesProps extends Omit<
  HTMLAttributes,
  "title" | "onClick" | "class" | "style"
> {
  prefixCls?: string;
  style?: StyleValue;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  class?: ClassValue;
  classes?: Partial<Record<SemanticType, string>>;
  rootClass?: string;
  inline?: boolean;
  items?: SourcesItem[];
  title?: VNodeChild;
  expandIconPosition?: "start" | "end";
  onClick?: (item: SourcesItem) => void;
  popoverOverlayWidth?: number | string;
  activeKey?: string | number;
  expanded?: boolean;
  defaultExpanded?: boolean;
}
