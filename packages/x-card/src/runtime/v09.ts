import {
  getValueByPath,
  isPathObject,
  isPathValue,
  setValueByPath,
} from "./utils";

export function resolvePropsV09(
  props: Record<string, any>,
  dataModel: Record<string, any>,
): Record<string, any> {
  const resolved: Record<string, any> = {};

  for (const [key, val] of Object.entries(props)) {
    if (key === "action") {
      resolved[key] = resolveActionPropV09(val, dataModel);
    } else {
      resolved[key] = resolveValueV09(val, dataModel);
    }
  }

  return resolved;
}

function resolveActionPropV09(
  action: any,
  dataModel: Record<string, any>,
): any {
  if (!action || typeof action !== "object") return action;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(action)) {
    if (key === "event") {
      result[key] = resolveActionEventV09(value, dataModel);
    } else {
      result[key] = resolveValueV09(value, dataModel);
    }
  }

  return result;
}

function resolveActionEventV09(
  event: any,
  dataModel: Record<string, any>,
): any {
  if (!event || typeof event !== "object") return event;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(event)) {
    if (key === "context") {
      result[key] = value;
    } else {
      result[key] = resolveValueV09(value, dataModel);
    }
  }

  return result;
}

function resolveValueV09(val: any, dataModel: Record<string, any>): any {
  if (isPathObject(val)) {
    return getValueByPath(dataModel, val.path);
  }

  if (isPathValue(val)) {
    return getValueByPath(dataModel, val);
  }

  if (Array.isArray(val)) {
    return val.map(item => resolveValueV09(item, dataModel));
  }

  if (val && typeof val === "object") {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      result[k] = resolveValueV09(v, dataModel);
    }
    return result;
  }

  return val;
}

export function extractDataUpdatesV09(
  action: any,
  componentContext: Record<string, any>,
): Array<{ path: string; value: any }> {
  const context = action?.event?.context;
  if (!context || typeof context !== "object" || Array.isArray(context)) {
    return [];
  }

  const updates: Array<{ path: string; value: any }> = [];

  for (const [key, val] of Object.entries(context)) {
    if (isPathObject(val)) {
      const componentValue = componentContext[key];
      if (componentValue !== undefined) {
        updates.push({ path: val.path, value: componentValue });
      }
    }
  }

  return updates;
}

export function applyDataModelUpdateV09(
  prevDataModel: Record<string, any>,
  path: string,
  value: any,
): Record<string, any> {
  return setValueByPath(prevDataModel, path, value);
}
