import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatMessageScrollerTemplate,
  prefersReducedMotion,
  resolveElementPreview,
  resolveItemId,
  resolveRailScale,
} from "../src/message-scroller/utils";

describe("message-scroller utils", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("resolveRailScale", () => {
    it("attenuates with distance and floors every further item", () => {
      expect(resolveRailScale(0)).toBe(1);
      expect(resolveRailScale(1)).toBe(0.68);
      expect(resolveRailScale(2)).toBe(0.44);
      expect(resolveRailScale(3)).toBe(0.25);
      expect(resolveRailScale(Number.POSITIVE_INFINITY)).toBe(0.25);
    });
  });

  describe("resolveItemId", () => {
    it("reads the attribute named by a simple attribute selector", () => {
      const element = document.createElement("div");
      element.setAttribute("data-message-id", "message-7");

      expect(resolveItemId(element, 0, "[data-message-id]")).toBe("message-7");
    });

    it("degrades to the node index without an attribute selector or attribute", () => {
      const element = document.createElement("div");

      expect(resolveItemId(element, 3, ".message")).toBe("3");
      expect(resolveItemId(element, 4, "[data-message-id]")).toBe("4");
    });
  });

  describe("resolveElementPreview", () => {
    it("returns nothing for an element without text", () => {
      const element = document.createElement("div");

      expect(resolveElementPreview(element)).toEqual({});

      element.textContent = "   \n\t ";
      expect(resolveElementPreview(element)).toEqual({});
    });

    it("returns nothing when the node does not expose text content", () => {
      const element = { textContent: null } as unknown as HTMLElement;

      expect(resolveElementPreview(element)).toEqual({});
    });

    it("uses the whole text as title when it fits the preview width", () => {
      const element = document.createElement("div");
      element.textContent = "A short message";

      expect(resolveElementPreview(element)).toEqual({
        title: "A short message",
      });
    });

    it("breaks the title on a word boundary near the cut", () => {
      const element = document.createElement("div");
      element.textContent = `${"a".repeat(50)} ${"b".repeat(20)}`;

      expect(resolveElementPreview(element)).toEqual({
        title: `${"a".repeat(50)}…`,
        description: "b".repeat(20),
      });
    });

    it("breaks the title at the limit when no late word boundary exists", () => {
      const element = document.createElement("div");
      element.textContent = `aaaaa ${"b".repeat(100)}`;

      expect(resolveElementPreview(element)).toEqual({
        title: `aaaaa ${"b".repeat(50)}…`,
        description: "b".repeat(50),
      });
    });

    it("truncates a long description on a word boundary", () => {
      const element = document.createElement("div");
      element.textContent = `aaaaa ${"b".repeat(50)}${"c".repeat(70)} ${"d".repeat(30)}`;

      expect(resolveElementPreview(element)).toEqual({
        title: `aaaaa ${"b".repeat(50)}…`,
        description: `${"c".repeat(70)}…`,
      });
    });

    it("truncates a long description at the limit when the boundary is too early", () => {
      const element = document.createElement("div");
      element.textContent = `aaaaa ${"b".repeat(50)}${"c".repeat(10)} ${"d".repeat(100)}`;

      expect(resolveElementPreview(element)).toEqual({
        title: `aaaaa ${"b".repeat(50)}…`,
        description: `${"c".repeat(10)} ${"d".repeat(77)}…`,
      });
    });
  });

  describe("prefersReducedMotion", () => {
    it("is false when the environment cannot answer the query", () => {
      // jsdom 默认没有 matchMedia。
      expect(prefersReducedMotion()).toBe(false);
    });

    it("reflects the reduce-motion media query", () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      expect(prefersReducedMotion()).toBe(true);

      vi.stubGlobal("matchMedia", () => ({ matches: false }));
      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe("formatMessageScrollerTemplate", () => {
    it("replaces known placeholders and keeps unknown ones", () => {
      expect(
        formatMessageScrollerTemplate("Go to message {index} of {total}", {
          index: 2,
          total: 5,
        }),
      ).toBe("Go to message 2 of 5");

      expect(
        formatMessageScrollerTemplate("Go to message {index} of {total}", {
          index: 0,
        }),
      ).toBe("Go to message 0 of {total}");
    });
  });
});
