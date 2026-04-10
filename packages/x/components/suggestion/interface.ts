import type { CascaderProps } from "antdv-next";
import type { CSSProperties, ClassValue, StyleValue, VNodeChild } from "vue";

export type SemanticType = "root" | "content" | "popup";

export interface SuggestionItem extends Record<PropertyKey, any> {
  label: VNodeChild;
  value: string;
  icon?: VNodeChild;
  children?: SuggestionItem[];
  extra?: VNodeChild;
}

export interface RenderChildrenProps<T = any> {
  onTrigger: (info?: T | false) => void;
  onKeyDown: (event: KeyboardEvent) => void | false;
  open: boolean;
}

export interface SuggestionItemRenderInfo {
  item: SuggestionItem;
  originNode: VNodeChild;
}

export interface SuggestionProps<T = any> extends Omit<
  CascaderProps<SuggestionItem>,
  | "onChange"
  | "optionRender"
  | "value"
  | "options"
  | "multiple"
  | "showSearch"
  | "defaultValue"
  | "fieldNames"
  | "onOpenChange"
  | "onDropdownVisibleChange"
  | "onPopupVisibleChange"
  | "open"
  | "rootClass"
  | "placement"
  | "styles"
  | "classes"
> {
  prefixCls?: string;
  rootClass?: string;
  class?: ClassValue;
  style?: StyleValue;
  open?: boolean;
  items: SuggestionItem[] | ((info?: T) => SuggestionItem[]);
  block?: boolean;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  classes?: Partial<Record<SemanticType, string>>;
}
