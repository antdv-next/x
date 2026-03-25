import type {
  ClassValue,
  CSSProperties,
  HTMLAttributes,
  StyleValue,
  VNodeChild,
} from "vue";

export type SemanticType = "root" | "title" | "description" | "icon" | "extra";

export interface WelcomeRef {
  nativeElement: HTMLElement;
}

export interface WelcomeProps extends Omit<
  HTMLAttributes,
  "title" | "class" | "style"
> {
  prefixCls?: string;
  style?: StyleValue;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  class?: ClassValue;
  classes?: Partial<Record<SemanticType, string>>;
  rootClass?: string;
  variant?: "filled" | "borderless";
  icon?: VNodeChild;
  title?: VNodeChild;
  description?: VNodeChild;
  extra?: VNodeChild;
}
