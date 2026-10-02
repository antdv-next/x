import type { AliasToken } from "antdv-next/theme/internal";

export interface ComponentToken {
  /**
   * @desc 导轨宽度。
   * @descEN Width of the message navigation rail.
   */
  railWidth: number;
  /**
   * @desc 导轨相对视口上下边缘的内缩距离。
   * @descEN Vertical inset between the rail and the viewport edges.
   */
  railInset: number;
  /**
   * @desc 导轨单项高度。
   * @descEN Height of a single rail item.
   */
  railItemHeight: number;
  /**
   * @desc 刻度条宽度。
   * @descEN Width of a rail tick.
   */
  railTickWidth: number;
  /**
   * @desc 刻度条高度。
   * @descEN Height of a rail tick.
   */
  railTickHeight: number;
  /**
   * @desc 刻度条颜色。
   * @descEN Color of the rail tick.
   */
  railTickColor: string;
  /**
   * @desc 高亮刻度条颜色。
   * @descEN Color of the highlighted rail tick.
   */
  railTickHighlightColor: string;
  /**
   * @desc 当前项刻度条颜色。
   * @descEN Color of the active rail tick.
   */
  railTickActiveColor: string;
  /**
   * @desc 预览卡片宽度。
   * @descEN Width of the preview card.
   */
  previewWidth: number;
  /**
   * @desc 预览卡片背景色。
   * @descEN Background color of the preview card.
   */
  previewBg: string;
  /**
   * @desc 预览卡片边框色。
   * @descEN Border color of the preview card.
   */
  previewBorderColor: string;
  /**
   * @desc 预览卡片阴影。
   * @descEN Shadow of the preview card.
   */
  previewShadow: string;
  /**
   * @desc 预览卡片标题颜色。
   * @descEN Title color of the preview card.
   */
  previewTitleColor: string;
  /**
   * @desc 预览卡片描述颜色。
   * @descEN Description color of the preview card.
   */
  previewDescriptionColor: string;
  /**
   * @desc 回到最新按钮背景色。
   * @descEN Background color of the back-to-latest button.
   */
  backToBottomBg: string;
  /**
   * @desc 回到最新按钮文字颜色。
   * @descEN Text color of the back-to-latest button.
   */
  backToBottomColor: string;
  /**
   * @desc 回到最新按钮边框色。
   * @descEN Border color of the back-to-latest button.
   */
  backToBottomBorderColor: string;
  /**
   * @desc 回到最新按钮阴影。
   * @descEN Shadow of the back-to-latest button.
   */
  backToBottomShadow: string;
  /**
   * @desc 导轨与预览卡片的动效时长。
   * @descEN Motion duration shared by the rail and the preview card.
   */
  motionDuration: string;
  /**
   * @desc 导轨与预览卡片的动效曲线，过阻尼弹簧的平滑近似。
   * @descEN Motion easing of the rail and the preview card, a smooth approximation of a critically damped spring.
   */
  motionEase: string;
}

/** 导轨相对视口上下边缘的内缩距离，默认值，单位 px。 */
export const RAIL_INSET = 12;
/** 导轨单项高度默认值，单位 px。 */
export const DEFAULT_RAIL_ITEM_HEIGHT = 14;
/** 导轨单项高度下限，单位 px。 */
export const MIN_RAIL_ITEM_HEIGHT = 6;

/**
 * 刻度缩放的 CSS 变量名。
 *
 * 样式的 `var()` 与组件下发的行内变量必须共用同一名字，所以由前缀派生一次。
 */
export function resolveRailScaleVar(prefixCls: string) {
  return `--${prefixCls}-rail-scale`;
}

/**
 * 视口内容仍在流式流入时的动效时长。
 *
 * 与 `ComponentToken.motionDuration` 分开，因为贴底跟随比导轨切换更短促。
 */
export const FOLLOW_MOTION_DURATION = "200ms";
/** 过阻尼弹簧 `spring(360, 32, 0.6)` 的 CSS 近似，阻尼比 ζ ≈ 1.09，无回弹。 */
export const FOLLOW_MOTION_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function prepareComponentToken(
  token: AliasToken & Partial<ComponentToken>,
): ComponentToken {
  return {
    railWidth: 28,
    railInset: RAIL_INSET,
    railItemHeight: DEFAULT_RAIL_ITEM_HEIGHT,
    railTickWidth: 16,
    railTickHeight: 2,
    railTickColor: token.colorTextQuaternary,
    railTickHighlightColor: token.colorTextSecondary,
    railTickActiveColor: token.colorText,
    previewWidth: 256,
    previewBg: token.colorBgElevated,
    previewBorderColor: token.colorBorderSecondary,
    previewShadow: token.boxShadowTertiary,
    previewTitleColor: token.colorText,
    previewDescriptionColor: token.colorTextSecondary,
    backToBottomBg: token.colorBgElevated,
    backToBottomColor: token.colorTextSecondary,
    backToBottomBorderColor: token.colorBorderSecondary,
    backToBottomShadow: token.boxShadowTertiary,
    motionDuration: token.motionDurationMid,
    motionEase: FOLLOW_MOTION_EASE,
  };
}
