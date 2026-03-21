import type {
  ClassValue,
  CSSProperties,
  HTMLAttributes,
  StyleValue,
  VNodeChild,
} from "vue";

import type { AnyObject } from "../_utils/type";

export type BubbleContentType = VNodeChild | AnyObject | string | number;

export type SemanticType =
  | "root"
  | "content"
  | "body"
  | "header"
  | "footer"
  | "avatar"
  | "extra";
export type ListSemanticType =
  | "root"
  | "content"
  | "body"
  | "header"
  | "footer"
  | "avatar"
  | "extra"
  | "scroll"
  | "bubble"
  | "system"
  | "divider";

export interface BubbleAnimationOption {
  effect: "typing" | "fade-in";
  step?: number | [number, number];
  interval?: number;
  keepPrefix?: boolean;
}

export interface EditableBubbleOption {
  editing?: boolean;
  okText?: VNodeChild;
  cancelText?: VNodeChild;
}

export interface BubbleRef {
  nativeElement: HTMLDivElement;
}

export enum MessageStatus {
  local = "local",
  loading = "loading",
  updating = "updating",
  success = "success",
  error = "error",
  abort = "abort",
}

export interface Info {
  status?: `${MessageStatus}`;
  key?: string | number;
  extraInfo?: AnyObject;
}

export type Placement = "start" | "end";

export type BubbleSlot<ContentType> =
  | VNodeChild
  | ((content: ContentType, info: Info) => VNodeChild);

export interface BubbleProps<
  ContentType extends BubbleContentType = string,
> extends Omit<HTMLAttributes, "content"> {
  prefixCls?: string;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  rootClass?: string;
  classes?: Partial<Record<SemanticType, string>>;
  placement?: Placement;
  loading?: boolean;
  loadingRender?: () => VNodeChild;
  content: ContentType;
  contentRender?: (content: ContentType, info: Info) => VNodeChild;
  editable?: boolean | EditableBubbleOption;
  typing?:
    | boolean
    | BubbleAnimationOption
    | ((content: ContentType, info: Info) => boolean | BubbleAnimationOption);
  streaming?: boolean;
  variant?: "filled" | "outlined" | "shadow" | "borderless";
  shape?: "default" | "round" | "corner";
  footerPlacement?: "outer-start" | "outer-end" | "inner-start" | "inner-end";
  header?: BubbleSlot<ContentType>;
  footer?: BubbleSlot<ContentType>;
  avatar?: BubbleSlot<ContentType>;
  extra?: BubbleSlot<ContentType>;
  onTyping?: (rendererContent: string, currentContent: string) => void;
  onTypingComplete?: (content: string) => void;
  onEditConfirm?: (content: string) => void;
  onEditCancel?: () => void;
  info?: Info;
}

type SystemBubbleSemanticName = "root" | "body" | "content";

export interface SystemBubbleProps<
  ContentType extends BubbleContentType = string,
> extends Pick<
  BubbleProps<ContentType>,
  | "prefixCls"
  | "content"
  | "style"
  | "class"
  | "rootClass"
  | "variant"
  | "shape"
> {
  styles?: Partial<Record<SystemBubbleSemanticName, CSSProperties>>;
  classes?: Partial<Record<SystemBubbleSemanticName, string>>;
}

export interface DividerBubbleProps<
  ContentType extends BubbleContentType = string,
> {
  prefixCls?: string;
  rootClass?: string;
  style?: StyleValue;
  class?: ClassValue;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  classes?: Partial<Record<SemanticType, string>>;
  content?: ContentType;
  dividerProps?: Record<string, any>;
}

export interface BubbleListRef {
  nativeElement: HTMLDivElement;
  scrollBoxNativeElement: HTMLDivElement;
  scrollTo: (options: {
    key?: string | number;
    top?: number | "bottom" | "top";
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
  }) => void;
}

type BuiltinRole = "ai" | "system" | "user" | "divider";
type RoleName = BuiltinRole | (string & {});

export type BubbleItemType = (Omit<
  BubbleProps<any>,
  "styles" | "classes" | "info"
> &
  Omit<DividerBubbleProps<any>, "styles" | "classes">) & {
  key: string | number;
  role: RoleName;
  status?: `${MessageStatus}`;
  extraInfo?: AnyObject;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  classes?: Partial<Record<SemanticType, string>>;
};

export type RoleProps = Pick<
  BubbleProps<any>,
  | "typing"
  | "variant"
  | "shape"
  | "placement"
  | "rootClass"
  | "classes"
  | "class"
  | "styles"
  | "style"
  | "loading"
  | "loadingRender"
  | "contentRender"
  | "footerPlacement"
  | "header"
  | "footer"
  | "extra"
  | "avatar"
  | "editable"
  | "onTyping"
  | "onTypingComplete"
  | "onEditConfirm"
  | "onEditCancel"
>;

export type FuncRoleProps = (data: BubbleItemType) => RoleProps;

export type DividerRoleProps = Partial<DividerBubbleProps>;
export type FuncDividerRoleProps = (data: BubbleItemType) => DividerRoleProps;

export type RoleType = Partial<
  Record<Exclude<BuiltinRole, "divider">, RoleProps | FuncRoleProps>
> & {
  divider?: DividerRoleProps | FuncDividerRoleProps;
} & Record<string, RoleProps | FuncRoleProps>;

export interface BubbleListProps extends Omit<HTMLAttributes, "role"> {
  prefixCls?: string;
  styles?: Partial<Record<ListSemanticType, CSSProperties>>;
  classes?: Partial<Record<ListSemanticType, string>>;
  rootClass?: string;
  items: BubbleItemType[];
  autoScroll?: boolean;
  role?: RoleType;
  onScroll?: (event: Event) => void;
}
