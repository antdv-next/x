import { unit } from "@antdv-next/cssinjs";

import type { FullToken, GenerateStyle } from "../../theme/interface";

export interface ThinkToken extends FullToken<"Think"> {}

const genThinkStyle: GenerateStyle<ThinkToken> = token => {
  const {
    componentCls,
    paddingXS,
    paddingSM,
    marginSM,
    fontSize,
    fontSizeHeading5,
    fontSizeSM,
    lineHeight,
    colorTextSecondary,
    colorTextDescription,
    colorBorder,
    lineWidth,
    motionDurationMid,
    motionEaseInOut,
  } = token;

  return {
    [componentCls]: {
      // Collapse transition
      [`${componentCls}-collapse-enter-active, ${componentCls}-collapse-leave-active`]:
        {
          transition: `height ${motionDurationMid} ${motionEaseInOut}, opacity ${motionDurationMid} ${motionEaseInOut}`,
          overflow: "hidden",
        },

      // Status header
      [`${componentCls}-status-wrapper`]: {
        width: "fit-content",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        columnGap: unit(paddingXS),
        fontSize,
        lineHeight,
        color: colorTextSecondary,
        cursor: "pointer",
        userSelect: "none",
      },

      [`${componentCls}-status-icon`]: {
        display: "flex",
        alignItems: "center",
        fontSize: fontSizeHeading5,
      },

      [`${componentCls}-status-text`]: {
        flex: 1,
        fontSize,
        lineHeight,
      },

      [`${componentCls}-status-down-icon`]: {
        display: "inline-flex",
        alignItems: "center",
        fontSize: fontSizeSM,
        transition: `transform ${motionDurationMid} ${motionEaseInOut}`,
      },

      // Content area
      [`${componentCls}-content`]: {
        width: "100%",
        marginTop: marginSM,
        paddingInlineStart: paddingSM,
        borderInlineStart: `${unit(
          token.calc(lineWidth).mul(2).equal(),
        )} solid ${colorBorder}`,
        color: colorTextDescription,
      },

      // RTL
      [`&${componentCls}-rtl`]: {
        direction: "rtl",
      },
    },
  };
};

export default genThinkStyle;
