import { describe, expectTypeOf, it } from "vitest";

import type {
  AnyObject,
  CodeKeyType,
  DirectionType,
  PrefixKeysType,
  ShortcutKeys,
} from "../type";

describe("type", () => {
  it("AnyObject should accept any key-value pairs", () => {
    expectTypeOf<AnyObject>().toMatchTypeOf<Record<string, any>>();
  });

  it("DirectionType should be ltr, rtl, or undefined", () => {
    expectTypeOf<"ltr">().toMatchTypeOf<DirectionType>();
    expectTypeOf<"rtl">().toMatchTypeOf<DirectionType>();
    expectTypeOf<undefined>().toMatchTypeOf<DirectionType>();
  });

  it("PrefixKeysType should have Ctrl, Alt, Meta, Shift", () => {
    expectTypeOf<PrefixKeysType>().toHaveProperty("Ctrl");
    expectTypeOf<PrefixKeysType>().toHaveProperty("Alt");
    expectTypeOf<PrefixKeysType>().toHaveProperty("Meta");
    expectTypeOf<PrefixKeysType>().toHaveProperty("Shift");
  });

  it("CodeKeyType should accept number, 'number', or prefix key names", () => {
    expectTypeOf<42>().toMatchTypeOf<CodeKeyType>();
    expectTypeOf<"number">().toMatchTypeOf<CodeKeyType>();
    expectTypeOf<"Ctrl">().toMatchTypeOf<CodeKeyType>();
  });

  it("ShortcutKeys should accept 2 or 3 element tuples", () => {
    expectTypeOf<["Ctrl", 65]>().toMatchTypeOf<ShortcutKeys>();
    expectTypeOf<["Ctrl", "Shift", 65]>().toMatchTypeOf<ShortcutKeys>();
  });
});
