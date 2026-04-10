import type {
  ClassValue,
  CSSProperties,
  HTMLAttributes,
  StyleValue,
  VNodeChild,
} from "vue";

export type SemanticType =
  | "root"
  | "list"
  | "item"
  | "itemContent"
  | "title"
  | "subList"
  | "subItem";

export interface BasePromptsItemType extends Omit<
  HTMLAttributes,
  "onClick" | "class" | "style" | "children"
> {
  key: string | number;
  icon?: VNodeChild;
  label?: VNodeChild;
  description?: VNodeChild;
  disabled?: boolean;
  class?: ClassValue;
  style?: StyleValue;
}

export interface PromptsItemType extends BasePromptsItemType {
  children?: BasePromptsItemType[];
}

export type PromptDataItem = BasePromptsItemType | PromptsItemType;

export interface PromptsClickInfo {
  data: PromptDataItem;
}

export interface PromptsTitleSlotInfo {
  originNode: VNodeChild;
}

export interface PromptsItemSlotInfo {
  item: PromptDataItem;
  originNode: VNodeChild;
  index: number;
  nested: boolean;
}

export interface PromptsRef {
  nativeElement: HTMLDivElement;
}

export interface PromptsProps extends Omit<
  HTMLAttributes,
  "title" | "class" | "style"
> {
  items?: PromptsItemType[];
  title?: VNodeChild;
  vertical?: boolean;
  wrap?: boolean;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  classes?: Partial<Record<SemanticType, string>>;
  prefixCls?: string;
  rootClass?: string;
  class?: ClassValue;
  style?: StyleValue;
  fadeIn?: boolean;
  fadeInLeft?: boolean;
}
