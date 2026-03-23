import { unit } from "@antdv-next/cssinjs";

import type { FullToken, GenerateStyle } from "../../theme/interface";

export interface ThoughtChainToken extends FullToken<"ThoughtChain"> {}

const genThoughtChainStyle: GenerateStyle<ThoughtChainToken> = token => {
  const {
    componentCls,
    paddingXS,
    marginXS,
    fontSize,
    fontSizeSM,
    fontSizeHeading5,
    lineHeight,
    colorTextSecondary,
    colorTextDescription,
    colorBorder,
    colorPrimary,
    colorSuccess,
    colorError,
    colorTextQuaternary,
    colorFillTertiary,
    motionDurationMid,
    motionEaseInOut,
  } = token;

  const nodeCls = `${componentCls}-node`;

  return {
    [componentCls]: {
      display: "flex",
      flexDirection: "column",

      // Collapse transition
      [`${componentCls}-collapse-enter-active, ${componentCls}-collapse-leave-active`]:
        {
          transition: `height ${motionDurationMid} ${motionEaseInOut}, opacity ${motionDurationMid} ${motionEaseInOut}`,
          overflow: "hidden",
        },

      // Node
      [nodeCls]: {
        display: "flex",
        position: "relative",

        // Icon column
        [`${nodeCls}-icon`]: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: unit(fontSizeHeading5 + paddingXS * 2),
          height: unit(fontSizeHeading5 + paddingXS * 2),
          fontSize: fontSizeHeading5,
          position: "relative",

          // Connector line via ::after
          "&::after": {
            content: '""',
            position: "absolute",
            top: "100%",
            insetInlineStart: "50%",
            transform: "translateX(-50%)",
            width: 2,
            bottom: unit(
              token
                .calc(fontSizeHeading5 + paddingXS * 2)
                .mul(-1)
                .equal(),
            ),
            backgroundColor: colorBorder,
          },

          [`&${nodeCls}-icon-dashed::after`]: {
            backgroundColor: "transparent",
            borderInlineStart: `2px dashed ${colorBorder}`,
          },

          [`&${nodeCls}-icon-dotted::after`]: {
            backgroundColor: "transparent",
            borderInlineStart: `2px dotted ${colorBorder}`,
          },

          [`&${nodeCls}-icon-none::after`]: {
            display: "none",
          },
        },

        // Default index icon (numbered circle)
        [`${nodeCls}-index-icon`]: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: unit(fontSizeHeading5 + paddingXS),
          height: unit(fontSizeHeading5 + paddingXS),
          borderRadius: "50%",
          backgroundColor: colorFillTertiary,
          color: colorTextSecondary,
          fontSize: fontSizeSM,
          fontWeight: 500,
        },

        // Box (header + content + footer)
        [`${nodeCls}-box`]: {
          flex: 1,
          minWidth: 0,
          paddingInlineStart: paddingXS,
          paddingTop: paddingXS,
        },

        // Header
        [`${nodeCls}-header`]: {
          display: "flex",
          flexDirection: "column",
        },

        [`${nodeCls}-title`]: {
          display: "flex",
          alignItems: "center",
          gap: marginXS,
          fontSize,
          lineHeight,
          fontWeight: 500,
        },

        [`${nodeCls}-collapsible`]: {
          paddingInlineEnd: token.padding,
          cursor: "pointer",
          userSelect: "none",
        },

        [`${nodeCls}-collapse-icon`]: {
          display: "inline-flex",
          marginInlineStart: paddingXS / 2,
          fontSize: fontSizeSM,
          transition: `transform ${motionDurationMid} ${motionEaseInOut}`,
        },

        [`${nodeCls}-description`]: {
          fontSize,
          lineHeight,
          color: colorTextDescription,
          marginBlockEnd: token.margin,
        },

        // Content
        [`${nodeCls}-content`]: {
          marginTop: marginXS,
        },

        [`${nodeCls}-content-box`]: {
          fontSize,
          color: colorTextDescription,
        },

        // Footer
        [`${nodeCls}-footer`]: {
          marginTop: marginXS,
        },

        // Last node: hide connector line
        "&:last-child": {
          [`${nodeCls}-icon::after`]: {
            display: "none",
          },
        },
      },

      // Status colors
      [`${componentCls}-status`]: {
        display: "inline-flex",
        alignItems: "center",
        fontSize: fontSizeHeading5,
      },

      [`${componentCls}-status-loading`]: {
        color: colorPrimary,
      },

      [`${componentCls}-status-success`]: {
        color: colorSuccess,
      },

      [`${componentCls}-status-error`]: {
        color: colorError,
      },

      [`${componentCls}-status-abort`]: {
        color: colorTextQuaternary,
      },

      // RTL
      [`&${componentCls}-rtl`]: {
        direction: "rtl",
      },
    },
  };
};

export default genThoughtChainStyle;
