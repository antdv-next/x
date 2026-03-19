import type { HTMLAttributes } from "vue";

export type CodeHighlighterSemanticType = "root" | "header" | "content";

export interface CodeHighlighterRef {
  nativeElement: HTMLDivElement;
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
  styles?: Partial<Record<CodeHighlighterSemanticType, Record<string, any>>>;
  /**
   * 自定义类名
   */
  classes?: Partial<Record<CodeHighlighterSemanticType, string>>;
  /**
   * 复制成功回调
   */
  onCopy?: (content: string) => void;
}
