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

/**
 * 深度优先展平任务树，供递归计数使用。
 *
 * 父节点本身也计入——它既有自己的状态，也带一组子任务；子节点永远是独立的一条。
 * 防御性处理 `children` 的非数组取值，避免宿主数据不规范时抛错。
 */
export function flattenItems(items: TodoItem[]): TodoItem[] {
  const result: TodoItem[] = [];
  const visited = new WeakSet<TodoItem>();

  function visit(list: TodoItem[]) {
    for (const item of list) {
      if (visited.has(item)) {
        continue;
      }
      visited.add(item);
      result.push(item);
      if (Array.isArray(item.children) && item.children.length) {
        visit(item.children);
      }
    }
  }

  visit(items);
  return result;
}

/**
 * 收集所有可展开的节点 id，供实例方法 `expandAll` 使用。
 *
 * `hasExtra` 按行判断——纯叶子即便传了 `itemExtra` 插槽，只要插槽对该行
 * 没有返回实质内容，就不算可展开，与渲染层的箭头判定保持一致。
 */
export function collectExpandableIds(
  items: TodoItem[],
  hasExtra: (item: TodoItem, index: number, depth: number) => boolean,
): string[] {
  const result: string[] = [];
  const visited = new WeakSet<TodoItem>();
  const ids = new Set<string>();
  visit(items, 0);

  function visit(list: TodoItem[], depth: number) {
    list.forEach((item, index) => {
      if (visited.has(item)) {
        return;
      }
      visited.add(item);
      const hasChildren =
        Array.isArray(item.children) && !!item.children.length;
      const hasItemExtra = hasExtra(item, index, depth);
      if (item.expandable !== false && (hasChildren || hasItemExtra)) {
        if (!ids.has(item.id)) {
          result.push(item.id);
          ids.add(item.id);
        }
        if (hasChildren && !hasItemExtra) {
          visit(item.children!, depth + 1);
        }
      }
    });
  }

  return result;
}
