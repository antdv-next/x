import {
  getValueByPath,
  isPathObject,
  isPathValue,
  setValueByPath,
} from "./utils";

function isLiteralStringObject(val: any): val is { literalString: string } {
  return (
    val !== null &&
    typeof val === "object" &&
    typeof val.literalString === "string"
  );
}

export function resolvePropsV08(
  props: Record<string, any>,
  dataModel: Record<string, any>,
): Record<string, any> {
  const resolved: Record<string, any> = {};

  for (const [key, val] of Object.entries(props)) {
    resolved[key] = resolveValueV08(val, dataModel);
  }

  return resolved;
}

function resolveValueV08(
  val: any,
  dataModel: Record<string, any>,
  isActionContext = false,
): any {
  if (isLiteralStringObject(val)) {
    return val.literalString;
  }

  if (isPathObject(val)) {
    if (isActionContext) {
      return val;
    }
    return getValueByPath(dataModel, val.path);
  }

  if (isPathValue(val)) {
    return getValueByPath(dataModel, val);
  }

  if (Array.isArray(val)) {
    return val.map(item => resolveValueV08(item, dataModel));
  }

  if (val && typeof val === "object") {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (k === "value" && "key" in val) {
        result[k] = resolveValueV08(v, dataModel, true);
      } else {
        result[k] = resolveValueV08(v, dataModel, false);
      }
    }
    return result;
  }

  return val;
}

export function extractDataUpdatesV08(
  action: any,
  componentContext: Record<string, any>,
): Array<{ path: string; value: any }> {
  const context = action?.context;
  if (!Array.isArray(context)) {
    return [];
  }

  const updates: Array<{ path: string; value: any }> = [];

  for (const item of context) {
    if (item && typeof item === "object" && "key" in item && "value" in item) {
      const pathObj = item.value;
      if (isPathObject(pathObj)) {
        const componentValue = componentContext[item.key];
        if (componentValue !== undefined) {
          updates.push({ path: pathObj.path, value: componentValue });
        }
      }
    }
  }

  return updates;
}

export function applyDataModelUpdateV08(
  prevDataModel: Record<string, any>,
  contents: Array<{
    key: string;
    valueString?: string;
    valueMap?: Array<{ key: string; valueString: string }>;
  }>,
): Record<string, any> {
  const next = { ...prevDataModel };

  for (const item of contents) {
    if ("valueString" in item && item.valueString !== undefined) {
      next[item.key] = item.valueString;
    } else if (Array.isArray(item.valueMap)) {
      const valueObj: Record<string, any> = {};
      for (const { key, valueString } of item.valueMap) {
        valueObj[key] = valueString;
      }
      next[item.key] = valueObj;
    }
  }

  return next;
}

export { getValueByPath, isPathObject, isPathValue, setValueByPath };
