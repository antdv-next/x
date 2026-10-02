import type { CSSProperties } from "vue";

import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from "../_util/semantic";

/**
 * 消息导航导轨的预览项元数据。
 *
 * `id` 需要与消息 DOM 节点上 `itemSelector` 指向的属性值一致，
 * 组件按该标识把元数据关联到真实节点上。
 */
export interface MessageScrollerItem {
  /** 与 `itemSelector` 属性值一致的消息标识。 */
  id: string | number;
  /** 导轨预览卡片的标题，缺省时取消息节点文本。 */
  title?: string;
  /** 导轨预览卡片的描述。 */
  description?: string;
  [key: string]: unknown;
}

export type MessageScrollerNavigation = "rail";

export interface MessageScrollerSemanticClassNames {
  /** 组件根元素，承载尺寸与定位。 */
  root?: string;
  /** 原生滚动视口。 */
  viewport?: string;
  /** 视口内容层，承载默认插槽。 */
  content?: string;
  /** 消息导航导轨容器。 */
  rail?: string;
  /** 导轨中的单个消息刻度项。 */
  railItem?: string;
  /** 导轨刻度条。 */
  railTick?: string;
  /** 单例滑动的导轨预览卡片。 */
  preview?: string;
  /** 回到最新按钮。 */
  backToBottom?: string;
}

export interface MessageScrollerSemanticStyles {
  root?: CSSProperties;
  viewport?: CSSProperties;
  content?: CSSProperties;
  rail?: CSSProperties;
  railItem?: CSSProperties;
  railTick?: CSSProperties;
  preview?: CSSProperties;
  backToBottom?: CSSProperties;
}

export type MessageScrollerClassNamesType = SemanticClassNamesType<
  MessageScrollerProps,
  MessageScrollerSemanticClassNames
>;
export type MessageScrollerStylesType = SemanticStylesType<
  MessageScrollerProps,
  MessageScrollerSemanticStyles
>;

export interface MessageScrollerProps {
  prefixCls?: string;
  rootClass?: string;
  /**
   * 是否处于跟随状态，受控。
   *
   * 缺省为组件内部维护，支持 `v-model:follow`。
   */
  follow?: boolean;
  /**
   * 判定视口处于底部的距离阈值，单位 px。
   *
   * @default 56
   */
  followThreshold?: number;
  /**
   * 是否以平滑滚动跟随流式内容。
   *
   * @default true
   */
  smooth?: boolean;
  /** 内容仍在流式流入，映射为 `aria-busy`。 */
  busy?: boolean;
  /** 开启消息导航导轨。 */
  navigation?: MessageScrollerNavigation;
  /** 导轨预览项元数据，按 `id` 关联到消息节点。 */
  items?: MessageScrollerItem[];
  /**
   * 定位消息 DOM 节点的选择器。
   *
   * @default '[data-message-id]'
   */
  itemSelector?: string;
  /**
   * 是否展示回到最新按钮。
   *
   * @default false
   */
  backToBottom?: boolean;
  /** 用于自定义组件内部各语义化结构的 class，支持对象或函数。 */
  classes?: MessageScrollerClassNamesType;
  /** 用于自定义组件内部各语义化结构的行内 style，支持对象或函数。 */
  styles?: MessageScrollerStylesType;
}

export interface MessageScrollerRailItemSlotProps {
  item: MessageScrollerItem;
  active: boolean;
  index: number;
  /** 邻近衰减后的刻度缩放比例，取值 1 / 0.68 / 0.44 / 0.25。 */
  scale: number;
}

export interface MessageScrollerPreviewSlotProps {
  item: MessageScrollerItem;
  index: number;
}

export interface MessageScrollerBackToBottomSlotProps {
  scrollToEnd: () => void;
  following: boolean;
}

export interface MessageScrollerSlots {
  default?: () => any;
  railItem?: (slotProps: MessageScrollerRailItemSlotProps) => any;
  preview?: (slotProps: MessageScrollerPreviewSlotProps) => any;
  backToBottom?: (slotProps: MessageScrollerBackToBottomSlotProps) => any;
}

export interface MessageScrollerEmits {
  /** 跟随状态变化时触发。 */
  followChange: (following: boolean) => void;
  /** 配合 `v-model:follow` 使用。 */
  "update:follow": (following: boolean) => void;
  /** 视口滚动时触发。 */
  scroll: (event: Event) => void;
  /** 选中导轨消息项时触发。 */
  railItemSelect: (id: string | number, item?: MessageScrollerItem) => void;
}

export interface MessageScrollerRef {
  /** 组件根元素。 */
  nativeElement: HTMLElement | null;
  /** 原生滚动视口元素。 */
  viewportElement: HTMLElement | null;
  /** 视口内容层元素。 */
  contentElement: HTMLElement | null;
  /** 当前是否处于跟随状态。 */
  following: boolean;
  /** 滚动到底部。 */
  scrollToEnd: (options?: { behavior?: ScrollBehavior }) => void;
  /** 平滑定位到指定消息。 */
  scrollToItem: (
    target: string | number,
    options?: { behavior?: ScrollBehavior },
  ) => void;
  /** 设置跟随状态，设为 `true` 时同时贴底。 */
  setFollowing: (following: boolean) => void;
}
