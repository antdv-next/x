import type { AliasToken } from "antdv-next/theme/internal";

export interface ComponentToken {
  /**
   * @desc 头部高度。
   * @descEN Height of the header.
   */
  headerHeight: number;
  /**
   * @desc 状态图标尺寸。
   * @descEN Size of the status icon.
   */
  iconSize: number;
  /**
   * @desc 任务行之间的垂直间距。
   * @descEN Vertical gap between task rows.
   */
  itemGap: number;
  /**
   * @desc 进行中状态的颜色。
   * @descEN Color of the in-progress status.
   */
  colorStatusProgress: string;
  /**
   * @desc 已完成状态的颜色。
   * @descEN Color of the completed status.
   */
  colorStatusCompleted: string;
  /**
   * @desc 已取消状态的颜色。
   * @descEN Color of the cancelled status.
   */
  colorStatusCancelled: string;
  /**
   * @desc 待处理状态的颜色。
   * @descEN Color of the pending status.
   */
  colorStatusPending: string;
  /**
   * @desc 已完成任务标题的颜色。
   * @descEN Title color of a completed task.
   */
  colorTitleCompleted: string;
  /**
   * @desc 动效时长，用于状态图标、删除线等局部过渡。
   * @descEN Motion duration for local transitions such as the status icons and the strikethrough.
   */
  motionDuration: string;
  /**
   * @desc 展开面板的时长。
   * @descEN Duration of the expanding disclosure.
   */
  motionExpandDuration: string;
  /**
   * @desc 收起面板的时长；收起比展开短，退场不必像入场那样从容。
   * @descEN Duration of the collapsing disclosure. Shorter than expanding: an exit does not need the unhurried pace of an entrance.
   */
  motionCollapseDuration: string;
  /**
   * @desc 动效曲线，过阻尼弹簧的平滑近似。
   * @descEN Motion easing, a smooth approximation of a critically damped spring.
   */
  motionEase: string;
}

/** 任务列表最大高度默认值，单位 px。 */
export const DEFAULT_MAX_HEIGHT = 248;
/** 状态图标尺寸默认值，单位 px。 */
export const DEFAULT_ICON_SIZE = 16;

/** 过阻尼弹簧 `spring(360, 32, 0.6)` 的 CSS 近似，阻尼比 ζ ≈ 1.09，无回弹。 */
export const FOLLOW_MOTION_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** 面板展开时长。 */
export const DEFAULT_EXPAND_DURATION = "0.22s";
/** 面板收起时长。 */
export const DEFAULT_COLLAPSE_DURATION = "0.14s";

export function prepareComponentToken(
  token: AliasToken & Partial<ComponentToken>,
): ComponentToken {
  return {
    headerHeight: 24,
    iconSize: DEFAULT_ICON_SIZE,
    itemGap: token.marginXS,
    colorStatusProgress: token.colorPrimary,
    colorStatusCompleted: token.colorSuccess,
    colorStatusCancelled: token.colorTextQuaternary,
    colorStatusPending: token.colorTextQuaternary,
    colorTitleCompleted: token.colorTextTertiary,
    motionDuration: token.motionDurationMid,
    motionExpandDuration: DEFAULT_EXPAND_DURATION,
    motionCollapseDuration: DEFAULT_COLLAPSE_DURATION,
    motionEase: FOLLOW_MOTION_EASE,
  };
}
