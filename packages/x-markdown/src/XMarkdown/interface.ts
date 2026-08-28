import type { TokenizerAndRendererExtension } from "marked";
import type { Component } from "vue";

export enum StreamCacheTokenType {
  Text = "text",
  Link = "link",
  Image = "image",
  Html = "html",
  Emphasis = "emphasis",
  List = "list",
  Table = "table",
  InlineCode = "inline-code",
}

export interface FenceState {
  /** Inside an open fence, considering completed lines only */
  inFenced: boolean;
  fenceChar: string;
  fenceLen: number;
  /** Leading `` ` ``/`~` run of the current (possibly incomplete) line */
  lineFenceChar: string;
  lineFenceLen: number;
  lineFenceRunEnded: boolean;
  /** Whether every char after the leading run is whitespace (closing fences allow only whitespace) */
  lineTailBlank: boolean;
}

export interface StreamCache {
  pending: string;
  token: StreamCacheTokenType;
  processedLength: number;
  completeMarkdown: string;
  fence: FenceState;
}

export interface StreamingOption {
  hasNextChunk: boolean;
  enableAnimation?: boolean;
  animationConfig?: {
    fadeDuration?: number;
    easing?: string;
  };
  tail?: boolean | { content?: string; component?: Component };
  incompleteMarkdownComponentMap?: Partial<
    Record<StreamCacheTokenType, string>
  >;
}

export interface XMarkdownProps {
  content?: string;
  components?: Record<string, Component>;
  /**
   * 按标签名向 `components` 中的自定义组件传递额外的 props，使组件引用保持稳定，避免内联函数导致的重复挂载
   * Extra props passed to custom components in `components` by tag name, keeping component references stable and avoiding remounts caused by inline functions
   */
  componentsProps?: Record<string, Record<string, unknown>>;
  streaming?: StreamingOption;
  config?: MarkedConfig;
  debug?: boolean;
  protectCustomTagNewlines?: boolean;
  escapeRawHtml?: boolean;
  className?: string;
  style?: Record<string, string>;
  openLinksInNewTab?: boolean;
  paragraphTag?: string;
}

export interface MarkedConfig {
  breaks?: boolean;
  gfm?: boolean;
  extensions?: TokenizerAndRendererExtension[] | null;
}

export interface ComponentProps {
  domNode?: HTMLElement;
  streamStatus?: "loading" | "done";
  lang?: string;
  block?: boolean;
  [key: string]: unknown;
}

export interface AnimationTextProps {
  text: string;
  fadeDuration?: number;
  easing?: string;
}

export interface DebugPanelProps {
  className?: string;
}

export interface TailIndicatorProps {
  content?: string;
}

export interface ParserOptions {
  openLinksInNewTab?: boolean;
  paragraphTag?: string;
  injectTail?: boolean;
  protectCustomTags?: boolean;
  escapeRawHtml?: boolean;
  config?: MarkedConfig;
  components?: Record<string, Component>;
  streamStatus?: "loading" | "done";
  codeBlockStatus?: Record<string, "loading" | "done">;
}

export interface RendererOptions {
  components?: Record<string, Component>;
  componentsProps?: Record<string, Record<string, unknown>>;
  enableAnimation?: boolean;
  animationConfig?: {
    fadeDuration?: number;
    easing?: string;
  };
}
