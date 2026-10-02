import type { Locale as AntLocale } from "antdv-next/locale/index";

export interface MessageScrollerLocale {
  /** 滚动视口的 aria-label */
  viewportLabel: string;
  /** 消息导航导轨的 aria-label */
  navigationLabel: string;
  /** 回到最新按钮文本 */
  backToLatest: string;
  /** 导轨项 aria-label 模板，支持 {index} 与 {total} 占位符 */
  railItemLabel: string;
}

export interface XProLocale extends AntLocale {
  MessageScroller?: MessageScrollerLocale;
}
