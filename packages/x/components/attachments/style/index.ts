import { FastColor } from "@ant-design/fast-color";
import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from "../../theme/interface";

import { genStyleHooks } from "../../theme/genStyleUtils";

export interface ComponentToken {
  colorBgPlaceholderHover: string;
}

export interface AttachmentsToken extends FullToken<"Attachments"> {}

const anyBoxSizing = {
  "&, *": {
    boxSizing: "border-box" as const,
  },
};

const genAttachmentsStyle: GenerateStyle<AttachmentsToken> = token => {
  const { componentCls, calc, antCls } = token;

  const dropAreaCls = `${componentCls}-drop-area`;
  const placeholderCls = `${componentCls}-placeholder`;

  return {
    [componentCls]: {
      position: "relative" as const,
      width: "100%",
      ...anyBoxSizing,

      "&-rtl": {
        direction: "rtl" as const,
      },

      [dropAreaCls]: {
        position: "absolute" as const,
        inset: 0,
        zIndex: token.zIndexPopupBase,
        ...anyBoxSizing,

        "&-on-body": {
          position: "fixed" as const,
          inset: 0,
        },

        [placeholderCls]: {
          padding: 0,
        },
      },

      [placeholderCls]: {
        width: "100%",
        height: "100%",
        borderRadius: token.borderRadius,
        borderWidth: token.lineWidthBold,
        borderStyle: "dashed",
        borderColor: "transparent",
        padding: token.padding,
        position: "relative" as const,
        backdropFilter: "blur(10px)",
        background: token.colorBgPlaceholderHover,
        ...anyBoxSizing,

        [`${antCls}-upload-wrapper ${antCls}-upload${antCls}-upload-btn`]: {
          padding: 0,
        },

        [`&${placeholderCls}-drag-in`]: {
          borderColor: token.colorPrimaryHover,
        },
        [`&${placeholderCls}-disabled`]: {
          opacity: 0.25,
          pointerEvents: "none" as const,
        },

        [`${placeholderCls}-inner`]: {
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          gap: calc(token.paddingXXS).div(2).equal(),
        },
        [`${placeholderCls}-icon`]: {
          fontSize: token.fontSizeHeading2,
          lineHeight: 1,
        },
        [`${placeholderCls}-title`]: {
          margin: 0,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
        },
        [`${placeholderCls}-description`]: {
          color: token.colorTextDescription,
          fontSize: token.fontSizeSM,
        },
      },
    },
  };
};

const genFileListStyle: GenerateStyle<AttachmentsToken> = token => {
  const { componentCls, calc, antCls } = token;

  const fileListCls = `${componentCls}-list`;
  const cardCls = `${componentCls}-list-card`;

  const cardHeight = calc(token.fontSize)
    .mul(token.lineHeight)
    .mul(2)
    .add(token.paddingSM)
    .add(token.paddingSM)
    .equal();

  return {
    [componentCls]: {
      [fileListCls]: {
        boxSizing: "content-box" as const,

        "&-upload-btn": {
          width: cardHeight,
          height: cardHeight,
          fontSize: token.fontSizeHeading2,
          color: "#999",
        },

        [`${cardCls}-status-error`]: {
          borderColor: token.colorError,
          borderWidth: token.lineWidth,
          borderStyle: token.lineType,

          [`${cardCls}-desc`]: {
            color: token.colorError,
          },
        },

        [`${cardCls}-status-uploading, ${cardCls}-status-error`]: {
          [`${antCls}-image-mask`]: {
            opacity: 1,
          },
        },

        [`${cardCls}-file-img-mask`]: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
        },

        [`${cardCls}-desc`]: {
          display: "flex",
          flexWrap: "nowrap" as const,
          maxWidth: "100%",
        },

        [`${cardCls}-ellipsis`]: {
          maxWidth: 58,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap" as const,
        },
      },
    },
  };
};

export const prepareComponentToken: GetDefaultToken<"Attachments"> = token => {
  const colorBgPlaceholderHover = new FastColor(token.colorBgContainer)
    .setA(0.85)
    .toRgbString();

  return {
    colorBgPlaceholderHover,
  };
};

export default genStyleHooks(
  "Attachments",
  token => {
    const compToken = mergeToken<AttachmentsToken>(token, {});
    return [genAttachmentsStyle(compToken), genFileListStyle(compToken)];
  },
  prepareComponentToken,
);
