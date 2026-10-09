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

export interface TodoListLocale {
  /** 头部标题缺省值 */
  title: string;
  /** 完成计数 aria-label 模板，支持 {completed} 与 {total} 占位符 */
  counterLabel: string;
  /** 展开 / 折叠头部的 aria-label 模板，支持 {title} 占位符 */
  toggleLabel: string;
  /** 各状态的读屏文本 */
  statusPending: string;
  statusInProgress: string;
  statusCompleted: string;
  statusCancelled: string;
}

export interface XProLocale extends AntLocale {
  MessageScroller?: MessageScrollerLocale;
  TodoList?: TodoListLocale;
}
