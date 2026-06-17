import type { CSSProperties, HTMLAttributes, VNodeChild } from "vue";

export type CodeHighlighterSemanticType =
  | "root"
  | "header"
  | "headerTitle"
  | "code"
  | "content";

export interface CodeHighlighterRef {
  nativeElement: HTMLDivElement;
}

export interface CodeHighlighterHeaderSlotScope {
  /**
   * 当前代码语言
   */
  language: string;
  /**
   * 当前主题模式
   */
  theme: "light" | "dark";
  /**
   * 是否处于"已复制"状态
   */
  copied: boolean;
  /**
   * 复制代码内容
   */
  copy: () => void;
  /**
   * 切换主题模式
   */
  toggleTheme: () => void;
}

export interface CodeHighlighterSlots {
  /**
   * 自定义头部区，作用域参数提供语言、主题及复制/主题切换能力
   */
  header?: (scope: CodeHighlighterHeaderSlotScope) => VNodeChild;
}

export interface CodeHighlighterProps extends Omit<
  HTMLAttributes,
  "content" | "onCopy"
> {
  prefixCls?: string;
  /**
   * 代码内容
   */
  content: string;
  /**
   * 语言类型
   */
  language?: string;
  /**
   * 是否显示行号
   */
  showLineNumbers?: boolean;
  /**
   * 是否显示语言标识
   */
  showLanguage?: boolean;
  /**
   * 是否显示主题切换按钮
   */
  showThemeToggle?: boolean;
  /**
   * 是否显示复制按钮
   */
  showCopyButton?: boolean;
  /**
   * 主题模式
   */
  theme?: "light" | "dark";
  /**
   * 起始行号
   */
  startLineNumber?: number;
  /**
   * 自定义样式
   */
  styles?: Partial<Record<CodeHighlighterSemanticType, CSSProperties>>;
  /**
   * 自定义类名
   */
  classes?: Partial<Record<CodeHighlighterSemanticType, string>>;
  /**
   * 复制成功回调
   */
  onCopy?: (content: string) => void;
}
