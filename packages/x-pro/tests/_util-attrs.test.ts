import { describe, expect, it } from "vitest";

import {
  omitClassAndStyle,
  resolveAttrClass,
  resolveAttrStyle,
} from "../src/_util/attrs";

describe("attrs helpers", () => {
  describe("omitClassAndStyle", () => {
    it("drops class and style, keeping everything else", () => {
      expect(
        omitClassAndStyle({ class: "a", style: { color: "red" }, id: "x" }),
      ).toEqual({ id: "x" });
    });

    it("leaves an attribute object without class or style intact", () => {
      expect(omitClassAndStyle({ id: "x" })).toEqual({ id: "x" });
    });
  });

  describe("resolveAttrClass", () => {
    it("passes a string through", () => {
      expect(resolveAttrClass("a b")).toBe("a b");
    });

    it("passes an array through", () => {
      expect(resolveAttrClass(["a", "b"])).toEqual(["a", "b"]);
    });

    it("passes an object map through", () => {
      expect(resolveAttrClass({ a: true, b: false })).toEqual({
        a: true,
        b: false,
      });
    });

    it("drops anything else", () => {
      expect(resolveAttrClass(undefined)).toBeUndefined();
      expect(resolveAttrClass(null)).toBeUndefined();
      expect(resolveAttrClass(1)).toBeUndefined();
      expect(resolveAttrClass(true)).toBeUndefined();
    });
  });

  describe("resolveAttrStyle", () => {
    it("passes a string through", () => {
      expect(resolveAttrStyle("color: red")).toBe("color: red");
    });

    it("passes an object through", () => {
      expect(resolveAttrStyle({ color: "red" })).toEqual({ color: "red" });
    });

    it("drops anything else", () => {
      expect(resolveAttrStyle(undefined)).toBeUndefined();
      expect(resolveAttrStyle(null)).toBeUndefined();
      expect(resolveAttrStyle(1)).toBeUndefined();
    });
  });
});
