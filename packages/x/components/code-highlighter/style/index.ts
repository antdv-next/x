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
   * 代码字体
   */
  codeFontFamily?: string;
  /**
   * 代码字体大小
   */
  codeFontSize?: number;
  /**
   * 亮色主题下的代码文字颜色，用于语言未命中高亮时的降级文本
   */
  codeColor?: string;
  /**
   * 暗色主题下的代码文字颜色，用于语言未命中高亮时的降级文本
   */
  codeColorDark?: string;
  /**
   * 亮色主题下代码区与行号栏的背景色
   */
  codeBg?: string;
  /**
   * 暗色主题下代码区与行号栏的背景色
   */
  codeBgDark?: string;
  /**
   * 暗色主题下头部区域的背景色
   */
  codeHeaderBgDark?: string;
  /**
   * 暗色主题下头部与行号栏的分隔线颜色
   */
  codeBorderColorDark?: string;
  /**
   * 暗色主题下语言标签的文字颜色
   */
  codeLangColorDark?: string;
  /**
   * 暗色主题下行号的文字颜色
   */
  codeLineNumberColorDark?: string;
  /**
   * 暗色主题下头部操作按钮的文字颜色
   */
  codeBtnColorDark?: string;
  /**
   * 暗色主题下头部操作按钮悬浮态的背景色
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
      border: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderSecondary}`,

      // Header
      [`${componentCls}-header`]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: unit(token.paddingSM),
        paddingBlock: 4,
        borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderSecondary}`,
        backgroundColor: token.colorFillSecondary,
      },

      [`${componentCls}-lang`]: {
        fontSize: token.fontSizeSM,
        color: token.colorTextSecondary,
        fontWeight: 500,
        textTransform: "capitalize",
      },

      [`${componentCls}-actions`]: {
        display: "flex",
        alignItems: "center",
        gap: token.paddingXXS,
      },

      [`${componentCls}-theme-btn, ${componentCls}-copy-btn`]: {
        color: token.colorTextSecondary,
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
        borderRight: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderSecondary}`,
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
        color: token.colorTextQuaternary,
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
        borderColor: token.colorBorder,

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
> = () => ({
  codeFontFamily:
    "'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace",
  codeFontSize: 14,
  // 与 shiki vitesse-light / vitesse-dark 的前景色保持一致
  codeColor: "#393a34",
  codeColorDark: "#dbd7caee",
  codeBg: "#fafafa",
  codeBgDark: "#1e1e1e",
  codeHeaderBgDark: "#252526",
  codeBorderColorDark: "#3e3e42",
  codeLangColorDark: "#cccccc",
  codeLineNumberColorDark: "#858585",
  codeBtnColorDark: "#ffffff",
  codeBtnHoverBgDark: "#3e3e42",
});

export default genStyleHooks<"CodeHighlighter">(
  "CodeHighlighter",
  token => {
    const compToken = mergeToken<CodeHighlighterToken>(token, {});
    return [genCodeHighlighterStyle(compToken)];
  },
  prepareComponentToken,
);
