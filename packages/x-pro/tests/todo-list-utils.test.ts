import { describe, expect, it } from "vitest";

import type { TodoItem } from "../src/todo-list/types";

import {
  areAllTerminal,
  clampProgress,
  collectExpandableIds,
  countCompleted,
  deriveOverallStatus,
  flattenItems,
  isTerminalStatus,
  resolveOverallProgress,
  resolveTodoStatus,
} from "../src/todo-list/utils";

function todo(
  id: string,
  status?: TodoItem["status"],
  progress?: number,
): TodoItem {
  return { id, title: id, status, progress };
}

describe("todo-list utils", () => {
  describe("resolveTodoStatus", () => {
    it("defaults a missing status to pending", () => {
      expect(resolveTodoStatus(todo("a"))).toBe("pending");
    });

    it("keeps an explicit status", () => {
      expect(resolveTodoStatus(todo("a", "cancelled"))).toBe("cancelled");
    });
  });

  describe("isTerminalStatus", () => {
    it("treats completed and cancelled as terminal", () => {
      expect(isTerminalStatus("completed")).toBe(true);
      expect(isTerminalStatus("cancelled")).toBe(true);
    });

    it("treats pending and in-progress as non-terminal", () => {
      expect(isTerminalStatus("pending")).toBe(false);
      expect(isTerminalStatus("in-progress")).toBe(false);
    });
  });

  describe("countCompleted", () => {
    it("counts only completed items, not cancelled ones", () => {
      expect(
        countCompleted([
          todo("a", "completed"),
          todo("b", "cancelled"),
          todo("c", "in-progress"),
          todo("d"),
        ]),
      ).toBe(1);
    });

    it("is zero for an empty list", () => {
      expect(countCompleted([])).toBe(0);
    });
  });

  describe("areAllTerminal", () => {
    it("is true when every item is completed or cancelled", () => {
      expect(
        areAllTerminal([todo("a", "completed"), todo("b", "cancelled")]),
      ).toBe(true);
    });

    it("is false while any item still needs work", () => {
      expect(
        areAllTerminal([todo("a", "completed"), todo("b", "in-progress")]),
      ).toBe(false);
    });

    /**
     * 空列表不是「全部完成」：没有任务可做时不该触发自动折叠。
     */
    it("is false for an empty list", () => {
      expect(areAllTerminal([])).toBe(false);
    });
  });

  describe("deriveOverallStatus", () => {
    it("prefers in-progress over any other state", () => {
      expect(
        deriveOverallStatus([
          todo("a", "completed"),
          todo("b", "in-progress"),
          todo("c", "cancelled"),
        ]),
      ).toBe("in-progress");
    });

    it("reports completed when all terminal items succeeded", () => {
      expect(
        deriveOverallStatus([todo("a", "completed"), todo("b", "completed")]),
      ).toBe("completed");
    });

    it("reports cancelled when every terminal item was cancelled", () => {
      expect(
        deriveOverallStatus([todo("a", "cancelled"), todo("b", "cancelled")]),
      ).toBe("cancelled");
    });

    it("reports pending while work remains and nothing is running", () => {
      expect(
        deriveOverallStatus([todo("a", "completed"), todo("b", "pending")]),
      ).toBe("pending");
    });

    it("reports pending for an empty list", () => {
      expect(deriveOverallStatus([])).toBe("pending");
    });
  });

  describe("resolveOverallProgress", () => {
    it("is the completed share of the total", () => {
      expect(
        resolveOverallProgress([
          todo("a", "completed"),
          todo("b", "completed"),
          todo("c", "pending"),
          todo("d", "cancelled"),
        ]),
      ).toBe(50);
    });

    it("is zero for an empty list", () => {
      expect(resolveOverallProgress([])).toBe(0);
    });
  });

  describe("clampProgress", () => {
    it("passes through an in-range value", () => {
      expect(clampProgress(42)).toBe(42);
    });

    it("clamps out-of-range values", () => {
      expect(clampProgress(-10)).toBe(0);
      expect(clampProgress(180)).toBe(100);
    });

    it("degrades a missing or NaN value to zero", () => {
      expect(clampProgress(undefined)).toBe(0);
      expect(clampProgress(Number.NaN)).toBe(0);
    });
  });

  describe("flattenItems", () => {
    it("returns a flat copy for a flat list", () => {
      const list = [todo("a"), todo("b")];
      expect(flattenItems(list)).toEqual(list);
      expect(flattenItems(list)).not.toBe(list);
    });

    it("includes parents and children in depth-first order", () => {
      const list: TodoItem[] = [
        {
          ...todo("a"),
          children: [todo("a-1"), { ...todo("a-2"), children: [todo("a-2-1")] }],
        },
        todo("b"),
      ];
      expect(flattenItems(list).map(item => item.id)).toEqual([
        "a",
        "a-1",
        "a-2",
        "a-2-1",
        "b",
      ]);
    });

    it("ignores a non-array children value", () => {
      const list = [{ ...todo("a"), children: "oops" }] as unknown as TodoItem[];
      expect(flattenItems(list).map(item => item.id)).toEqual(["a"]);
    });
  });

  describe("collectExpandableIds", () => {
    const tree: TodoItem[] = [
      { ...todo("a"), children: [todo("a-1")] },
      todo("plain"),
      { ...todo("c"), children: [todo("c-1")], expandable: false },
    ];
    const noExtra = () => false;

    it("collects ids of rows that have children", () => {
      expect(collectExpandableIds(tree, noExtra)).toEqual(["a"]);
    });

    it("includes nested rows that have their own children", () => {
      const nested: TodoItem[] = [
        { ...todo("a"), children: [{ ...todo("a-1"), children: [todo("a-1-1")] }] },
      ];
      expect(collectExpandableIds(nested, noExtra)).toEqual(["a", "a-1"]);
    });

    it("includes a leaf only when its extra slot has real content", () => {
      // plain 是叶子：只有插槽对它返回内容时才算可展开。
      const withPlainExtra = (item: TodoItem) => item.id === "plain";
      expect(collectExpandableIds(tree, withPlainExtra)).toEqual(["a", "plain"]);
    });

    it("honours an explicit expandable: false", () => {
      expect(collectExpandableIds(tree, () => true)).not.toContain("c");
    });
  });
});
