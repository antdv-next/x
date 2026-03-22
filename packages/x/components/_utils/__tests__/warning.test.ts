import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import warning, { resetWarned } from "../warning";

describe("warning", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetWarned();
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("should not warn when valid is true", () => {
    warning(true, "Test", "should not appear");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("should warn when valid is false", () => {
    warning(false, "Test", "something went wrong");
    expect(warnSpy).toHaveBeenCalledWith("[antdx: Test] something went wrong");
  });

  it("should deduplicate warnings with same component and message", () => {
    warning(false, "Test", "duplicate message");
    warning(false, "Test", "duplicate message");
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("should warn separately for different messages", () => {
    warning(false, "Test", "message A");
    warning(false, "Test", "message B");
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it("should warn separately for different components", () => {
    warning(false, "ComponentA", "same message");
    warning(false, "ComponentB", "same message");
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it("should warn again after resetWarned", () => {
    warning(false, "Test", "will repeat");
    resetWarned();
    warning(false, "Test", "will repeat");
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});
