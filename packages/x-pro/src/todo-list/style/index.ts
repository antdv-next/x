import type { CSSObject } from "@antdv-next/cssinjs";
import type { FullToken, GenerateStyle } from "antdv-next/theme/internal";

import { Keyframes, unit } from "@antdv-next/cssinjs";

import { genStyleHooks } from "../../theme/genStyleUtils";
import { prepareComponentToken } from "./token";

export type { ComponentToken } from "./token";

interface TodoListToken extends FullToken<"TodoList"> {
  headerHeight: number;
  iconSize: number;
  itemGap: number;
  colorStatusProgress: string;
  colorStatusCompleted: string;
  colorStatusCancelled: string;
  colorStatusPending: string;
  colorTitleCompleted: string;
  motionDuration: string;
  motionExpandDuration: string;
  motionCollapseDuration: string;
  motionEase: string;
}

/** 进行中外圈的无限旋转。 */
const spin = new Keyframes("antXProTodoSpin", {
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

const genTodoListStyle: GenerateStyle<TodoListToken, CSSObject> = token => {
  const { componentCls, iconSize } = token;
  const headerCls = `${componentCls}-header`;
  const contentCls = `${componentCls}-content`;
  const listCls = `${componentCls}-list`;
  const itemCls = `${componentCls}-item`;
  const statusCls = `${componentCls}-status`;
  const motion = `${token.motionDuration} ${token.motionEase}`;
  /**
   * 展开与收起用不同时长：入场从容、退场干脆。两个方向各自把自己的时长写进对应的
   * `-enter-active` / `-leave-active`，Vue 在进入与离开阶段分别只挂其中一个类。
   */
  const enterMotion = `${token.motionExpandDuration} ${token.motionEase}`;
  const leaveMotion = `${token.motionCollapseDuration} ${token.motionEase}`;
  /**
   * 颜色变量模式（cssVar）下 token 已经是 `var(--ant-*)`，长度必须交给 `unit` 处理，
   * 否则会拼出 `var(--x)px` 这类无效值。
   */
  const lineWidth = unit(token.lineWidth);
  const focusOutline: CSSObject = {
    outline: `${lineWidth} solid ${token.colorPrimaryBorder}`,
    outlineOffset: `calc(${lineWidth} * -1)`,
  };
  /** 视觉隐藏，但仍可被读屏读出。 */
  const visuallyHidden: CSSObject = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  };

  return {
    [componentCls]: {
      display: "block",
      color: token.colorText,
      fontSize: token.fontSize,

      "&-rtl": {
        direction: "rtl",
      },

      [headerCls]: {
        display: "flex",
        alignItems: "center",
        gap: token.marginXS,
        width: "100%",
        minHeight: token.headerHeight,
        padding: 0,
        border: 0,
        background: "transparent",
        color: token.colorText,
        font: "inherit",
        textAlign: "start",
        cursor: "pointer",

        "&:focus-visible": {
          ...focusOutline,
          borderRadius: token.borderRadiusSM,
        },
      },

      [`${headerCls}-icon`]: {
        display: "inline-flex",
        flex: "none",
        fontSize: iconSize,
      },

      [`${headerCls}-title`]: {
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontWeight: token.fontWeightStrong,
      },

      [`${headerCls}-counter`]: {
        flex: "none",
        color: token.colorTextTertiary,
        fontSize: token.fontSizeSM,
        fontVariantNumeric: "tabular-nums",
        /** 数字滚动期间新旧文本交替，固定高度避免头部跟着跳动。 */
        display: "inline-flex",
        alignItems: "center",
        minHeight: token.headerHeight,
        overflow: "hidden",
      },

      /**
       * 完成计数的数字滚动：旧值向上淡出、新值自下方淡入。
       */
      [`${headerCls}-counter-motion-enter-from`]: {
        opacity: 0,
        transform: "translateY(60%)",
      },

      [`${headerCls}-counter-motion-leave-to`]: {
        opacity: 0,
        transform: "translateY(-60%)",
      },

      [`${headerCls}-counter-motion-enter-active, ${headerCls}-counter-motion-leave-active`]:
        {
          transition: `opacity ${motion}, transform ${motion}`,
        },

      [`${headerCls}-arrow`]: {
        display: "inline-flex",
        flex: "none",
        color: token.colorTextTertiary,
        fontSize: token.fontSizeSM,
        transition: `transform ${motion}`,
      },

      [`&${componentCls}-open`]: {
        [`${headerCls}-arrow`]: {
          transform: "rotate(90deg)",
        },
      },

      /**
       * 折叠容器只负责「露出来多少」：展开后高度交还内容，滚动由它自己承担。
       */
      [contentCls]: {
        overflowY: "auto",
        overscrollBehavior: "contain",
        scrollbarGutter: "stable",
      },

      [`${contentCls}-motion-enter-active`]: {
        overflow: "hidden",
        transition: `height ${enterMotion}, opacity ${enterMotion}`,
      },

      [`${contentCls}-motion-leave-active`]: {
        overflow: "hidden",
        transition: `height ${leaveMotion}, opacity ${leaveMotion}`,
      },

      [listCls]: {
        display: "flex",
        flexDirection: "column",
        gap: token.itemGap,
        margin: 0,
        padding: 0,
        listStyle: "none",
      },

      [itemCls]: {
        display: "flex",
        alignItems: "center",
        gap: token.marginXS,
        minHeight: token.headerHeight,
      },

      [`${itemCls}-body`]: {
        display: "block",
        flex: 1,
        minWidth: 0,
      },

      [`${itemCls}-title`]: {
        position: "relative",
        display: "inline-block",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        verticalAlign: "bottom",
        transition: `color ${motion}`,
      },

      /**
       * 删除线用 `::after` 的 `scaleX` 描绘，而不是 `text-decoration`：
       * 后者无法过渡，也无法跟随单行截断后的宽度。
       */
      [`${itemCls}-strikethrough`]: {
        position: "absolute",
        insetInline: 0,
        insetBlockStart: "50%",
        height: lineWidth,
        background: "currentColor",
        transform: "scaleX(0)",
        transformOrigin: "left center",
        transition: `transform ${motion}`,
      },

      [`${itemCls}-status-text`]: visuallyHidden,

      [`${itemCls}-detail`]: {
        flex: "none",
        marginInlineStart: "auto",
        color: token.colorTextTertiary,
        fontSize: token.fontSizeSM,
        whiteSpace: "nowrap",
      },

      /**
       * 终态行的标题淡化并拉出删除线；取消态同样淡化，但保留语义上的「未完成」。
       */
      [`${itemCls}[data-status='completed'], ${itemCls}[data-status='cancelled']`]:
        {
          [`${itemCls}-title`]: {
            color: token.colorTitleCompleted,
          },

          [`${itemCls}-strikethrough`]: {
            transform: "scaleX(1)",
          },
        },

      /**
       * 四种状态共用同一份 SVG，靠状态类切换显隐。
       *
       * 对勾与叉号不参与 `display` 切换：它们的「画出」靠 `stroke-dashoffset` 过渡完成，
       * 而 `display` 不可过渡。未画出时的基准值写在 SVG 的呈现属性上，这里只负责在终态
       * 把它推到 0；呈现属性与 CSS 值之间的变化同样会触发过渡。
       */
      [statusCls]: {
        display: "inline-flex",
        flex: "none",
        fontSize: iconSize,
        color: token.colorStatusPending,

        svg: {
          display: "block",
          overflow: "visible",
        },

        [`${statusCls}-pending-circle, ${statusCls}-progress-ring`]: {
          display: "none",
        },

        [`${statusCls}-check, ${statusCls}-cross`]: {
          transition: `stroke-dashoffset ${motion}`,
        },

        [`&${statusCls}-pending`]: {
          [`${statusCls}-pending-circle`]: {
            display: "block",
          },
        },

        [`&${statusCls}-in-progress`]: {
          color: token.colorStatusProgress,

          [`${statusCls}-progress-ring`]: {
            display: "block",
            transformOrigin: "center",
            animationName: spin,
            animationDuration: "1.4s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          },
        },

        [`&${statusCls}-completed`]: {
          color: token.colorStatusCompleted,

          [`${statusCls}-check`]: {
            strokeDashoffset: 0,
          },
        },

        [`&${statusCls}-cancelled`]: {
          color: token.colorStatusCancelled,

          [`${statusCls}-cross`]: {
            strokeDashoffset: 0,
          },
        },
      },

      "@media (prefers-reduced-motion: reduce)": {
        [`${headerCls}-arrow, ${itemCls}-title, ${itemCls}-strikethrough`]: {
          transition: "none",
        },

        [`${statusCls}-check, ${statusCls}-cross`]: {
          transition: "none",
        },

        [`${contentCls}-motion-enter-active, ${contentCls}-motion-leave-active`]:
          {
            transition: "none",
          },

        [`${headerCls}-counter-motion-enter-active, ${headerCls}-counter-motion-leave-active`]:
          {
            transition: "none",
          },

        [`${statusCls}-progress-ring`]: {
          animationName: "none",
        },
      },
    },
  };
};

export default genStyleHooks(
  "TodoList",
  genTodoListStyle,
  prepareComponentToken,
);
