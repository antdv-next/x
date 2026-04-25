import type { Component, HTMLAttributes } from "vue";

import type { Catalog, XCardCommand, XCardNode } from "./runtime/types";

export interface ActionPayload {
  name: string;
  surfaceId: string;
  context: Record<string, any>;
  actionConfig?: any;
}

export interface XCardBoxProps extends Omit<HTMLAttributes, "onAction"> {
  commands?: XCardCommand[];
  components?: Record<string, Component>;
  onAction?: (payload: ActionPayload) => void;
}

export interface XCardCardProps extends HTMLAttributes {
  id: string;
}

export interface NodeRendererProps {
  node: XCardNode;
  dataModel: Record<string, any>;
  components: Record<string, Component>;
  onAction?: (
    name: string,
    context: Record<string, any>,
    actionConfig?: any,
  ) => void;
  onDataChange?: (path: string, value: any) => void;
  commandVersion?: "v0.8" | "v0.9";
  catalog?: Catalog;
}
