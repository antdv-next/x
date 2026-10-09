import { describe, expect, it } from "vitest";

import type { TodoItem } from "../src/todo-list/types";

import {
  areAllTerminal,
  clampProgress,
  countCompleted,
  deriveOverallStatus,
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
});
