import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type {
  FullToken,
  GenerateStyle,
  GetDefaultToken,
} from "../../theme/interface";

import { genStyleHooks } from "../../theme/genStyleUtils";

export interface ComponentToken {}

interface SuggestionToken extends FullToken<"Suggestion"> {}

const genSuggestionStyle: GenerateStyle<SuggestionToken> = token => {
  const { componentCls, antCls } = token;

  return {
    [componentCls]: {
      [`${antCls}-cascader-menus ${antCls}-cascader-menu`]: {
        height: "auto",
      },

      [`${componentCls}-item`]: {
        "&-icon": {
          marginInlineEnd: token.paddingXXS,
        },

        "&-extra": {
          marginInlineStart: token.padding,
        },
      },

      [`&${componentCls}-block`]: {
        [`${componentCls}-item-extra`]: {
          marginInlineStart: "auto",
        },
      },
    },
  };
};

export const prepareComponentToken: GetDefaultToken<"Suggestion"> = () => ({});

export default genStyleHooks(
  "Suggestion",
  token => {
    const suggestionToken = mergeToken<SuggestionToken>(token, {});
    return genSuggestionStyle(suggestionToken);
  },
  prepareComponentToken,
);
