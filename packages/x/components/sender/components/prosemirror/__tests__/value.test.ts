import { describe, expect, it } from "vitest";

import {
  HistoryValueStore,
  isSafelyCloneableValue,
  isSameValue,
  snapshotValue,
} from "../value";

// Mirrors the complex-value matrix previously exercised only via
// full Sender mount (index.test.tsx ~4189). Unit-testing here is cheaper
// and isolates prosemirror/value regressions from editor DOM/history.
describe("prosemirror/value", () => {
  describe("isSafelyCloneableValue", () => {
    it("allows primitives and plain objects", () => {
      expect(isSafelyCloneableValue("a")).toBe(true);
      expect(isSafelyCloneableValue(1)).toBe(true);
      expect(isSafelyCloneableValue(null)).toBe(true);
      expect(isSafelyCloneableValue({ a: 1 })).toBe(true);
      expect(isSafelyCloneableValue([1, 2])).toBe(true);
    });

    it("allows Date/RegExp/ArrayBuffer and views", () => {
      expect(isSafelyCloneableValue(new Date())).toBe(true);
      expect(isSafelyCloneableValue(/a/g)).toBe(true);
      expect(isSafelyCloneableValue(new ArrayBuffer(8))).toBe(true);
      expect(isSafelyCloneableValue(new Uint8Array([1, 2]))).toBe(true);
      expect(isSafelyCloneableValue(new DataView(new ArrayBuffer(8)))).toBe(
        true,
      );
    });

    it("allows Map/Set with cloneable entries", () => {
      expect(isSafelyCloneableValue(new Map([["k", 1]]))).toBe(true);
      expect(isSafelyCloneableValue(new Set([1, 2]))).toBe(true);
    });

    it("rejects class instances, WeakMap/WeakSet/Promise/Node/symbol/function", () => {
      class Foo {}
      expect(isSafelyCloneableValue(new Foo())).toBe(false);
      expect(isSafelyCloneableValue(new WeakMap())).toBe(false);
      expect(isSafelyCloneableValue(new WeakSet())).toBe(false);
      expect(isSafelyCloneableValue(Promise.resolve(1))).toBe(false);
      expect(isSafelyCloneableValue(Symbol("s"))).toBe(false);
      expect(isSafelyCloneableValue(() => {})).toBe(false);
    });

    it("handles cyclic structures", () => {
      const a: any = {};
      a.self = a;
      expect(isSafelyCloneableValue(a)).toBe(true);
      const m = new Map<string, any>();
      m.set("self", m);
      expect(isSafelyCloneableValue(m)).toBe(true);
    });
  });

  describe("snapshotValue", () => {
    it("deep clones and isolates mutations", () => {
      const src = { a: { b: 1 }, m: new Map([["k", 1]]), d: new Date(0) };
      const copy = snapshotValue(src);
      expect(copy).toEqual(src);
      expect(copy).not.toBe(src);
      expect(copy.a).not.toBe(src.a);
      (copy.a as any).b = 2;
      expect(src.a.b).toBe(1);
      copy.m.set("k", 2);
      expect(src.m.get("k")).toBe(1);
    });

    it("preserves RegExp lastIndex and DataView offsets", () => {
      const re = /a/g;
      re.lastIndex = 2;
      const re2 = snapshotValue(re);
      expect(re2.lastIndex).toBe(2);
      const buf = new Uint8Array([1, 2, 3]).buffer;
      const view = new DataView(buf, 1, 1);
      const view2 = snapshotValue(view);
      expect(view2.byteOffset).toBe(1);
    });

    it("retains opaque values by identity when not cloneable", () => {
      class Foo {
        x = 1;
      }
      const foo = new Foo();
      expect(snapshotValue(foo)).toBe(foo);
    });
  });

  describe("isSameValue", () => {
    it("compares Date by time (NaN-aware)", () => {
      expect(isSameValue(new Date(0), new Date(0))).toBe(true);
      expect(isSameValue(new Date(0), new Date(1))).toBe(false);
      expect(isSameValue(new Date(NaN), new Date(NaN))).toBe(true);
    });

    it("compares RegExp source/flags/lastIndex", () => {
      const a = /a/g;
      a.lastIndex = 1;
      const b = /a/g;
      b.lastIndex = 1;
      const c = /a/g;
      c.lastIndex = 2;
      expect(isSameValue(a, b)).toBe(true);
      expect(isSameValue(a, c)).toBe(false);
      expect(isSameValue(/a/g, /a/i)).toBe(false);
    });

    it("compares Map/Set by ordered entries", () => {
      expect(isSameValue(new Map([["k", 1]]), new Map([["k", 1]]))).toBe(true);
      expect(isSameValue(new Map([["k", 1]]), new Map([["k", 2]]))).toBe(false);
      expect(isSameValue(new Set([1, 2]), new Set([1, 2]))).toBe(true);
      expect(isSameValue(new Set([1, 2]), new Set([2, 1]))).toBe(false);
    });

    it("compares TypedArray/DataView by bytes and offsets", () => {
      // Same bytes at different offsets should compare equal when byte content matches.
      const sameBuf = new Uint8Array([7, 7]).buffer;
      expect(
        isSameValue(
          new Uint8Array(sameBuf, 0, 1),
          new Uint8Array(sameBuf, 0, 1),
        ),
      ).toBe(true);
      expect(
        isSameValue(
          new Uint8Array(sameBuf, 0, 1),
          new Uint8Array(sameBuf, 1, 1),
        ),
      ).toBe(true);
      // Different byte content at different offsets should be different.
      const diffBuf = new Uint8Array([1, 2]).buffer;
      expect(
        isSameValue(
          new Uint8Array(diffBuf, 0, 1),
          new Uint8Array(diffBuf, 1, 1),
        ),
      ).toBe(false);
      const dvBuf = new Uint8Array([9, 9]).buffer;
      expect(
        isSameValue(new DataView(dvBuf, 0, 1), new DataView(dvBuf, 0, 1)),
      ).toBe(true);
      const dvDiffBuf = new Uint8Array([9, 8]).buffer;
      expect(
        isSameValue(
          new DataView(dvDiffBuf, 0, 1),
          new DataView(dvDiffBuf, 1, 1),
        ),
      ).toBe(false);
    });

    it("distinguishes shared-reference topology vs value equality", () => {
      const shared = { value: 1 };
      const withShared = { first: shared, second: shared };
      const withoutShared = { first: { value: 1 }, second: { value: 1 } };
      expect(isSameValue(withShared, withShared)).toBe(true);
      expect(isSameValue(withShared, withoutShared)).toBe(false);
    });

    it("distinguishes sparse holes from undefined", () => {
      const sparse: unknown[] = [];
      sparse.length = 1;
      expect(isSameValue(sparse, [undefined])).toBe(false);
      expect(isSameValue(sparse, sparse)).toBe(true);
    });

    it("treats symbol-keyed props and differing key sets as different", () => {
      const sym = Symbol("s");
      expect(isSameValue({ [sym]: 1 } as any, { [sym]: 1 } as any)).toBe(true);
      expect(isSameValue({ a: 1 } as any, { a: 1, b: 2 } as any)).toBe(false);
    });

    it("bails out after compare limit", () => {
      // Build a deep chain exceeding VALUE_COMPARE_LIMIT (2048) via nested objects.
      let left: any = { v: 0 };
      let right: any = { v: 0 };
      for (let i = 0; i < 2100; i += 1) {
        left = { next: left };
        right = { next: right };
      }
      expect(isSameValue(left, right)).toBe(false);
    });
  });

  describe("HistoryValueStore", () => {
    it("snapshots on add and isolates reads", () => {
      const store = new HistoryValueStore();
      const obj = { a: 1, m: new Map([["k", 1]]) };
      const id = store.add(obj);
      obj.a = 2;
      (obj.m as Map<string, number>).set("k", 2);
      expect(store.read<{ a: number }>(id).a).toBe(1);
      expect(store.peek<{ m: Map<string, number> }>(id).m.get("k")).toBe(1);
      expect(store.isSame(id, { a: 1, m: new Map([["k", 1]]) })).toBe(true);
      expect(store.isSame(id, { a: 2, m: new Map([["k", 2]]) })).toBe(false);
    });

    it("preserves lastIndex across store round-trip", () => {
      const store = new HistoryValueStore();
      const re = /a/g;
      re.lastIndex = 2;
      const id = store.add(re);
      expect((store.read<RegExp>(id) as RegExp).lastIndex).toBe(2);
    });
  });
});
