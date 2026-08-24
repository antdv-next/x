import { FastColor } from "@ant-design/fast-color";
import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type { GetDefaultToken } from "../../theme/interface";
import type { ThoughtChainToken } from "./thought-chain";

import { blinkMotion } from "../../style/motion/blink";
import { genCollapseMotion } from "../../style/motion/collapse";
import { genStyleHooks } from "../../theme/genStyleUtils";
import genItemStyle from "./item";
import genThoughtChainStyle from "./thought-chain";

export interface ComponentToken {
  /**
   * @desc 实心的 ThoughtChain.Item 背景色
   * @descEN ThoughtChain.Item `solid`'s background color
   */
  itemSolidBg: string;
  /**
   * @desc 实心的 ThoughtChain.Item 悬浮态背景色
   * @descEN ThoughtChain.Item `solid`'s hover background color
   */
  itemSolidHoverBg: string;
  /**
   * @desc 边框模式的 ThoughtChain.Item 背景色
   * @descEN ThoughtChain.Item `outlined`'s background color
   */
  itemOutlinedBg: string;
  /**
   * @desc 边框模式的 ThoughtChain.Item 悬浮态背景色
   * @descEN ThoughtChain.Item `outlined`'s hover background color
   */
  itemOutlinedHoverBg: string;
  /**
   * @desc ThoughtChain.Item 圆角
   * @descEN ThoughtChain.Item's border radius
   */
  itemBorderRadius: number;
  /**
   * @desc 图标容器尺寸
   * @descEN ThoughtChain.Item `outlined`'s hover background color
   */
  iconSize: number;
  /**
   * @desc 思维链节点描述文字的动画颜色
   * @descEN ThoughtChain node description text animation color
   */
  itemMotionDescription: string;
  /**
   * @desc 默认打字动画颜色
   * @descEN Default typing animation color
   */
  colorTextBlinkDefault: string;
  /**
   * @desc 打字动画颜色
   * @descEN Typing animation color
   */
  colorTextBlink: string;
  /**
   * @desc 错误状态描述文字颜色
   * @descEN Error state description text color
   */
  colorErrorTextDescription: string;
  /**
   * @desc 错误状态禁用文字颜色
   * @descEN Error state disabled text color
   */
  colorErrorTextDisabled: string;
  /**
   * @desc 错误状态禁用描述文字颜色
   * @descEN Error state disabled description text color
   */
  colorErrorTextDescriptionDisabled: string;
  /**
   * @desc 错误状态禁用背景色
   * @descEN Error state disabled background color
   */
  colorErrorBgDisabled: string;
  /**
   * @desc 禁用描述文字颜色
   * @descEN Disabled description text color
   */
  colorDescriptionDisabled: string;
  /**
   * @desc 禁用标题文字颜色
   * @descEN Disabled title text color
   */
  colorTitleDisabled: string;
  /**
   * @desc 成功状态禁用颜色
   * @descEN Success state disabled color
   */
  colorSuccessDisabled: string;
  /**
   * @desc 主要状态禁用颜色
   * @descEN Primary state disabled color
   */
  colorPrimaryDisabled: string;
}

export const prepareComponentToken: GetDefaultToken<"ThoughtChain"> = token => {
  const itemMotionDescription = new FastColor(token.colorTextDescription)
    .setA(0.25)
    .toRgbString();
  const colorTextBlinkDefault = token.colorTextDescription;
  const colorTextBlink = token.colorTextBase;
  const colorErrorTextDescription = new FastColor(token.colorErrorText)
    .setA(0.45)
    .toRgbString();
  const colorErrorTextDisabled = new FastColor(token.colorErrorText)
    .setA(0.45)
    .toRgbString();
  const itemSolidHoverBg = new FastColor(token.colorFillTertiary)
    .setA(0.06)
    .toRgbString();
  const colorErrorTextDescriptionDisabled = new FastColor(token.colorErrorText)
    .setA(0.25)
    .toRgbString();
  const colorDescriptionDisabled = new FastColor(token.colorTextDescription)
    .setA(0.25)
    .toRgbString();
  const colorTitleDisabled = new FastColor(token.colorText)
    .setA(0.45)
    .toRgbString();
  const colorErrorBgDisabled = new FastColor(token.colorErrorBg)
    .setA(0.25)
    .toRgbString();
  const itemOutlinedHoverBg = itemSolidHoverBg;
  const colorSuccessDisabled = new FastColor(token.colorSuccess)
    .setA(0.45)
    .toRgbString();
  const colorPrimaryDisabled = new FastColor(token.colorPrimary)
    .setA(0.45)
    .toRgbString();
  return {
    colorDescriptionDisabled,
    colorPrimaryDisabled,
    colorSuccessDisabled,
    colorTitleDisabled,
    colorErrorTextDisabled,
    colorErrorBgDisabled,
    colorErrorTextDescriptionDisabled,
    itemMotionDescription,
    colorTextBlinkDefault,
    colorTextBlink,
    itemSolidBg: token.colorFillTertiary,
    itemSolidHoverBg,
    itemOutlinedBg: token.colorBgContainer,
    itemOutlinedHoverBg,
    itemBorderRadius: token.borderRadius,
    iconSize: token.fontSize,
    titleFontSize: token.fontSize,
    descriptionFontSize: token.fontSize,
    nodePadding: token.paddingSM,
    titleFontWeight: 500,
    borderColor: token.colorBorder,
    borderWidth: token.lineWidth,
    connectorColor: token.colorFillContent,
    connectorWidth: token.lineWidth,
    colorErrorTextDescription,
    hoverTransitionDuration: `${token.motionDurationMid} ${token.motionEaseInOut}`,
  };
};

export default genStyleHooks<"ThoughtChain">(
  "ThoughtChain",
  token => {
    const chainToken = mergeToken<ThoughtChainToken>(token, {});
    return [
      genThoughtChainStyle(chainToken),
      genItemStyle(chainToken),
      genCollapseMotion(chainToken),
      blinkMotion(chainToken, `${chainToken.componentCls}-motion-blink`),
    ];
  },
  prepareComponentToken,
);
