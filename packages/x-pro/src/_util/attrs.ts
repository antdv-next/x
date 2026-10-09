import type { StyleValue } from "vue";

/**
 * 属性透传时保留 `class` 与 `style`，其余属性交给根元素。
 *
 * 组件把 `class` / `style` 合进自己的根节点，因此不能让它们再随 `$attrs` 落一次。
 */
export function omitClassAndStyle(attrs: Record<string, unknown>) {
  const nextAttrs = { ...attrs };
  delete nextAttrs.class;
  delete nextAttrs.style;
  return nextAttrs;
}

export function resolveAttrClass(
  value: unknown,
): string | string[] | Record<string, boolean> | undefined {
  if (typeof value === "string" || Array.isArray(value)) {
    return value as string | string[];
  }

  return value && typeof value === "object"
    ? (value as Record<string, boolean>)
    : undefined;
}

export function resolveAttrStyle(value: unknown): StyleValue {
  if (typeof value === "string") {
    return value;
  }

  return value && typeof value === "object" ? (value as StyleValue) : undefined;
}
