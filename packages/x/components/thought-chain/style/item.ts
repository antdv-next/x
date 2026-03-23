import type { FullToken, GenerateStyle } from "../../theme/interface";

export interface ThoughtChainItemToken extends FullToken<"ThoughtChain"> {}

const genItemStyle: GenerateStyle<ThoughtChainItemToken> = token => {
  const {
    componentCls,
    paddingXS,
    paddingSM,
    fontSize,
    fontSizeSM,
    lineHeight,
    colorFillTertiary,
    colorFillSecondary,
    colorTextSecondary,
    colorTextDescription,
    colorBorder,
    borderRadiusSM,
    colorError,
  } = token;

  const itemCls = `${componentCls}-item`;

  return {
    // Item chip/badge
    [itemCls]: {
      display: "inline-flex",
      alignItems: "center",
      columnGap: paddingXS / 2,
      padding: `${paddingXS / 2}px ${paddingSM}px`,
      borderRadius: borderRadiusSM,
      fontSize,
      lineHeight,
      cursor: "default",
      transition: `background-color ${token.motionDurationMid}`,

      // Variants
      [`&${itemCls}-solid`]: {
        backgroundColor: colorFillTertiary,
      },

      [`&${itemCls}-outlined`]: {
        backgroundColor: "transparent",
        border: `1px solid ${colorBorder}`,
      },

      [`&${itemCls}-text`]: {
        backgroundColor: "transparent",
      },

      // Clickable
      [`&${itemCls}-click`]: {
        cursor: "pointer",

        "&:hover": {
          backgroundColor: colorFillSecondary,
        },
      },

      // Error
      [`&${itemCls}-error`]: {
        [`${itemCls}-title`]: {
          color: colorError,
        },
        [`${itemCls}-description`]: {
          color: colorError,
          opacity: 0.65,
        },
      },

      // Disabled
      [`&${itemCls}-disabled`]: {
        opacity: 0.45,
        cursor: "not-allowed",

        "&:hover": {
          backgroundColor: colorFillTertiary,
        },
      },

      // Icon
      [`${itemCls}-icon`]: {
        display: "inline-flex",
        alignItems: "center",
        fontSize,
      },

      // Content
      [`${itemCls}-content`]: {
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      },

      [`${itemCls}-title`]: {
        fontSize,
        color: colorTextSecondary,
        fontWeight: 500,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },

      [`${itemCls}-title-with-description`]: {
        fontSize: fontSizeSM,
        lineHeight: 1.4,
      },

      [`${itemCls}-description`]: {
        fontSize: fontSizeSM,
        color: colorTextDescription,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },

      // RTL
      [`&${itemCls}-rtl`]: {
        direction: "rtl",
      },
    },
  };
};

export default genItemStyle;
