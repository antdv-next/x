import type { CSSObject } from "@antdv-next/cssinjs";

import { unit } from "@antdv-next/cssinjs";

import type { FullToken, GenerateStyle } from "../../theme/interface";

export interface ThoughtChainToken extends FullToken<"ThoughtChain"> {}

const genThoughtChainStyle: GenerateStyle<ThoughtChainToken, CSSObject> = (
  token,
): CSSObject => {
  const { componentCls, calc } = token;
  return {
    [componentCls]: {
      [`&${componentCls}-box`]: {
        display: "flex",
        flexDirection: "column",
        [`& ${componentCls}-node:last-of-type`]: {
          [`> ${componentCls}-node-icon`]: {
            "&:after": {
              display: "none",
            },
          },
        },
      },
      [`${componentCls}-node`]: {
        position: "relative",
        display: "flex",
        alignItems: "baseline",
        gap: token.marginSM,
        [`${componentCls}-status-error`]: {
          color: token.colorError,
        },
        [`${componentCls}-status-success`]: {
          color: token.colorSuccess,
        },
        [`${componentCls}-status-loading`]: {
          color: token.colorPrimary,
        },
      },
      [`${componentCls}-node-header`]: {
        display: "flex",
        flexDirection: "column",
      },
      [`${componentCls}-node-title`]: {
        fontWeight: 500,
        display: "flex",
        gap: token.marginXS,
      },
      [`${componentCls}-node-collapsible`]: {
        paddingInlineEnd: token.padding,
        cursor: "pointer",
      },
      [`${componentCls}-node-footer`]: {
        marginBottom: token.margin,
      },
      [`${componentCls}-node-content-box`]: {
        marginBottom: token.margin,
      },
      [`${componentCls}-node-collapse-icon`]: {
        "& svg": {
          transition: `transform ${token.motionDurationMid} ${token.motionEaseInOut}`,
        },
      },
      [`${componentCls}-node-description`]: {
        color: token.colorTextDescription,
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        marginBlockEnd: token.margin,
      },
      [`${componentCls}-node-icon`]: {
        lineHeight: 1,
        fontSize: token.iconSize,
        "&:after": {
          content: '""',
          position: "absolute",
          height: unit(
            calc("100%")
              .sub(calc(token.iconSize).mul(token.lineHeight))
              .equal(),
          ),
          borderInlineStart: `${unit(token.lineWidth)} solid ${token.colorFillContent}`,
          insetInlineStart: unit(calc(token.iconSize).sub(1).div(2).equal()),
          top: unit(calc(token.iconSize).mul(token.lineHeight).equal()),
        },
      },
      [`${componentCls}-node-icon-dashed`]: {
        "&:after": {
          borderInlineStart: `${unit(token.lineWidth)} dashed ${token.colorFillContent}`,
        },
      },
      [`${componentCls}-node-icon-dotted`]: {
        "&:after": {
          borderInlineStart: `${unit(token.lineWidth)} dotted ${token.colorFillContent}`,
        },
      },
      [`${componentCls}-node-index-icon`]: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        color: token.colorTextSecondary,
        fontSize: token.fontSizeSM,
        width: token.iconSize,
        height: token.iconSize,
        backgroundColor: token.colorFillContent,
        borderRadius: unit(calc(token.iconSize).div(2).equal()),
      },
      [`&${componentCls}-rtl`]: {
        direction: "rtl",
        [`${componentCls}-node-icon`]: {
          "&:after": {
            insetInlineStart: "unset",
            insetInlineEnd: unit(calc(token.iconSize).sub(1).div(2).equal()),
          },
        },
      },
    },
  };
};

export default genThoughtChainStyle;
