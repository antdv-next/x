import type { ConfigProviderProps } from "antdv-next";
import type { ComputedRef, CSSProperties, StyleValue } from "vue";

import { computed, inject } from "vue";

import type { ActionsProps } from "../actions";
import type { AttachmentsProps } from "../attachments";
import type { BubbleProps } from "../bubble";
import type { CodeHighlighterProps } from "../code-highlighter";
import type { ConversationsProps } from "../conversations";
import type { FileCardProps } from "../file-card";
import type { FolderProps } from "../folder";
import type { MermaidProps } from "../mermaid";
import type { PromptsProps } from "../prompts";
import type { SenderProps } from "../sender";
import type { SourcesProps } from "../sources";
import type { SuggestionProps } from "../suggestion";
import type { DesignTokenProviderProps } from "../theme/context";
import type { ThinkProps } from "../think";
import type { ThoughtChainProps } from "../thought-chain";
import type { WelcomeProps } from "../welcome";

export interface BaseComponentConfig {
  style?: StyleValue;
  styles?: Record<string, CSSProperties>;
  classes?: Record<string, string>;
}

export interface XComponentConfig extends BaseComponentConfig {
  shortcutKeys?: Record<string, any>;
}

export interface XComponentsConfig {
  attachments?: Pick<AttachmentsProps, "style" | "styles" | "classes">;
  bubble?: Pick<BubbleProps, "style" | "styles" | "classes">;
  conversations?: Pick<
    ConversationsProps,
    "style" | "styles" | "classes" | "shortcutKeys"
  >;
  actions?: Pick<ActionsProps, "style" | "styles" | "classes">;
  sources?: Pick<SourcesProps, "style" | "styles" | "classes">;
  fileCard?: Pick<FileCardProps, "style" | "styles" | "classes">;
  codeHighlighter?: Pick<CodeHighlighterProps, "style" | "styles" | "classes">;
  folder?: Pick<FolderProps, "style" | "styles" | "classes">;
  mermaid?: Pick<MermaidProps, "style" | "styles" | "classes">;
  prompts?: Pick<PromptsProps, "style" | "styles" | "classes">;
  sender?: Pick<SenderProps, "style" | "styles" | "classNames"> & {
    classes?: SenderProps["classNames"];
  };
  suggestion?: Pick<SuggestionProps, "style" | "styles" | "classes">;
  think?: Pick<ThinkProps, "style" | "styles" | "classes">;
  thoughtChain?: Pick<ThoughtChainProps, "style" | "styles" | "classes">;
  welcome?: Pick<WelcomeProps, "style" | "styles" | "classes">;
}

export interface XProviderProps
  extends XComponentsConfig, Omit<ConfigProviderProps, "theme"> {
  theme?: ConfigProviderProps["theme"] & {
    components?: DesignTokenProviderProps["components"];
    override?: DesignTokenProviderProps["override"];
  };
}

export const XProviderContextKey: symbol = Symbol(
  "antdv-next-x-provider-context",
);

export function useXProviderContextData() {
  return inject<ComputedRef<XComponentsConfig>>(
    XProviderContextKey,
    computed(() => ({})),
  );
}
