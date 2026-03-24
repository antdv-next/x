import { unit } from "@antdv-next/cssinjs";

import type { FullToken, GenerateStyle } from "../../theme/interface";

export interface ThoughtChainItemToken extends FullToken<"ThoughtChain"> {}

const genItemStyle: GenerateStyle<ThoughtChainItemToken> = token => {
  const { componentCls, calc } = token;
  const itemCls = `${componentCls}-item`;

  return {
    [itemCls]: {
      display: "inline-flex",
      gap: unit(calc(token.marginXXS).add(1).equal()),
      whiteSpace: "normal",
      wordBreak: "break-word",
      fontSize: token.fontSize,
      color: token.colorText,
      paddingBlock: unit(calc(token.paddingXXS).add(1).equal()),
      paddingInline: token.paddingSM,
      boxSizing: "border-box",
      lineHeight: token.lineHeight,
      borderRadius: token.borderRadius,
      alignItems: "baseline",

      [`&${itemCls}-rtl`]: {
        direction: "rtl",
      },

      [`&${itemCls}-click:not(${itemCls}-disabled)`]: {
        cursor: "pointer",
        transition: `all ${token.motionDurationMid} ${token.motionEaseInOut}`,
      },

      [`&${itemCls}-disabled`]: {
        cursor: "not-allowed",
      },

      // Blink effect on description
      [`${componentCls}-motion-blink`]: {
        [`${itemCls}-description`]: {
          color: (token as any).itemMotionDescription,
        },
      },

      // Status colors inside Item
      [`${componentCls}-status-success`]: {
        color: token.colorSuccess,
      },

      [`${componentCls}-status-loading`]: {
        color: token.colorPrimary,
      },

      // Title
      [`${itemCls}-title`]: {
        display: "inline-block",
        whiteSpace: "nowrap",
      },

      [`${itemCls}-title-with-description`]: {
        marginInlineEnd: token.marginXS,
      },

      // Description
      [`${itemCls}-description`]: {
        color: token.colorTextDescription,
        display: "inline-block",
        whiteSpace: "break-spaces",
      },

      // Disabled (non-error)
      [`&${itemCls}-disabled:not(${itemCls}-error)`]: {
        color: (token as any).colorTitleDisabled,
        [`${itemCls}-description`]: {
          color: (token as any).colorDescriptionDisabled,
        },
        [`${componentCls}-status-success`]: {
          color: (token as any).colorSuccessDisabled,
        },
        [`${componentCls}-status-loading`]: {
          color: (token as any).colorPrimaryDisabled,
        },
      },

      // Solid variant
      [`&${itemCls}-solid`]: {
        background: (token as any).itemSolidBg ?? token.colorFillTertiary,
        [`&${itemCls}-disabled`]: {
          background: token.colorBgContainerDisabled,
        },
        [`&${itemCls}-click:not(${itemCls}-error):hover`]: {
          background: (token as any).itemSolidHoverBg,
        },
        [`&${itemCls}-error:not(${itemCls}-disabled)`]: {
          background: token.colorErrorBg,
        },
        [`&${itemCls}-error:where(${itemCls}-disabled)`]: {
          background: (token as any).colorErrorBgDisabled,
        },
      },

      // Outlined variant
      [`&${itemCls}-outlined`]: {
        paddingBlock: token.paddingXXS,
        backgroundColor:
          (token as any).itemOutlinedBg ?? token.colorBgContainer,
        borderWidth: token.lineWidth,
        borderStyle: token.lineType,
        borderColor: token.colorBorder,
        [`&${itemCls}-error:not(${itemCls}-disabled)`]: {
          borderColor: token.colorErrorBorder,
          background: token.colorErrorBg,
        },
        [`&${itemCls}-error:where(${itemCls}-disabled)`]: {
          borderColor: token.colorErrorBorder,
          background: (token as any).colorErrorBgDisabled,
        },
        [`&${itemCls}-click:not(${itemCls}-error):hover`]: {
          background: (token as any).itemOutlinedHoverBg,
        },
      },

      // Text variant
      [`&${itemCls}-text`]: {
        [`&${itemCls}-click:not(${itemCls}-error):hover`]: {
          background: (token as any).itemSolidHoverBg,
        },
      },

      // Error state
      [`&${itemCls}-error`]: {
        [`&:not(${itemCls}-disabled)`]: {
          color: token.colorErrorText,
          [`${itemCls}-description`]: {
            color: (token as any).colorErrorTextDescription,
          },
        },
        [`&:where(${itemCls}-disabled)`]: {
          color: (token as any).colorErrorTextDisabled,
          [`${itemCls}-description`]: {
            color: (token as any).colorErrorTextDescriptionDisabled,
          },
        },
        [`&${itemCls}-click:hover`]: {
          background: token.colorErrorBgFilledHover,
        },
      },
    },
  };
};

export default genItemStyle;
