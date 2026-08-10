import { FastColor } from "@ant-design/fast-color";
import { unit } from "@antdv-next/cssinjs";
import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from "../../theme/interface";

import { genStyleHooks } from "../../theme/genStyleUtils";

export interface ComponentToken {
  /**
   * @desc 标题背景颜色
   * @descEN Title background color
   */
  colorBgTitle?: string;
  /**
   * @desc 暗色主题下标题背景颜色
   * @descEN Title background color in dark theme
   */
  colorBgTitleDark?: string;
  /**
   * @desc 标题文本颜色
   * @descEN Title text color
   */
  colorTextTitle?: string;
  /**
   * @desc 暗色主题下标题文本颜色
   * @descEN Title text color in dark theme
   */
  colorTextTitleDark?: string;
  /**
   * @desc 代码块边框颜色
   * @descEN Code block border color
   */
  colorBorderCode?: string;
  /**
   * @desc 暗色主题下代码块边框颜色
   * @descEN Code block border color in dark theme
   */
  colorBorderCodeDark?: string;
  /**
   * @desc 代码区与行号栏背景色
   * @descEN Background of the code area and gutter
   */
  codeBg?: string;
  /**
   * @desc 暗色主题下代码区与行号栏背景色
   * @descEN Background of the code area and gutter in dark theme
   */
  codeBgDark?: string;
  /**
   * @desc 代码文字颜色（语言未命中高亮时降级）
   * @descEN Code text color (fallback when language is not highlighted)
   */
  codeColor?: string;
  /**
   * @desc 暗色主题下代码文字颜色（语言未命中高亮时降级）
   * @descEN Code text color in dark theme (fallback when language is not highlighted)
   */
  codeColorDark?: string;
  /**
   * @desc 行号文字颜色
   * @descEN Line number color
   */
  codeLineNumberColor?: string;
  /**
   * @desc 暗色主题下行号文字颜色
   * @descEN Line number color in dark theme
   */
  codeLineNumberColorDark?: string;
  /**
   * @desc 操作按钮文字颜色
   * @descEN Action button color
   */
  codeBtnColor?: string;
  /**
   * @desc 暗色主题下操作按钮文字颜色
   * @descEN Action button color in dark theme
   */
  codeBtnColorDark?: string;
  /**
   * @desc 操作按钮悬浮背景色
   * @descEN Action button hover background
   */
  codeBtnHoverBg?: string;
  /**
   * @desc 暗色主题下操作按钮悬浮背景色
   * @descEN Action button hover background in dark theme
   */
  codeBtnHoverBgDark?: string;
}

export interface CodeHighlighterToken extends FullToken<"CodeHighlighter"> {}

const genCodeHighlighterStyle: GenerateStyle<CodeHighlighterToken> = token => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      position: "relative",
      borderRadius: token.borderRadiusLG,
      overflow: "hidden",
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      border: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderCode}`,

      // Header
      [`${componentCls}-header`]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: unit(token.paddingSM),
        paddingBlock: 4,
        borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderCode}`,
        backgroundColor: token.colorBgTitle,
      },

      [`${componentCls}-lang`]: {
        fontSize: token.fontSizeSM,
        color: token.colorTextTitle,
        fontWeight: 500,
        textTransform: "capitalize",
      },

      [`${componentCls}-actions`]: {
        display: "flex",
        alignItems: "center",
        gap: token.paddingXXS,
      },

      [`${componentCls}-theme-btn, ${componentCls}-copy-btn`]: {
        color: `${token.codeBtnColor} !important`,
        "&:hover, &:focus": {
          color: `${token.codeBtnColor} !important`,
          backgroundColor: `${token.codeBtnHoverBg} !important`,
        },
      },

      // Content
      [`${componentCls}-content`]: {
        display: "flex",
        overflow: "auto",
        backgroundColor: token.codeBg,
        alignItems: "stretch",
      },

      // Line numbers
      [`${componentCls}-line-numbers`]: {
        paddingBlock: unit(token.paddingSM),
        paddingInline: unit(token.paddingXS),
        textAlign: "right",
        backgroundColor: token.codeBg,
        borderRight: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderCode}`,
        userSelect: "none",
        flexShrink: 0,
        minWidth: "3em",
        lineHeight: "1.5em",
      },

      [`${componentCls}-line-number`]: {
        fontFamily: token.fontFamilyCode,
        fontSize: unit(token.fontSize),
        lineHeight: "1.5em",
        height: "1.5em",
        color: token.codeLineNumberColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        boxSizing: "border-box",
      },

      // Code area
      [`${componentCls}-code`]: {
        flex: 1,
        overflow: "auto",
        // 语言未命中高亮时会回退成无内联样式的 pre/code，需要兜底文字色
        color: token.codeColor,

        // Shiki generated pre/code
        "& > pre": {
          margin: 0,
          padding: unit(token.paddingSM),
          backgroundColor: "transparent !important",
          fontFamily: token.fontFamilyCode,
          fontSize: unit(token.fontSize),
          lineHeight: "1.5em",
          overflow: "visible",
        },

        "& > pre > code": {
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "inherit",
          display: "block",
          whiteSpace: "pre",
        },
      },

      // Theme: Dark
      [`&${componentCls}-dark`]: {
        borderColor: token.colorBorderCodeDark,

        [`${componentCls}-header`]: {
          backgroundColor: token.colorBgTitleDark,
          borderBottomColor: token.colorBorderCodeDark,
        },

        [`${componentCls}-lang`]: {
          color: token.colorTextTitleDark,
        },

        [`${componentCls}-theme-btn, ${componentCls}-copy-btn`]: {
          color: `${token.codeBtnColorDark} !important`,
          "&:hover, &:focus": {
            color: `${token.codeBtnColorDark} !important`,
            backgroundColor: `${token.codeBtnHoverBgDark} !important`,
          },
        },

        [`${componentCls}-content`]: {
          backgroundColor: token.codeBgDark,
        },

        [`${componentCls}-line-numbers`]: {
          backgroundColor: token.codeBgDark,
          borderRightColor: token.colorBorderCodeDark,
        },

        [`${componentCls}-line-number`]: {
          color: token.codeLineNumberColorDark,
        },

        [`${componentCls}-code`]: {
          color: token.codeColorDark,
        },
      },
    },
  };
};

export const prepareComponentToken: GetDefaultToken<
  "CodeHighlighter"
> = token => {
  // 组件的 `theme` prop（light/dark 代码预览）与应用主题算法是正交的：
  // 仅当应用主题与组件模式一致时，才能安全地从全局 token 派生；
  // 反之（如暗色算法应用 + `theme="light"`）继续使用与 shiki vitesse 主题
  // 配套的固定值，避免出现 #172/#174 中描述的颜色不可见问题。
  const isDarkApp = new FastColor(token.colorBgContainer).isDark();

  return {
    // 标题（头部）背景/文字/边框：与上游 @ant-design/x 对齐
    colorBgTitle: isDarkApp ? "#f0f0f0" : token.colorFillContent,
    colorTextTitle: isDarkApp ? "rgba(0, 0, 0, 0.65)" : token.colorText,
    colorBorderCode: isDarkApp ? "#f0f0f0" : token.colorBorderSecondary,
    // 亮色预览（默认模式）：亮色应用下跟随 Design Token，暗色应用下保持固定值
    codeColor: isDarkApp ? "#393a34" : token.colorText,
    codeBg: isDarkApp ? "#fafafa" : token.colorBgLayout,
    codeLineNumberColor: isDarkApp
      ? "rgba(0, 0, 0, 0.25)"
      : token.colorTextQuaternary,
    codeBtnColor: isDarkApp ? "rgba(0, 0, 0, 0.65)" : token.colorTextSecondary,
    codeBtnHoverBg: isDarkApp
      ? "rgba(0, 0, 0, 0.06)"
      : token.colorFillSecondary,
    // 暗色预览（`theme="dark"`）：暗色应用下跟随 Design Token，亮色应用下保持固定值
    colorBgTitleDark: isDarkApp ? token.colorFillContent : "#252526",
    colorTextTitleDark: isDarkApp ? token.colorText : "#cccccc",
    colorBorderCodeDark: isDarkApp ? token.colorBorder : "#3e3e42",
    codeColorDark: isDarkApp ? token.colorText : "#dbd7caee",
    codeBgDark: isDarkApp ? token.colorBgElevated : "#1e1e1e",
    codeLineNumberColorDark: isDarkApp ? token.colorTextQuaternary : "#858585",
    codeBtnColorDark: isDarkApp ? token.colorText : "#ffffff",
    codeBtnHoverBgDark: isDarkApp ? token.colorFillSecondary : "#3e3e42",
  };
};

export default genStyleHooks<"CodeHighlighter">(
  "CodeHighlighter",
  token => {
    const compToken = mergeToken<CodeHighlighterToken>(token, {});
    return [genCodeHighlighterStyle(compToken)];
  },
  prepareComponentToken,
);
