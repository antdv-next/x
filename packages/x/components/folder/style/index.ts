import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type { GetDefaultToken } from "../../theme/interface";
import type { FolderToken } from "./folder";

import { genStyleHooks } from "../../theme/genStyleUtils";
import genFolderStyle, { genFilePreviewStyle } from "./folder";

export interface ComponentToken {
  /**
   * @desc Background color of directory
   * @descZH 目录背景色
   */
  colorBgDirectory: string;
}

export const prepareComponentToken: GetDefaultToken<"Folder"> = token => ({
  colorBgDirectory: token.colorFillTertiary,
});

export default genStyleHooks<"Folder">(
  "Folder",
  token => {
    const folderToken = mergeToken<FolderToken>(token, {});
    return [genFolderStyle(folderToken), genFilePreviewStyle(folderToken)];
  },
  prepareComponentToken,
);
