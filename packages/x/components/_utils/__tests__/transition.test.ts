import { describe, expect, it, vi } from "vitest";

import initCollapseTransition from "../transition";

type HookFn = (el: Element, done?: () => void) => void;

describe("initCollapseTransition", () => {
  it("should return TransitionProps with default prefix", () => {
    const transition = initCollapseTransition();
    expect(transition.onBeforeEnter).toBeTypeOf("function");
    expect(transition.onEnter).toBeTypeOf("function");
    expect(transition.onAfterEnter).toBeTypeOf("function");
    expect(transition.onBeforeLeave).toBeTypeOf("function");
    expect(transition.onLeave).toBeTypeOf("function");
    expect(transition.onAfterLeave).toBeTypeOf("function");
  });

  describe("enter", () => {
    it("onBeforeEnter should set collapsed height and add legacy class", () => {
      const transition = initCollapseTransition();
      const el = document.createElement("div");
      (transition.onBeforeEnter as HookFn)(el);
      expect(el.style.height).toBe("0px");
      expect(el.style.opacity).toBe("0");
      expect(el.classList.contains("ant-motion-collapse-legacy")).toBe(true);
    });

    it("onEnter should set real height and add active class", () => {
      const transition = initCollapseTransition();
      const el = document.createElement("div");
      Object.defineProperty(el, "scrollHeight", { value: 120 });
      const done = vi.fn();
      (transition.onEnter as HookFn)(el, done);
      expect(el.style.height).toBe("120px");
      expect(el.style.opacity).toBe("1");
      expect(el.classList.contains("ant-motion-collapse-legacy-active")).toBe(
        true,
      );
    });

    it("onAfterEnter should clear styles and classes", () => {
      const transition = initCollapseTransition();
      const el = document.createElement("div");
      el.style.height = "120px";
      el.style.opacity = "1";
      el.classList.add("ant-motion-collapse-legacy");
      el.classList.add("ant-motion-collapse-legacy-active");
      (transition.onAfterEnter as HookFn)(el);
      expect(el.style.height).toBe("");
      expect(el.style.opacity).toBe("");
      expect(el.classList.contains("ant-motion-collapse-legacy")).toBe(false);
      expect(el.classList.contains("ant-motion-collapse-legacy-active")).toBe(
        false,
      );
    });
  });

  describe("leave", () => {
    it("onBeforeLeave should set current height and add motion class", () => {
      const transition = initCollapseTransition();
      const el = document.createElement("div");
      Object.defineProperty(el, "offsetHeight", { value: 80 });
      (transition.onBeforeLeave as HookFn)(el);
      expect(el.style.height).toBe("80px");
      expect(el.style.opacity).toBe("1");
      expect(el.classList.contains("ant-motion-collapse")).toBe(true);
    });

    it("onLeave should collapse to zero height", () => {
      const transition = initCollapseTransition();
      const el = document.createElement("div");
      const done = vi.fn();
      (transition.onLeave as HookFn)(el, done);
      expect(el.style.height).toBe("0px");
      expect(el.style.opacity).toBe("0");
    });

    it("onAfterLeave should clear styles and classes", () => {
      const transition = initCollapseTransition();
      const el = document.createElement("div");
      el.style.height = "0px";
      el.style.opacity = "0";
      el.classList.add("ant-motion-collapse");
      (transition.onAfterLeave as HookFn)(el);
      expect(el.style.height).toBe("");
      expect(el.style.opacity).toBe("");
      expect(el.classList.contains("ant-motion-collapse")).toBe(false);
    });
  });

  describe("custom prefix", () => {
    it("should use custom prefix for class names", () => {
      const transition = initCollapseTransition("custom");
      const el = document.createElement("div");
      (transition.onBeforeEnter as HookFn)(el);
      expect(el.classList.contains("custom-motion-collapse-legacy")).toBe(true);
    });
  });

  describe("done callback and deadline", () => {
    it("should call done via transitionend event", () => {
      const transition = initCollapseTransition();
      const el = document.createElement("div");
      const done = vi.fn();
      (transition.onEnter as HookFn)(el, done);

      const event = new Event("transitionend") as any;
      Object.defineProperty(event, "target", { value: el });
      Object.defineProperty(event, "propertyName", { value: "height" });
      el.dispatchEvent(event);

      expect(done).toHaveBeenCalledTimes(1);
    });

    it("should not call done for non-height transitionend", () => {
      const transition = initCollapseTransition();
      const el = document.createElement("div");
      const done = vi.fn();
      (transition.onEnter as HookFn)(el, done);

      const event = new Event("transitionend") as any;
      Object.defineProperty(event, "target", { value: el });
      Object.defineProperty(event, "propertyName", { value: "opacity" });
      el.dispatchEvent(event);

      expect(done).not.toHaveBeenCalled();
    });

    it("should call done via deadline timeout", () => {
      vi.useFakeTimers();
      const transition = initCollapseTransition("ant", {
        motionDeadline: 200,
      });
      const el = document.createElement("div");
      const done = vi.fn();
      (transition.onEnter as HookFn)(el, done);

      vi.advanceTimersByTime(200);
      expect(done).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it("should not double-call done", () => {
      vi.useFakeTimers();
      const transition = initCollapseTransition("ant", {
        motionDeadline: 200,
      });
      const el = document.createElement("div");
      const done = vi.fn();
      (transition.onEnter as HookFn)(el, done);

      // Trigger transitionend first
      const event = new Event("transitionend") as any;
      Object.defineProperty(event, "target", { value: el });
      Object.defineProperty(event, "propertyName", { value: "height" });
      el.dispatchEvent(event);
      expect(done).toHaveBeenCalledTimes(1);

      // Deadline fires later, should not call again
      vi.advanceTimersByTime(200);
      expect(done).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });
});
