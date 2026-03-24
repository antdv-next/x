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

export interface StreamCache {
  pending: string;
  token: StreamCacheTokenType;
  processedLength: number;
  completeMarkdown: string;
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
  enableAnimation?: boolean;
  animationConfig?: {
    fadeDuration?: number;
    easing?: string;
  };
}
