import type { FullToken, GenerateStyle } from "../../theme/interface";

export interface FolderToken extends FullToken<"Folder"> {
  colorBgDirectory: string;
}

const genFolderStyle: GenerateStyle<FolderToken> = token => {
  const { componentCls, antCls } = token;

  return {
    [componentCls]: {
      height: "100%",
      width: "100%",
      background: token.colorBgDirectory,
      [`${antCls}-tree-node-content-wrapper`]: {
        display: "flex",
      },
      [`${antCls}-tree-node-content-wrapper-open,${antCls}-tree-node-content-wrapper-close`]:
        {
          display: "flex",
        },
      [`${antCls}-tree-node-content-wrapper-normal`]: {
        display: "flex",
      },
      [`${antCls}-tree-list`]: {
        paddingInline: token.padding,
        paddingBlock: token.paddingXS,
      },
      [`${antCls}-tree-switcher`]: {
        width: "10px",
        "&:before": {
          width: "10px",
          height: "10px",
        },
      },
      [`${antCls}-tree-node-content-wrapper`]: {
        paddingInline: 0,
      },
      [`${componentCls}-container`]: {
        height: "100%",
      },
      [`${componentCls}-directory-tree`]: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
      },
      [`${componentCls}-directory-tree-title`]: {
        width: "100%",
        display: "flex",
        alignItems: "center",
      },
      [`${componentCls}-directory-tree-content`]: {
        width: "100%",
        background: "transparent",
        height: "100%",
        borderRadius: "unset",
        display: "flex",
        overflow: "auto",
      },
      [`&${componentCls}-rtl`]: {
        direction: "rtl",
      },
    },
  };
};

export const genFilePreviewStyle: GenerateStyle<FolderToken> = token => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      [`${componentCls}-preview`]: {
        width: "100%",
        background: token.colorBgContainer,
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      },
      [`${componentCls}-preview-title-wrapper`]: {
        background: token.colorBgContainer,
        paddingInline: token.padding,
        paddingBlock: token.paddingXS,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      },
      [`${componentCls}-preview-title`]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      },
      [`${componentCls}-preview-content`]: {
        overflow: "auto",
        flex: 1,
        background: token.colorBgContainer,
        paddingInline: token.padding,
        paddingBlock: token.paddingXS,
      },
      [`${componentCls}-preview-loading-container`]: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBlockStart: token.calc(token.marginLG).mul(3).equal(),
      },
      [`${componentCls}-preview-empty-container`]: {
        marginBlockStart: token.calc(token.marginLG).mul(3).equal(),
      },
      [`${componentCls}-directory-tree-item-title`]: {
        display: "flex",
        whiteSpace: "nowrap",
        paddingInlineEnd: token.padding,
      },
    },
  };
};

export default genFolderStyle;
