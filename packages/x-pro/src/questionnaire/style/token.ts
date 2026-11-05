import type { AliasToken } from "antdv-next/theme/internal";

export interface ComponentToken {
  /**
   * @desc 选项行最小高度，实际高度随文案和内边距增长。
   * @descEN Minimum option row height; content and padding may make the row taller.
   */
  optionMinHeight: number;
  /**
   * @desc 选项列表最大高度，超出后在列表内滚动。
   * @descEN Maximum option list height, with scrolling for overflow.
   */
  optionsMaxHeight: number;
  /**
   * @desc 面板内边距，窄屏（≤480px）使用全局 padding token。
   * @descEN Panel padding; viewports at or below 480px use the global padding token.
   */
  panelPadding: number;
  /**
   * @desc 状态与折叠过渡时长，不包含自动前进等待时间和换题淡入时长。
   * @descEN State and disclosure transition duration, excluding auto-advance delay and question fade-in.
   */
  motionDuration: string;
}
export function prepareComponentToken(token: AliasToken): ComponentToken {
  return {
    optionMinHeight: Math.max(36, token.controlHeight),
    optionsMaxHeight: 360,
    panelPadding: token.padding,
    motionDuration: "0.2s",
  };
}
