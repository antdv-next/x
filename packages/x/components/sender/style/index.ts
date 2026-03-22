import { FastColor } from "@ant-design/fast-color";
import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from "../../theme/interface";

import { genStyleHooks } from "../../theme/genStyleUtils";
import genSenderHeaderStyle from "./header";
import genSenderSwitchStyle from "./switch";

export interface ComponentToken {
  colorBorderInput: string;
  switchCheckedBg: string;
  switchCheckedHoverBg: string;
  switchUncheckedHoverBg: string;
  colorTextActionsDisabled: string;
  colorBgActionsDisabled: string;
}

export interface SenderToken extends FullToken<"Sender"> {
  SenderContentMaxWidth: number | string;
}

const genSenderStyle: GenerateStyle<SenderToken> = (token) => {
  const {
    antCls,
    componentCls,
    paddingSM,
    paddingXS,
    paddingXXS,
    lineWidth,
    calc,
  } = token;

  return {
    [componentCls]: {
      [`&${componentCls}-main`]: {
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        boxShadow: `${token.boxShadowTertiary}`,
        borderRadius: {
          _skip_check_: true,
          value: calc(token.borderRadius).mul(2).equal() as any,
        },
        borderColor: token.colorBorderInput,
        borderWidth: lineWidth,
        borderStyle: "solid",
      },
      [`&${componentCls}-disabled`]: {
        background: token.colorBgContainerDisabled,
        borderColor: "transparent",
      },
      [`&${componentCls}-rtl`]: {
        direction: "rtl",
      },
      [`${componentCls}-content`]: {
        display: "flex",
        gap: paddingXS,
        width: "100%",
        paddingBlock: paddingSM,
        paddingInlineStart: paddingSM,
        paddingInlineEnd: paddingSM,
        boxSizing: "border-box",
        alignItems: "flex-end",
      },
      [`${componentCls}-prefix`]: {
        flex: "none",
      },
      [`${componentCls}-input`]: {
        paddingInline: 0,
        borderRadius: 0,
        flex: "auto",
        alignSelf: "center",
        caretColor: token.colorPrimary,
        fontSize: token.fontSize,
      },
      [`${componentCls}-actions-list`]: {
        flex: "none",
        display: "flex",
        "&-presets": {
          gap: token.paddingXS,
        },
      },
      [`${componentCls}-actions-btn`]: {
        [`&-disabled:where(${antCls}-btn-variant-text)`]: {
          color: token.colorTextActionsDisabled,
          borderColor: "transparent",
        },
        [`&-disabled:not(${antCls}-btn-variant-text)`]: {
          background: token.colorBgActionsDisabled,
          color: token.colorTextLightSolid,
          borderColor: "transparent",
        },
        "&-loading-button": {
          padding: 0,
          border: 0,
        },
        "&-loading-icon": {
          height: token.controlHeight,
          width: token.controlHeight,
          verticalAlign: "top",
        },
        "&-recording-icon": {
          height: "1.2em",
          width: "1.2em",
          verticalAlign: "top",
        },
      },
      [`${componentCls}-footer`]: {
        paddingInlineStart: paddingSM,
        paddingInlineEnd: paddingSM,
        paddingBlockEnd: paddingSM,
        paddingBlockStart: paddingXXS,
        boxSizing: "border-box",
      },
    },
  };
};

export const prepareComponentToken: GetDefaultToken<"Sender"> = (token) => {
  const { colorPrimary, colorFillTertiary } = token;

  const colorBorderInput = new FastColor(colorFillTertiary)
    .setA(0.1)
    .toRgbString();
  const switchCheckedBg = new FastColor(colorPrimary)
    .setA(0.08)
    .toRgbString();
  const switchCheckedHoverBg = new FastColor(colorPrimary)
    .setA(0.1)
    .toRgbString();
  const switchUncheckedHoverBg = new FastColor(colorFillTertiary)
    .setA(0.04)
    .toRgbString();
  const colorBgActionsDisabled = new FastColor(colorPrimary)
    .setA(0.45)
    .toRgbString();
  const colorTextActionsDisabled = colorBgActionsDisabled;

  return {
    colorBorderInput,
    switchCheckedBg,
    switchCheckedHoverBg,
    switchUncheckedHoverBg,
    colorBgActionsDisabled,
    colorTextActionsDisabled,
  };
};

export default genStyleHooks<"Sender">(
  "Sender",
  (token) => {
    const { paddingXS, calc } = token;
    const senderToken = mergeToken<SenderToken>(token, {
      SenderContentMaxWidth: `calc(100% - ${calc(paddingXS).add(32).equal()}px)`,
    });
    return [
      genSenderStyle(senderToken),
      genSenderHeaderStyle(senderToken),
      genSenderSwitchStyle(senderToken),
    ];
  },
  prepareComponentToken,
);
