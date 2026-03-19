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
  rootClassName?: string;
  inline?: boolean;
  items?: SourcesItem[];
  title?: VNodeChild;
  expandIconPosition?: "start" | "end";
  onClick?: (item: SourcesItem) => void;
  popoverOverlayWidth?: number | string;
  activeKey?: string | number;
  expanded?: boolean;
  onExpand?: (expand: boolean) => void;
  defaultExpanded?: boolean;
}
