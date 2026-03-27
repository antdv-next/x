import { unit } from "@antdv-next/cssinjs";
import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from "../../theme/interface";

import { genStyleHooks } from "../../theme/genStyleUtils";

export interface ComponentToken {
  colorBgTitle?: string;
  colorTextTitle?: string;
  colorBorderCode?: string;
  colorBorderGraph?: string;
  graphHeight?: number;
}

export interface MermaidToken extends FullToken<"Mermaid"> {}

const genMermaidStyle: GenerateStyle<MermaidToken> = token => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      borderRadius: token.borderRadiusLG,
      overflow: "hidden",

      [`${componentCls}-header`]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: token.marginXS,
        background: token.colorBgTitle,
        color: token.colorTextTitle,
        paddingBlock: token.paddingXS,
        paddingInline: token.paddingSM,
        borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderGraph}`,
      },

      [`${componentCls}-graph`]: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: token.colorBgContainer,
        borderInline: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderGraph}`,
        borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderGraph}`,
        padding: token.paddingSM,
        overflow: "auto",
        height: unit(token.graphHeight ?? 400),
      },

      [`${componentCls}-graph-hidden`]: {
        display: "none",
      },

      [`${componentCls}-graph svg`]: {
        display: "block",
        maxWidth: "100%",
        maxHeight: "100%",
        width: "auto",
        height: "auto",
        transformOrigin: "center center",
      },

      [`${componentCls}-code`]: {
        background: token.colorBgContainer,
        borderInline: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderCode}`,
        borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderCode}`,
        overflow: "auto",
        height: unit(token.graphHeight ?? 400),
      },

      [`&${componentCls}-rtl`]: {
        direction: "rtl",
      },
    },
  };
};

export const prepareComponentToken: GetDefaultToken<"Mermaid"> = token => ({
  colorBgTitle: token.colorFillContent,
  colorTextTitle: token.colorText,
  colorBorderCode: token.colorBorderSecondary,
  colorBorderGraph: token.colorBorderSecondary,
  graphHeight: 400,
});

export default genStyleHooks<"Mermaid">(
  "Mermaid",
  token => {
    const mermaidToken = mergeToken<MermaidToken>(token, {});
    return [genMermaidStyle(mermaidToken)];
  },
  prepareComponentToken,
);
