import type { CSSObject } from "@antdv-next/cssinjs";
import type { FullToken, GenerateStyle } from "antdv-next/theme/internal";

import { unit } from "@antdv-next/cssinjs";

import { genStyleHooks } from "../../theme/genStyleUtils";
import {
  FOLLOW_MOTION_EASE,
  MIN_RAIL_ITEM_HEIGHT,
  prepareComponentToken,
  resolveRailScaleVar,
} from "./token";

export type { ComponentToken } from "./token";

interface MessageScrollerToken extends FullToken<"MessageScroller"> {
  railWidth: number;
  railInset: number;
  railItemHeight: number;
  railTickWidth: number;
  railTickHeight: number;
  railTickColor: string;
  railTickHighlightColor: string;
  railTickActiveColor: string;
  previewWidth: number;
  previewBg: string;
  previewBorderColor: string;
  previewShadow: string;
  previewTitleColor: string;
  previewDescriptionColor: string;
  backToBottomBg: string;
  backToBottomColor: string;
  backToBottomBorderColor: string;
  backToBottomShadow: string;
  motionDuration: string;
  motionEase: string;
}

const genMessageScrollerStyle: GenerateStyle<
  MessageScrollerToken,
  CSSObject
> = token => {
  const { componentCls, railWidth, railInset } = token;
  const viewportCls = `${componentCls}-viewport`;
  const railCls = `${componentCls}-rail`;
  const railTickCls = `${railCls}-tick`;
  const railScaleVar = resolveRailScaleVar(componentCls.replace(/^\./, ""));
  const previewMotionCls = `${componentCls}-preview-motion`;
  const backToBottomCls = `${componentCls}-back-to-bottom`;
  const backToBottomMotionCls = `${componentCls}-back-to-bottom-motion`;
  const motion = `${token.motionDuration} ${token.motionEase}`;
  /**
   * 颜色变量模式（cssVar）下 token 已经是 `var(--ant-*)`，长度必须交给 `unit` 处理，
   * 否则会拼出 `var(--x)px` 这类无效值。
   */
  const lineWidth = unit(token.lineWidth);
  const focusOutline: CSSObject = {
    outline: `${lineWidth} solid ${token.colorPrimaryBorder}`,
    outlineOffset: `calc(${lineWidth} * -1)`,
  };
  const clampLines = (lines: number): CSSObject => ({
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  });

  return {
    [componentCls]: {
      position: "relative",
      display: "block",
      minHeight: 0,
      color: token.colorText,

      "&-rtl": {
        direction: "rtl",

        [`${railTickCls}`]: {
          transformOrigin: "left center",
        },
      },

      /**
       * 原生视口：保留浏览器自身的滚动性能，关闭滚动锚定，视口高度变化一律由跟随逻辑决定。
       */
      [viewportCls]: {
        position: "relative",
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
        overscrollBehavior: "contain",
        overflowAnchor: "none",
        scrollbarGutter: "stable",
        outline: "none",

        "&:focus-visible": focusOutline,
      },

      /**
       * `flow-root` 让内容层形成独立的块级格式化上下文，末位消息的外边距不会塌陷出滚动高度。
       */
      [`${componentCls}-content`]: {
        display: "flow-root",
      },

      /**
       * 导轨开启时，视口内部收起原生滚动条并留出右侧安全间距，避免与刻度挤占同一空间。
       *
       * 这两个状态类与根元素同体，必须用 `&` 组成复合选择器，不能退化成后代选择器。
       */
      [`&${componentCls}-rail-enabled`]: {
        [viewportCls]: {
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollbarGutter: "auto",

          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      },

      [`&${componentCls}-rail-visible`]: {
        [viewportCls]: {
          paddingInlineEnd: `calc(${unit(railWidth)} + ${unit(token.paddingSM)})`,
        },
      },

      [railCls]: {
        position: "absolute",
        insetBlock: railInset,
        insetInlineEnd: token.paddingXS,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-end",
        width: railWidth,
      },

      [`${railCls}-item`]: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        width: "100%",
        minHeight: MIN_RAIL_ITEM_HEIGHT,
        padding: 0,
        border: 0,
        background: "transparent",
        color: token.railTickColor,
        cursor: "pointer",
        transition: `color ${motion}`,

        "&:hover": {
          color: token.railTickHighlightColor,
        },

        "&[data-highlighted]": {
          color: token.railTickHighlightColor,
        },

        "&[data-active]": {
          color: token.railTickActiveColor,
        },

        "&:focus-visible": {
          ...focusOutline,
          borderRadius: token.borderRadiusSM,
        },
      },

      [railTickCls]: {
        display: "block",
        width: token.railTickWidth,
        height: token.railTickHeight,
        borderRadius: `calc(${unit(token.railTickHeight)} / 2)`,
        background: "currentColor",
        transformOrigin: "right center",
        transform: `scaleX(var(${railScaleVar}, 1))`,
        transition: `transform ${motion}`,
      },

      /**
       * 单例预览卡片：整层随导轨居中，卡片由 `translateY` 在激活项之间连续滑动。
       */
      [`${componentCls}-preview-layer`]: {
        position: "absolute",
        insetBlock: railInset,
        insetInlineEnd: `calc(${unit(railWidth)} + ${unit(token.paddingXS)})`,
        zIndex: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        width: token.previewWidth,
        pointerEvents: "none",
      },

      /**
       * 轨道用单格网格承载卡片：交叉淡入淡出期间新旧卡片重叠，轨道高度不会叠加跳动。
       */
      [`${componentCls}-preview-track`]: {
        display: "grid",
        width: "100%",
        transition: `transform ${motion}`,
        willChange: "transform",
      },

      [`${componentCls}-preview`]: {
        width: "100%",
        padding: `${unit(token.paddingXS)} ${unit(token.paddingSM)}`,
        border: `${lineWidth} solid ${token.previewBorderColor}`,
        borderRadius: token.borderRadiusLG,
        background: token.previewBg,
        boxShadow: token.previewShadow,
      },

      [`${componentCls}-preview-title`]: {
        ...clampLines(1),
        color: token.previewTitleColor,
        fontSize: token.fontSize,
        fontWeight: token.fontWeightStrong,
        lineHeight: token.lineHeight,
      },

      [`${componentCls}-preview-description`]: {
        ...clampLines(2),
        textAlign: "start",
        marginBlockStart: token.marginXXS,
        color: token.previewDescriptionColor,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
      },

      [`${previewMotionCls}-enter-from`]: {
        opacity: 0,
        transform: "translateY(4px)",
        filter: "blur(6px)",
      },

      [`${previewMotionCls}-enter-to, ${previewMotionCls}-leave-from`]: {
        opacity: 1,
        transform: "translateY(0)",
        filter: "blur(0px)",
      },

      [`${previewMotionCls}-leave-to`]: {
        opacity: 0,
        transform: "translateY(-2px)",
        filter: "blur(4px)",
      },

      [`${previewMotionCls}-enter-active`]: {
        transition: `opacity 180ms ${FOLLOW_MOTION_EASE}, transform 180ms ${FOLLOW_MOTION_EASE}, filter 180ms ${FOLLOW_MOTION_EASE}`,
      },

      [`${previewMotionCls}-leave-active`]: {
        transition: `opacity 120ms ${FOLLOW_MOTION_EASE}, transform 120ms ${FOLLOW_MOTION_EASE}, filter 120ms ${FOLLOW_MOTION_EASE}`,
      },

      /**
       * 定位层只负责悬挂位置，胶囊外观落在内部按钮上：`backToBottom` 插槽可以换成宿主自己的按钮。
       */
      [backToBottomCls]: {
        position: "absolute",
        insetBlockEnd: token.paddingSM,
        insetInlineStart: "50%",
        zIndex: 4,
        display: "inline-flex",
        transform: "translateX(-50%)",
      },

      [`${backToBottomCls}-button`]: {
        display: "inline-flex",
        alignItems: "center",
        gap: token.marginXS,
        height: token.controlHeightSM,
        paddingInline: token.paddingSM,
        border: `${lineWidth} solid ${token.backToBottomBorderColor}`,
        borderRadius: `calc(${unit(token.controlHeightSM)} / 2)`,
        background: token.backToBottomBg,
        color: token.backToBottomColor,
        boxShadow: token.backToBottomShadow,
        fontSize: token.fontSizeSM,
        lineHeight: 1,
        cursor: "pointer",
        transition: `color ${motion}, border-color ${motion}, box-shadow ${motion}`,

        "&:hover": {
          color: token.colorText,
          borderColor: token.colorPrimaryBorder,
        },

        "&:focus-visible": {
          ...focusOutline,
        },
      },

      [`${backToBottomCls}-icon`]: {
        display: "inline-flex",
        fontSize: token.fontSize,
      },

      [`${backToBottomMotionCls}-enter-from, ${backToBottomMotionCls}-leave-to`]:
        {
          opacity: 0,
          transform: "translateX(-50%) translateY(4px)",
        },

      [`${backToBottomMotionCls}-enter-to, ${backToBottomMotionCls}-leave-from`]:
        {
          opacity: 1,
          transform: "translateX(-50%)",
        },

      [`${backToBottomMotionCls}-enter-active, ${backToBottomMotionCls}-leave-active`]:
        {
          transition: `opacity ${motion}, transform ${motion}`,
        },

      "@media (prefers-reduced-motion: reduce)": {
        [`${railCls}-item, ${railTickCls}, ${componentCls}-preview-track, ${backToBottomCls}-button`]:
          {
            transition: "none",
          },

        [`${previewMotionCls}-enter-active, ${previewMotionCls}-leave-active, ${backToBottomMotionCls}-enter-active, ${backToBottomMotionCls}-leave-active`]:
          {
            transition: "none",
          },
      },
    },
  };
};

export default genStyleHooks(
  "MessageScroller",
  genMessageScrollerStyle,
  prepareComponentToken,
);
