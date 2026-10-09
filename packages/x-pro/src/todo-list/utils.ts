import type { TodoItem, TodoItemStatus } from "./types";

/** 头部标题缺省值，未提供 `title` 且 locale 未覆盖时使用。 */
export const DEFAULT_TITLE = "To-dos";
/** 任务列表最大高度缺省值，单位 px。 */
export const DEFAULT_MAX_HEIGHT = 248;

/**
 * 归一化任务状态：缺省补为 `pending`。
 */
export function resolveTodoStatus(item: TodoItem): TodoItemStatus {
  return item.status ?? "pending";
}

/**
 * 终态判定：`completed` 与 `cancelled` 都不再需要执行。
 *
 * 自动折叠依赖的是「无事可做」，因此取消与完成同等对待；完成计数则只认 `completed`。
 */
export function isTerminalStatus(status: TodoItemStatus) {
  return status === "completed" || status === "cancelled";
}

/** 已完成任务数。 */
export function countCompleted(items: TodoItem[]) {
  return items.reduce(
    (total, item) => total + (resolveTodoStatus(item) === "completed" ? 1 : 0),
    0,
  );
}

/**
 * 是否所有任务都已进入终态。
 *
 * 空列表不算「全部完成」：没有任务可做时不应该触发自动折叠。
 */
export function areAllTerminal(items: TodoItem[]) {
  return (
    items.length > 0 &&
    items.every(item => isTerminalStatus(resolveTodoStatus(item)))
  );
}

/**
 * 由列表派生整体状态，供头部图标使用。
 *
 * 优先级：任一在跑 → `in-progress`；全部终态 → 有完成取 `completed`，否则 `cancelled`；
 * 其余 → `pending`。
 */
export function deriveOverallStatus(items: TodoItem[]): TodoItemStatus {
  if (items.some(item => resolveTodoStatus(item) === "in-progress")) {
    return "in-progress";
  }

  if (areAllTerminal(items)) {
    return countCompleted(items) > 0 ? "completed" : "cancelled";
  }

  return "pending";
}

/** 整体进度，取值 0–100，供头部图标的进度弧使用。 */
export function resolveOverallProgress(items: TodoItem[]) {
  if (!items.length) {
    return 0;
  }

  return (countCompleted(items) / items.length) * 100;
}

/** 把任意进度夹到 0–100，非法值退化为 0。 */
export function clampProgress(progress: number | undefined) {
  if (typeof progress !== "number" || Number.isNaN(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
}
