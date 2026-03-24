import type { ConfigProviderProps } from "antdv-next";
import type { ComputedRef, CSSProperties, StyleValue } from "vue";

import { computed, inject } from "vue";

import type { ActionsProps } from "../actions";
import type { BubbleProps } from "../bubble";
import type { ConversationsProps } from "../conversations";
import type { FileCardProps } from "../file-card";
import type { SenderProps } from "../sender";
import type { SourcesProps } from "../sources";
import type { DesignTokenProviderProps } from "../theme/context";

export interface BaseComponentConfig {
  style?: StyleValue;
  styles?: Record<string, CSSProperties>;
  classes?: Record<string, string>;
}

export interface XComponentConfig extends BaseComponentConfig {
  shortcutKeys?: Record<string, any>;
}

export interface XComponentsConfig {
  bubble?: Pick<BubbleProps, "style" | "styles" | "classes">;
  conversations?: Pick<
    ConversationsProps,
    "style" | "styles" | "classes" | "shortcutKeys"
  >;
  actions?: Pick<ActionsProps, "style" | "styles" | "classes">;
  sources?: Pick<SourcesProps, "style" | "styles" | "classes">;
  fileCard?: Pick<FileCardProps, "style" | "styles" | "classes">;
  sender?: Pick<SenderProps, "style" | "styles" | "classNames">;
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
