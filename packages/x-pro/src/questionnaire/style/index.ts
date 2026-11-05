import type { CSSObject } from "@antdv-next/cssinjs";
import type { FullToken, GenerateStyle } from "antdv-next/theme/internal";

import { Keyframes, unit } from "@antdv-next/cssinjs";

import { genStyleHooks } from "../../theme/genStyleUtils";
import { prepareComponentToken } from "./token";

export type { ComponentToken } from "./token";

const questionEnter = new Keyframes("antXProQuestionnaireEnter", {
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const genStyle: GenerateStyle<
  FullToken<"Questionnaire">,
  CSSObject
> = token => {
  const c = token.componentCls;
  const border = `${unit(token.lineWidth)} solid ${token.colorBorderSecondary}`;
  const motion = `${token.motionDuration} ease`;
  return {
    [c]: {
      boxSizing: "border-box",
      minWidth: 0,
      padding: token.panelPadding,
      color: token.colorText,
      background: token.colorBgContainer,
      border,
      borderRadius: token.borderRadiusLG,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      "& *, & *::before, & *::after": { boxSizing: "border-box" },
      "h2, h3, p": { margin: 0 },
      "h2, h3": {
        fontWeight: token.fontWeightStrong,
        overflowWrap: "anywhere",
      },
      "button, textarea, input": { font: "inherit" },
      button: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: token.marginXS,
        minHeight: 36,
        minWidth: 36,
        paddingBlock: token.paddingXXS,
        paddingInline: token.paddingSM,
        border: `${unit(token.lineWidth)} solid transparent`,
        borderRadius: token.borderRadius,
        background: "transparent",
        color: token.colorTextSecondary,
        cursor: "pointer",
        transition: `background ${motion}, color ${motion}, border-color ${motion}`,
        "&:hover:not(:disabled)": {
          background: token.colorFillTertiary,
          color: token.colorText,
        },
        "&:disabled": { color: token.colorTextDisabled, cursor: "not-allowed" },
      },
      "button:focus-visible, [tabindex='-1']:focus-visible": {
        outline: `${unit(token.lineWidthBold)} solid ${token.colorPrimary}`,
        outlineOffset: 3,
      },
      [`${c}-header, ${c}-progress, ${c}-footer, ${c}-receipt-heading`]: {
        display: "flex",
        alignItems: "center",
        gap: token.marginXS,
      },
      [`${c}-header`]: { minWidth: 0, minHeight: 28 },
      [`${c}-header-icon`]: {
        display: "inline-flex",
        flexShrink: 0,
        color: token.colorTextTertiary,
        svg: { width: 18, height: 18 },
      },
      [`${c}-title`]: {
        flex: 1,
        minWidth: 0,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeight,
        color: token.colorTextSecondary,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      },
      [`${c}-progress`]: {
        flexShrink: 0,
        gap: token.marginSM,
        marginInlineStart: "auto",
        color: token.colorTextTertiary,
        fontSize: token.fontSizeSM,
        fontVariantNumeric: "tabular-nums",
      },
      [`${c}-step-counter`]: { whiteSpace: "nowrap" },
      [`${c}-dots`]: {
        display: "flex",
        alignItems: "center",
        gap: token.marginXXS,
        i: {
          width: 5,
          height: 5,
          borderRadius: 3,
          background: token.colorFillSecondary,
          transition: `width ${motion}, background ${motion}`,
          "&[data-completed='true']": { background: token.colorPrimaryBorder },
          "&[data-current='true']": {
            width: 16,
            background: token.colorPrimary,
          },
        },
      },
      [`${c}-dismiss`]: {
        padding: 0,
        minWidth: 36,
        minHeight: 36,
        marginInlineEnd: -token.marginXXS,
      },
      [`${c}-description, ${c}-option-description, ${c}-counter`]: {
        color: token.colorTextSecondary,
        fontSize: token.fontSizeSM,
        overflowWrap: "anywhere",
      },
      [`${c}-description`]: { marginBlockStart: token.marginXS },
      [`${c}-intro`]: {
        marginBlockStart: token.marginXXS,
        paddingInlineStart: 26,
      },
      [`${c}-content`]: { paddingBlockStart: token.paddingLG },
      [`${c}-question`]: {
        animationName: questionEnter,
        animationDuration: "0.18s",
        animationTimingFunction: "ease",
      },
      [`${c}-question-heading`]: {
        display: "flex",
        alignItems: "baseline",
        gap: token.marginSM,
        h3: {
          flex: 1,
          minWidth: 0,
          fontSize: token.fontSizeHeading4,
          lineHeight: token.lineHeightLG,
          letterSpacing: "-0.01em",
        },
      },
      [`${c}-requirement`]: {
        flexShrink: 0,
        fontSize: token.fontSizeSM,
        color: token.colorTextSecondary,
        paddingInline: token.paddingXS,
        borderRadius: token.borderRadiusSM,
        background: token.colorFillQuaternary,
      },
      [`${c}-options`]: {
        display: "grid",
        gap: token.marginXS,
        maxHeight: token.optionsMaxHeight,
        overflowY: "auto",
        overscrollBehavior: "contain",
        marginBlockStart: token.margin,
        padding: token.lineWidthBold,
        marginInline: -token.lineWidthBold,
        "&:empty": { display: "none" },
      },
      [`${c}-option`]: {
        position: "relative",
        border,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        overflowWrap: "anywhere",
        transition: `background ${motion}, border-color ${motion}, box-shadow ${motion}`,
        "&:hover:not([data-disabled='true'])": {
          background: token.colorFillQuaternary,
          borderColor: token.colorPrimaryBorder,
        },
        "&[data-checked='true']": {
          borderColor: token.colorPrimaryBorder,
          background: token.colorPrimaryBg,
          [`${c}-option-label`]: { color: token.colorText },
        },
        "&[data-disabled='true']": {
          opacity: token.opacityLoading,
          label: { cursor: "not-allowed" },
        },
        label: {
          display: "flex",
          alignItems: "flex-start",
          gap: token.marginSM,
          paddingBlock: token.paddingSM,
          paddingInline: token.padding,
          minHeight: token.optionMinHeight,
          cursor: "pointer",
        },
        [`${c}-option-body`]: { display: "block", flex: 1, minWidth: 0 },
      },
      // Keep the native input as the keyboard and screen-reader control.
      [`${c}-option-control`]: {
        position: "relative",
        display: "inline-flex",
        flexShrink: 0,
        width: 18,
        height: 18,
        marginBlockStart: 2,
        input: {
          appearance: "none",
          WebkitAppearance: "none",
          width: "100%",
          height: "100%",
          margin: 0,
          border: `${unit(token.lineWidth)} solid ${token.colorBorder}`,
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusSM,
          cursor: "inherit",
          transition: `background ${motion}, border-color ${motion}`,
          "&[type='radio']": { borderRadius: "50%" },
          "&:checked": {
            background: token.colorPrimary,
            borderColor: token.colorPrimary,
          },
          "&:focus-visible": {
            outline: `${unit(token.lineWidthBold)} solid ${token.colorPrimary}`,
            outlineOffset: 3,
          },
        },
        svg: {
          position: "absolute",
          inset: 1,
          width: 16,
          height: 16,
          color: token.colorTextLightSolid,
          pointerEvents: "none",
          opacity: 0,
        },
        "input:checked + svg": { opacity: 1 },
      },
      [`${c}-option-label`]: {
        display: "block",
        fontWeight: token.fontWeightStrong,
      },
      [`${c}-option-description`]: {
        marginBlockStart: 2,
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        "&[data-expanded='true']": { display: "block" },
      },
      [`${c}-description-toggle`]: {
        marginInlineStart: 40,
        marginBlockStart: -token.marginXXS,
        marginBlockEnd: token.marginXXS,
        fontSize: token.fontSizeSM,
        minHeight: 36,
        paddingInline: token.paddingXS,
      },
      [`${c}-custom`]: {
        display: "grid",
        gap: token.marginXS,
        marginBlockStart: token.marginSM,
        label: { fontSize: token.fontSizeSM, color: token.colorTextSecondary },
        textarea: {
          display: "block",
          width: "100%",
          minHeight: 40,
          paddingBlock: token.paddingXS,
          paddingInline: token.paddingSM,
          border,
          borderRadius: token.borderRadius,
          color: token.colorText,
          background: token.colorFillQuaternary,
          outline: "none",
          boxShadow: "none",
          resize: "vertical",
          transition: `border-color ${motion}, background ${motion}, box-shadow ${motion}`,
          "&::placeholder": { color: token.colorTextPlaceholder },
          "&:hover:not(:disabled):not(:focus)": {
            borderColor: token.colorPrimaryBorder,
            background: token.colorBgContainer,
          },
          "&:focus:not(:disabled)": {
            borderColor: token.colorPrimary,
            background: token.colorBgContainer,
            boxShadow: `0 0 0 ${unit(token.controlOutlineWidth)} ${token.controlOutline}`,
          },
          "&:disabled": {
            color: token.colorTextDisabled,
            cursor: "not-allowed",
          },
        },
        "&[data-standalone='true']": {
          marginBlockStart: token.margin,
          textarea: { minHeight: token.controlHeightLG * 2 },
        },
      },
      [`${c}-counter`]: { textAlign: "end", "&:empty": { display: "none" } },
      [`${c}-error`]: {
        color: token.colorError,
        fontSize: token.fontSizeSM,
        marginBlockStart: token.marginSM,
      },
      [`${c}-footer`]: {
        flexWrap: "wrap",
        gap: token.marginXXS,
        marginBlockStart: token.marginLG,
        paddingBlockStart: token.paddingSM,
        borderBlockStart: border,
        "> button:first-child:not(:last-child)": {
          marginInlineStart: -token.paddingXS,
        },
      },
      [`${c}-primary`]: {
        marginInlineStart: "auto",
        paddingInline: token.padding,
        fontWeight: token.fontWeightStrong,
        background: token.colorPrimary,
        borderColor: token.colorPrimary,
        color: token.colorTextLightSolid,
        "&:hover:not(:disabled)": {
          background: token.colorPrimaryHover,
          borderColor: token.colorPrimaryHover,
          color: token.colorTextLightSolid,
        },
        "&:active:not(:disabled)": { background: token.colorPrimaryActive },
        "&:disabled": {
          background: token.colorFillTertiary,
          borderColor: "transparent",
          color: token.colorTextDisabled,
        },
      },
      [`${c}-arrow`]: {
        display: "inline-flex",
        flexShrink: 0,
        svg: { width: 16, height: 16 },
      },
      [`${c}-receipt`]: {
        marginBlockStart: token.margin,
        h3: { fontSize: token.fontSize, color: token.colorText },
        "> p": {
          marginBlockStart: token.marginXS,
          fontSize: token.fontSizeSM,
          color: token.colorTextSecondary,
        },
        dl: { marginBlock: token.marginSM, borderBlockStart: border },
        "dl > div": {
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
          gap: token.marginSM,
          paddingBlock: token.paddingSM,
          borderBlockEnd: border,
        },
        dt: {
          minWidth: 0,
          color: token.colorTextSecondary,
          fontSize: token.fontSizeSM,
          overflowWrap: "anywhere",
        },
        dd: {
          minWidth: 0,
          margin: 0,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: token.marginXXS,
          fontSize: token.fontSizeSM,
        },
        "> button": { marginInlineStart: -token.paddingSM },
      },
      [`${c}-receipt-icon`]: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        flexShrink: 0,
        borderRadius: "50%",
        background: token.colorSuccessBg,
        color: token.colorSuccess,
        svg: { width: 20, height: 20 },
      },
      "&[data-status='expired'], &[data-status='cancelled']": {
        [`${c}-receipt-icon`]: {
          background: token.colorFillTertiary,
          color: token.colorTextSecondary,
        },
      },
      [`${c}-chip`]: {
        display: "inline-block",
        maxWidth: "100%",
        paddingInline: token.paddingXS,
        paddingBlock: 2,
        background: token.colorFillTertiary,
        borderRadius: token.borderRadiusSM,
        overflowWrap: "anywhere",
      },
      [`${c}-sr-only`]: {
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      },
      [`${c}-disclosure-enter-active, ${c}-disclosure-leave-active`]: {
        overflow: "hidden",
        transition: `height ${motion}, opacity ${motion}`,
      },
      "&-rtl": {
        direction: "rtl",
        [`${c}-arrow`]: { transform: "scaleX(-1)" },
      },
      "@media (max-width: 480px)": {
        padding: token.padding,
        [`${c}-header`]: { flexWrap: "wrap", rowGap: token.marginXXS },
        [`${c}-progress`]: { gap: token.marginXS },
        [`${c}-dots`]: {
          gap: 3,
          i: { width: 4, height: 4, "&[data-current='true']": { width: 10 } },
        },
        [`${c}-question-heading`]: {
          flexWrap: "wrap",
          gap: token.marginXXS,
          h3: { flexBasis: "100%" },
        },
        [`${c}-primary`]: {
          width: "100%",
          marginInlineStart: 0,
          marginBlockStart: token.marginXS,
        },
        [`${c}-option label`]: { paddingInline: token.paddingSM },
        [`${c}-receipt dl > div`]: {
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: token.marginXXS,
        },
      },
      "@media (prefers-reduced-motion: reduce)": {
        [`${c}-question`]: { animationDuration: "0.1s" },
        [`${c}-disclosure-enter-active, ${c}-disclosure-leave-active`]: {
          transition: "opacity 0.1s ease",
        },
        [`${c}-dots i`]: { transition: "none" },
      },
      "@media (forced-colors: active)": {
        [`${c}-custom textarea:focus-visible`]: {
          outline: `${unit(token.lineWidthBold)} solid Highlight`,
          outlineOffset: 2,
        },
      },
    },
  };
};
export default genStyleHooks("Questionnaire", genStyle, prepareComponentToken);
