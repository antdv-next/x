import type {
  CSSProperties,
  HTMLAttributes,
  StyleValue,
  VNodeChild,
} from "vue";

export type SemanticType = "root" | "status" | "content";

export interface ThinkProps extends Omit<HTMLAttributes, "title"> {
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
   * @desc Title displayed in the status header
   * @descZH 状态栏标题
   */
  title?: VNodeChild;

  /**
   * @desc Custom icon shown when not loading
   * @descZH 非加载状态的自定义图标
   */
  icon?: VNodeChild;

  /**
   * @desc Loading state. true shows spinner, VNodeChild shows custom loading indicator
   * @descZH 加载状态。true 显示 spinner，VNodeChild 显示自定义加载指示器
   */
  loading?: VNodeChild;

  /**
   * @desc Whether content is expanded (controlled)
   * @descZH 内容是否展开（受控）
   */
  expanded?: boolean;

  /**
   * @desc Initial expanded state (uncontrolled)
   * @descZH 初始展开状态（非受控）
   */
  defaultExpanded?: boolean;

  /**
   * @desc Enable blink shimmer animation on title text
   * @descZH 标题文字闪烁动画
   */
  blink?: boolean;
}

export interface ThinkRef {
  nativeElement: HTMLDivElement;
}
