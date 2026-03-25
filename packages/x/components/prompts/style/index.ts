import { unit } from "@antdv-next/cssinjs";
import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from "../../theme/interface";

import { initFadeLeftMotion, initFadeMotion } from "../../style";
import { genStyleHooks } from "../../theme/genStyleUtils";

// biome-ignore lint/suspicious/noEmptyInterface: ComponentToken need to be empty by default
export interface ComponentToken {}

export interface PromptsToken extends FullToken<"Prompts"> {}

const genPromptsStyle: GenerateStyle<PromptsToken> = token => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      "&, & *": {
        boxSizing: "border-box",
      },

      maxWidth: "100%",

      [`&${componentCls}-rtl`]: {
        direction: "rtl",
      },

      [`${componentCls}-title`]: {
        margin: 0,
        fontWeight: "normal",
        color: token.colorTextTertiary,
      },

      [`${componentCls}-list`]: {
        display: "flex",
        gap: token.paddingSM,
        overflowX: "auto",
        scrollbarWidth: "none",
        "-ms-overflow-style": "none",
        listStyle: "none",
        paddingInlineStart: 0,
        marginBlock: 0,
        alignItems: "stretch",

        "&::-webkit-scrollbar": {
          display: "none",
        },

        "&-wrap": {
          flexWrap: "wrap",
        },

        "&-vertical": {
          flexDirection: "column",
          alignItems: "flex-start",
        },
      },

      [`${componentCls}-item`]: {
        flex: "none",
        display: "flex",
        gap: token.paddingXS,
        height: "auto",
        paddingBlock: token.paddingSM,
        paddingInline: token.padding,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        transition: ["border", "background"]
          .map(prop => `${prop} ${token.motionDurationSlow}`)
          .join(","),
        border: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderSecondary}`,

        [`&:not(${componentCls}-item-has-nest)`]: {
          "&:hover": {
            cursor: "pointer",
            background: token.colorFillTertiary,
          },

          "&:active": {
            background: token.colorFill,
          },
        },

        [`${componentCls}-content`]: {
          flex: "auto",
          minWidth: 0,
          display: "flex",
          gap: token.paddingXXS,
          flexDirection: "column",
          alignItems: "flex-start",
        },

        [`${componentCls}-icon, ${componentCls}-label, ${componentCls}-desc`]: {
          margin: 0,
          padding: 0,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          textAlign: "start",
          whiteSpace: "normal",
        },

        [`${componentCls}-label`]: {
          color: token.colorTextHeading,
          fontWeight: 500,
        },

        [`${componentCls}-label + ${componentCls}-desc`]: {
          color: token.colorTextTertiary,
        },

        [`&${componentCls}-item-disabled`]: {
          pointerEvents: "none",
          background: token.colorBgContainerDisabled,

          [`${componentCls}-label, ${componentCls}-desc`]: {
            color: token.colorTextTertiary,
          },
        },
      },
    },
  };
};

const genNestStyle: GenerateStyle<PromptsToken> = token => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      [`${componentCls}-item-has-nest`]: {
        [`> ${componentCls}-content`]: {
          [`> ${componentCls}-label`]: {
            fontSize: token.fontSizeLG,
            lineHeight: token.lineHeightLG,
          },
        },
      },

      [`${componentCls}-nested`]: {
        marginTop: token.paddingXS,
        alignSelf: "stretch",

        [`${componentCls}-list`]: {
          alignItems: "stretch",
        },

        [`${componentCls}-item`]: {
          border: 0,
          background: token.colorFillQuaternary,
        },
      },
    },
  };
};

export const prepareComponentToken: GetDefaultToken<"Prompts"> = () => ({});

export default genStyleHooks(
  "Prompts",
  token => {
    const compToken = mergeToken<PromptsToken>(token, {});
    return [
      genPromptsStyle(compToken),
      genNestStyle(compToken),
      initFadeLeftMotion(compToken, true),
      initFadeMotion(compToken, true),
    ];
  },
  prepareComponentToken,
);
