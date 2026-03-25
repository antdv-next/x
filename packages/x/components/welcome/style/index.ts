import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from "../../theme/interface";

import { genStyleHooks } from "../../theme/genStyleUtils";

// biome-ignore lint/suspicious/noEmptyInterface: ComponentToken need to be empty by default
export interface ComponentToken {}

export interface WelcomeToken extends FullToken<"Welcome"> {}

const genWelcomeStyle: GenerateStyle<WelcomeToken> = token => {
  const { componentCls, calc } = token;

  const titleHeight = calc(token.fontSizeHeading3)
    .mul(token.lineHeightHeading3)
    .equal();
  const descHeight = calc(token.fontSize).mul(token.lineHeight).equal();

  return {
    [componentCls]: {
      display: "flex",
      alignItems: "flex-start",
      gap: token.padding,

      [`${componentCls}-icon`]: {
        height: calc(titleHeight).add(descHeight).add(token.paddingXXS).equal(),
        display: "flex",
        flex: "none",

        img: {
          height: "100%",
          display: "block",
        },
      },

      [`${componentCls}-content-wrapper`]: {
        display: "flex",
        flexDirection: "column",
        gap: token.paddingXS,
        flex: "auto",
        minWidth: 0,
      },

      [`${componentCls}-title-wrapper`]: {
        display: "flex",
        alignItems: "flex-start",
        gap: token.paddingXS,
      },

      [`${componentCls}-title`]: {
        margin: 0,
      },

      [`${componentCls}-extra`]: {
        marginInlineStart: "auto",
      },

      [`${componentCls}-description`]: {
        display: "block",
      },

      [`&${componentCls}-rtl`]: {
        direction: "rtl",
      },
    },
  };
};

const genVariantStyle: GenerateStyle<WelcomeToken> = token => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      "&-filled": {
        paddingInline: token.padding,
        paddingBlock: token.paddingSM,
        background: token.colorFillContent,
        borderRadius: token.borderRadiusLG,
      },

      "&-borderless": {
        [`${componentCls}-title`]: {
          fontSize: token.fontSizeHeading3,
          lineHeight: token.lineHeightHeading3,
        },
      },
    },
  };
};

export const prepareComponentToken: GetDefaultToken<"Welcome"> = () => ({});

export default genStyleHooks(
  "Welcome",
  token => {
    const compToken = mergeToken<WelcomeToken>(token, {});
    return [genWelcomeStyle(compToken), genVariantStyle(compToken)];
  },
  prepareComponentToken,
);
