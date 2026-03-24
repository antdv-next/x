import type {
  CSSProperties,
  HTMLAttributes,
  StyleValue,
  VNodeChild,
} from "vue";

// ======================== ThoughtChain ========================

export type SemanticType =
  | "root"
  | "item"
  | "itemHeader"
  | "itemIcon"
  | "itemContent"
  | "itemFooter";

export type ThoughtChainItemStatus = "loading" | "success" | "error" | "abort";

export interface ThoughtChainItemType {
  /**
   * @desc Unique key for the thought node
   * @descZH 节点唯一标识
   */
  key?: string;

  /**
   * @desc Title of the thought node
   * @descZH 节点标题
   */
  title?: VNodeChild;

  /**
   * @desc Description beside/below the title
   * @descZH 节点描述
   */
  description?: VNodeChild;

  /**
   * @desc Main content body (collapsible)
   * @descZH 节点内容（可折叠）
   */
  content?: VNodeChild;

  /**
   * @desc Footer area
   * @descZH 底部区域
   */
  footer?: VNodeChild;

  /**
   * @desc Custom icon; false hides the icon
   * @descZH 自定义图标；false 隐藏图标
   */
  icon?: false | VNodeChild;

  /**
   * @desc Status of the thought node
   * @descZH 节点状态
   */
  status?: ThoughtChainItemStatus;

  /**
   * @desc Whether the content can be collapsed
   * @descZH 是否可折叠
   */
  collapsible?: boolean;

  /**
   * @desc Enable blink animation on the title
   * @descZH 标题闪烁动画
   */
  blink?: boolean;
}

export interface ThoughtChainProps extends Omit<HTMLAttributes, "title"> {
  /**
   * @desc CSS class prefix
   * @descZH CSS 类名前缀
   */
  prefixCls?: string;

  /**
   * @desc Root CSS class name
   * @descZH 根节点 CSS 类名
   */
  rootClass?: string;

  /**
   * @desc Custom class name
   * @descZH 自定义类名
   */
  class?: any;

  /**
   * @desc Custom style
   * @descZH 自定义样式
   */
  style?: StyleValue;

  /**
   * @desc Semantic CSS class overrides
   * @descZH 语义化 CSS 类名
   */
  classes?: Partial<Record<SemanticType, string>>;

  /**
   * @desc Semantic style overrides
   * @descZH 语义化样式
   */
  styles?: Partial<Record<SemanticType, CSSProperties>>;

  /**
   * @desc Collection of thought nodes
   * @descZH 思维链节点集合
   */
  items?: ThoughtChainItemType[];

  /**
   * @desc Initially expanded node keys (uncontrolled)
   * @descZH 初始展开节点 key 列表（非受控）
   */
  defaultExpandedKeys?: string[];

  /**
   * @desc Currently expanded node keys (controlled)
   * @descZH 当前展开节点 key 列表（受控）
   */
  expandedKeys?: string[];

  /**
   * @desc Line style connecting nodes; false hides lines
   * @descZH 连接线样式；false 隐藏连接线
   */
  line?: boolean | "solid" | "dashed" | "dotted";
}

export interface ThoughtChainRef {
  nativeElement: HTMLDivElement;
}

// ======================== ThoughtChain.Item ========================

export type ThoughtChainItemSemanticType =
  | "root"
  | "icon"
  | "title"
  | "description";

export interface ThoughtChainItemProps extends Omit<
  HTMLAttributes,
  "title" | "onClick"
> {
  /**
   * @desc CSS class prefix
   * @descZH CSS 类名前缀
   */
  prefixCls?: string;

  /**
   * @desc Root CSS class name
   * @descZH 根节点 CSS 类名
   */
  rootClass?: string;

  /**
   * @desc Custom icon
   * @descZH 自定义图标
   */
  icon?: VNodeChild;

  /**
   * @desc Title
   * @descZH 标题
   */
  title?: VNodeChild;

  /**
   * @desc Description text
   * @descZH 描述文字
   */
  description?: VNodeChild;

  /**
   * @desc Status indicator
   * @descZH 状态指示器
   */
  status?: ThoughtChainItemStatus;

  /**
   * @desc Visual variant
   * @descZH 视觉变体
   */
  variant?: "solid" | "outlined" | "text";

  /**
   * @desc Enable blink animation
   * @descZH 闪烁动画
   */
  blink?: boolean;

  /**
   * @desc Disabled state
   * @descZH 禁用状态
   */
  disabled?: boolean;

  /**
   * @desc Click handler
   * @descZH 点击回调
   */
  onClick?: (e: MouseEvent) => void;

  /**
   * @desc Semantic CSS class overrides
   * @descZH 语义化 CSS 类名
   */
  classes?: Partial<Record<ThoughtChainItemSemanticType, string>>;

  /**
   * @desc Semantic style overrides
   * @descZH 语义化样式
   */
  styles?: Partial<Record<ThoughtChainItemSemanticType, CSSProperties>>;
}
