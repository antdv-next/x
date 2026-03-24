import { unit } from "@antdv-next/cssinjs";

import type { FullToken, GenerateStyle } from "../../theme/interface";

export interface ThoughtChainToken extends FullToken<"ThoughtChain"> {}

const genThoughtChainStyle: GenerateStyle<ThoughtChainToken> = token => {
  const { componentCls, calc } = token;
  const iconSize = (token as any).iconSize ?? token.fontSize;

  return {
    [componentCls]: {
      // Root box
      [`&${componentCls}-box`]: {
        display: "flex",
        flexDirection: "column",

        // Last node: hide connector line
        [`& ${componentCls}-node:last-of-type`]: {
          [`> ${componentCls}-node-icon`]: {
            "&:after": {
              display: "none",
            },
          },
        },
      },

      // Node
      [`${componentCls}-node`]: {
        position: "relative",
        display: "flex",
        alignItems: "baseline",
        gap: token.marginSM,

        // Status colors inside node
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

      // Header (column layout: title above description)
      [`${componentCls}-node-header`]: {
        display: "flex",
        flexDirection: "column",
      },

      // Title
      [`${componentCls}-node-title`]: {
        fontWeight: 500,
        display: "flex",
        gap: token.marginXS,
      },

      // Collapsible title
      [`${componentCls}-node-collapsible`]: {
        paddingInlineEnd: token.padding,
        cursor: "pointer",
      },

      // Footer
      [`${componentCls}-node-footer`]: {
        marginBottom: token.margin,
      },

      // Content box
      [`${componentCls}-node-content-box`]: {
        marginBottom: token.margin,
      },

      // Collapse icon
      [`${componentCls}-node-collapse-icon`]: {
        "& svg": {
          transition: `transform ${token.motionDurationMid} ${token.motionEaseInOut}`,
        },
      },

      // Description
      [`${componentCls}-node-description`]: {
        color: token.colorTextDescription,
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        marginBlockEnd: token.margin,
      },

      // Icon container with connector line
      [`${componentCls}-node-icon`]: {
        lineHeight: 1,
        fontSize: iconSize,

        "&:after": {
          content: '""',
          position: "absolute",
          height: unit(
            calc("100%").sub(calc(iconSize).mul(token.lineHeight)).equal(),
          ),
          borderInlineStart: `${unit(token.lineWidth)} solid ${token.colorFillContent}`,
          insetInlineStart: unit(calc(iconSize).sub(1).div(2).equal()),
          top: unit(calc(iconSize).mul(token.lineHeight).equal()),
        },
      },

      // Dashed line
      [`${componentCls}-node-icon-dashed`]: {
        "&:after": {
          borderInlineStart: `${unit(token.lineWidth)} dashed ${token.colorFillContent}`,
        },
      },

      // Dotted line
      [`${componentCls}-node-icon-dotted`]: {
        "&:after": {
          borderInlineStart: `${unit(token.lineWidth)} dotted ${token.colorFillContent}`,
        },
      },

      // Default index icon (numbered circle)
      [`${componentCls}-node-index-icon`]: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        color: token.colorTextSecondary,
        fontSize: token.fontSizeSM,
        width: iconSize,
        height: iconSize,
        backgroundColor: token.colorFillContent,
        borderRadius: unit(calc(iconSize).div(2).equal()),
      },

      // Status
      [`${componentCls}-status`]: {
        display: "inline-flex",
        alignItems: "center",
        fontSize: iconSize,
      },

      [`${componentCls}-status-abort`]: {
        color: token.colorTextQuaternary,
      },

      // Collapse transition
      [`${componentCls}-collapse-enter-active, ${componentCls}-collapse-leave-active`]:
        {
          transition: `height ${token.motionDurationMid} ${token.motionEaseInOut}, opacity ${token.motionDurationMid} ${token.motionEaseInOut}`,
          overflow: "hidden",
        },

      // RTL
      [`&${componentCls}-rtl`]: {
        direction: "rtl",
        [`${componentCls}-node-icon`]: {
          "&:after": {
            insetInlineStart: "unset",
            insetInlineEnd: unit(calc(iconSize).sub(1).div(2).equal()),
          },
        },
      },
    },
  };
};

export default genThoughtChainStyle;
