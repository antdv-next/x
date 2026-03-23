import { mergeToken } from "@antdv-next/cssinjs/cssinjs-utils";

import type { GetDefaultToken } from "../../theme/interface";
import type { ThinkToken } from "./think";

import { blinkMotion } from "../../style/motion/blink";
import { genCollapseMotion } from "../../style/motion/collapse";
import { genStyleHooks } from "../../theme/genStyleUtils";
import genThinkStyle from "./think";

export const prepareComponentToken: GetDefaultToken<"Think"> = token => ({
  colorTextBlink: token.colorTextBase,
  colorTextBlinkDefault: token.colorTextDescription,
});

export interface ComponentToken {
  /**
   * @desc The highlight color for blink animation
   * @descZH 闪烁动画高亮色
   */
  colorTextBlink: string;
  /**
   * @desc The dimmed base color during blink animation
   * @descZH 闪烁动画基底色
   */
  colorTextBlinkDefault: string;
}

export default genStyleHooks<"Think">(
  "Think",
  token => {
    const thinkToken = mergeToken<ThinkToken>(token, {});
    return [
      genThinkStyle(thinkToken),
      genCollapseMotion(thinkToken),
      blinkMotion(thinkToken as any, `${thinkToken.componentCls}-motion-blink`),
    ];
  },
  prepareComponentToken,
);
