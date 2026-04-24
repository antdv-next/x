import type { Component, InjectionKey, Ref } from "vue";

import type { ActionPayload } from "./interface";
import type { Catalog, XCardCommand } from "./runtime/types";

export interface XCardContext {
  commandQueue: Ref<XCardCommand[]>;
  components: Ref<Record<string, Component>>;
  onAction?: (payload: ActionPayload) => void;
  catalogMap: Ref<Map<string, Catalog>>;
  surfaceCatalogMap: Ref<Map<string, string>>;
}

export const XCardContextKey: InjectionKey<XCardContext> =
  Symbol("XCardContext");
