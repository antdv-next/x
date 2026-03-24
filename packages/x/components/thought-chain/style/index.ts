import { FastColor } from "@ant-design/fast-color";
import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type { GetDefaultToken } from "../../theme/interface";
import type { ThoughtChainToken } from "./thought-chain";

import { blinkMotion } from "../../style/motion/blink";
import { genCollapseMotion } from "../../style/motion/collapse";
import { genStyleHooks } from "../../theme/genStyleUtils";
import genItemStyle from "./item";
import genThoughtChainStyle from "./thought-chain";

export const prepareComponentToken: GetDefaultToken<"ThoughtChain"> = token => {
  const itemMotionDescription = new FastColor(token.colorTextDescription)
    .setA(0.25)
    .toRgbString();
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
  const colorSuccessDisabled = new FastColor(token.colorSuccess)
    .setA(0.45)
    .toRgbString();
  const colorPrimaryDisabled = new FastColor(token.colorPrimary)
    .setA(0.45)
    .toRgbString();

  return {
    colorTextBlink: token.colorTextBase,
    colorTextBlinkDefault: token.colorTextDescription,
    itemSolidBg: token.colorFillTertiary,
    itemSolidHoverBg,
    itemOutlinedBg: token.colorBgContainer,
    itemOutlinedHoverBg: itemSolidHoverBg,
    itemBorderRadius: token.borderRadius,
    iconSize: token.fontSize,
    itemMotionDescription,
    colorErrorTextDescription,
    colorErrorTextDisabled,
    colorErrorTextDescriptionDisabled,
    colorErrorBgDisabled,
    colorDescriptionDisabled,
    colorTitleDisabled,
    colorSuccessDisabled,
    colorPrimaryDisabled,
  };
};

export interface ComponentToken {
  colorTextBlink: string;
  colorTextBlinkDefault: string;
  itemSolidBg: string;
  itemSolidHoverBg: string;
  itemOutlinedBg: string;
  itemOutlinedHoverBg: string;
  itemBorderRadius: number;
  iconSize: number;
  itemMotionDescription: string;
  colorErrorTextDescription: string;
  colorErrorTextDisabled: string;
  colorErrorTextDescriptionDisabled: string;
  colorErrorBgDisabled: string;
  colorDescriptionDisabled: string;
  colorTitleDisabled: string;
  colorSuccessDisabled: string;
  colorPrimaryDisabled: string;
}

export default genStyleHooks<"ThoughtChain">(
  "ThoughtChain",
  token => {
    const chainToken = mergeToken<ThoughtChainToken>(token, {});
    return [
      genThoughtChainStyle(chainToken),
      genItemStyle(chainToken as any),
      genCollapseMotion(chainToken),
      blinkMotion(chainToken as any, `${chainToken.componentCls}-motion-blink`),
    ];
  },
  prepareComponentToken,
);
