import type {
  XCardComponent_v08,
  XCardComponent_v09,
  XCardNode,
} from "./types";

function isPathObject(val: any): val is { path: string } {
  return (
    val !== null && typeof val === "object" && typeof val.path === "string"
  );
}

function isLiteralStringValue(val: any): val is { literalString: string } {
  return (
    val !== null &&
    typeof val === "object" &&
    typeof val.literalString === "string"
  );
}

function isExplicitList(val: any): val is { explicitList: string[] } {
  return (
    val !== null && typeof val === "object" && Array.isArray(val.explicitList)
  );
}

function parseV08Node(comp: XCardComponent_v08): XCardNode {
  const [type, config] = Object.entries(comp.component)[0] || ["", {}];
  if (!type) return { type: "", props: {} };

  const props: Record<string, any> = {};
  for (const [key, val] of Object.entries(config)) {
    if (["child", "children"].includes(key)) continue;

    if (isPathObject(val)) {
      props[key] = val.path;
    } else if (isLiteralStringValue(val)) {
      props[key] = val.literalString;
    } else {
      props[key] = val;
    }
  }

  let childIds: string[] = [];
  if (config.children) {
    if (isExplicitList(config.children)) {
      childIds = config.children.explicitList;
    } else if (Array.isArray(config.children)) {
      childIds = config.children;
    }
  } else if (config.child) {
    childIds = [config.child];
  }

  return {
    type,
    props,
    ...(childIds.length > 0 && { children: childIds }),
  };
}

function parseV09Node(comp: XCardComponent_v09): XCardNode {
  const props: Record<string, any> = {};

  for (const [key, val] of Object.entries(comp)) {
    if (["id", "component", "child", "children"].includes(key)) continue;
    props[key] = val;
  }

  const childIds = comp.children ?? (comp.child ? [comp.child] : []);

  return {
    type: comp.component,
    props,
    ...(childIds.length > 0 && { children: childIds }),
  };
}

export interface ComponentTransformer {
  transform(
    components: XCardComponent_v08[] | XCardComponent_v09[],
    version?: "v0.8" | "v0.9",
  ): XCardNode | null;
  getById(id: string): XCardNode | undefined;
  reset(): void;
}

export function createComponentTransformer(): ComponentTransformer {
  const componentMap = new Map<string, XCardNode>();

  function transform(
    components: XCardComponent_v08[] | XCardComponent_v09[],
    version: "v0.8" | "v0.9" = "v0.9",
  ): XCardNode | null {
    if (!Array.isArray(components) || components.length === 0) {
      return componentMap.get("root") ?? null;
    }

    if (version === "v0.8") {
      for (const comp of components as XCardComponent_v08[]) {
        componentMap.set(comp.id, parseV08Node(comp));
      }
    } else {
      for (const comp of components as XCardComponent_v09[]) {
        componentMap.set(comp.id, parseV09Node(comp));
      }
    }

    return componentMap.get("root") ?? null;
  }

  function getById(id: string): XCardNode | undefined {
    return componentMap.get(id);
  }

  function reset() {
    componentMap.clear();
  }

  return {
    transform,
    getById,
    reset,
  };
}
