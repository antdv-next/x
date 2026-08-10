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
   * @desc 代码字体
   * @descEN Code font family
   */
  codeFontFamily?: string;
  /**
   * @desc 代码字体大小
   * @descEN Code font size
   */
  codeFontSize?: number;
  /**
   * @desc 亮色主题下的代码文字颜色，用于语言未命中高亮时的降级文本
   * @descEN Code text color in light theme (unhighlighted fallback)
   */
  codeColor?: string;
  /**
   * @desc 暗色主题下的代码文字颜色，用于语言未命中高亮时的降级文本
   * @descEN Code text color in dark theme (unhighlighted fallback)
   */
  codeColorDark?: string;
  /**
   * @desc 亮色主题下代码区与行号栏的背景色
   * @descEN Background of the code area and gutter in light theme
   */
  codeBg?: string;
  /**
   * @desc 暗色主题下代码区与行号栏的背景色
   * @descEN Background of the code area and gutter in dark theme
   */
  codeBgDark?: string;
  /**
   * @desc 亮色主题下头部区域的背景色
   * @descEN Header background in light theme
   */
  codeHeaderBg?: string;
  /**
   * @desc 暗色主题下头部区域的背景色
   * @descEN Header background in dark theme
   */
  codeHeaderBgDark?: string;
  /**
   * @desc 亮色主题下头部与行号栏的分隔线颜色
   * @descEN Header and gutter divider color in light theme
   */
  codeBorderColor?: string;
  /**
   * @desc 暗色主题下头部与行号栏的分隔线颜色
   * @descEN Header and gutter divider color in dark theme
   */
  codeBorderColorDark?: string;
  /**
   * @desc 亮色主题下语言标签的文字颜色
   * @descEN Language label color in light theme
   */
  codeLangColor?: string;
  /**
   * @desc 暗色主题下语言标签的文字颜色
   * @descEN Language label color in dark theme
   */
  codeLangColorDark?: string;
  /**
   * @desc 亮色主题下行号的文字颜色
   * @descEN Line number color in light theme
   */
  codeLineNumberColor?: string;
  /**
   * @desc 暗色主题下行号的文字颜色
   * @descEN Line number color in dark theme
   */
  codeLineNumberColorDark?: string;
  /**
   * @desc 亮色主题下头部操作按钮的文字颜色
   * @descEN Header action button color in light theme
   */
  codeBtnColor?: string;
  /**
   * @desc 暗色主题下头部操作按钮的文字颜色
   * @descEN Header action button color in dark theme
   */
  codeBtnColorDark?: string;
  /**
   * @desc 亮色主题下头部操作按钮悬浮态的背景色
   * @descEN Header action button hover background in light theme
   */
  codeBtnHoverBg?: string;
  /**
   * @desc 暗色主题下头部操作按钮悬浮态的背景色
   * @descEN Header action button hover background in dark theme
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
      border: `${unit(token.lineWidth)} ${token.lineType} ${token.codeBorderColor}`,

      // Header
      [`${componentCls}-header`]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: unit(token.paddingSM),
        paddingBlock: 4,
        borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.codeBorderColor}`,
        backgroundColor: token.codeHeaderBg,
      },

      [`${componentCls}-lang`]: {
        fontSize: token.fontSizeSM,
        color: token.codeLangColor,
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
        borderRight: `${unit(token.lineWidth)} ${token.lineType} ${token.codeBorderColor}`,
        userSelect: "none",
        flexShrink: 0,
        minWidth: "3em",
        lineHeight: "1.5em",
      },

      [`${componentCls}-line-number`]: {
        fontFamily: token.codeFontFamily,
        fontSize: unit(token.codeFontSize ?? 13),
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
          fontFamily: token.codeFontFamily,
          fontSize: unit(token.codeFontSize ?? 13),
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
        borderColor: token.codeBorderColorDark,

        [`${componentCls}-header`]: {
          backgroundColor: token.codeHeaderBgDark,
          borderBottomColor: token.codeBorderColorDark,
        },

        [`${componentCls}-lang`]: {
          color: token.codeLangColorDark,
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
          borderRightColor: token.codeBorderColorDark,
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
    codeFontFamily: token.fontFamilyCode,
    codeFontSize: token.fontSize,
    // 亮色预览（默认模式）：亮色应用下跟随 Design Token，暗色应用下保持固定值
    codeColor: isDarkApp ? "#393a34" : token.colorText,
    codeBg: isDarkApp ? "#fafafa" : token.colorBgLayout,
    codeHeaderBg: isDarkApp ? "#f0f0f0" : token.colorFillSecondary,
    codeBorderColor: isDarkApp ? "#f0f0f0" : token.colorBorderSecondary,
    codeLangColor: isDarkApp ? "rgba(0, 0, 0, 0.65)" : token.colorTextSecondary,
    codeLineNumberColor: isDarkApp
      ? "rgba(0, 0, 0, 0.25)"
      : token.colorTextQuaternary,
    codeBtnColor: isDarkApp ? "rgba(0, 0, 0, 0.65)" : token.colorTextSecondary,
    codeBtnHoverBg: isDarkApp
      ? "rgba(0, 0, 0, 0.06)"
      : token.colorFillSecondary,
    // 暗色预览（`theme="dark"`）：暗色应用下跟随 Design Token，亮色应用下保持固定值
    codeColorDark: isDarkApp ? token.colorText : "#dbd7caee",
    codeBgDark: isDarkApp ? token.colorBgElevated : "#1e1e1e",
    codeHeaderBgDark: isDarkApp ? token.colorFillSecondary : "#252526",
    codeBorderColorDark: isDarkApp ? token.colorBorder : "#3e3e42",
    codeLangColorDark: isDarkApp ? token.colorTextSecondary : "#cccccc",
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
