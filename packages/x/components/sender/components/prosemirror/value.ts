import { toRaw } from "vue";

const VALUE_COMPARE_LIMIT = 2048;

const asRaw = <T>(value: T): T =>
  (value && typeof value === "object" ? toRaw(value as object) : value) as T;

export function isSafelyCloneableValue(
  value: unknown,
  seen = new WeakSet<object>(),
): boolean {
  if (value === null || typeof value !== "object") {
    return typeof value !== "function" && typeof value !== "symbol";
  }

  const rawValue = asRaw(value as object) as any;
  if (seen.has(rawValue)) return true;
  seen.add(rawValue);
  if (
    rawValue.__v_isVNode ||
    (typeof Node !== "undefined" && rawValue instanceof Node) ||
    rawValue instanceof Promise ||
    rawValue instanceof WeakMap ||
    rawValue instanceof WeakSet ||
    (typeof SharedArrayBuffer !== "undefined" &&
      rawValue instanceof SharedArrayBuffer)
  ) {
    return false;
  }
  if (
    rawValue instanceof Date ||
    rawValue instanceof RegExp ||
    rawValue instanceof ArrayBuffer
  ) {
    return true;
  }
  if (ArrayBuffer.isView(rawValue)) {
    return isSafelyCloneableValue(rawValue.buffer, seen);
  }
  if (rawValue instanceof Map) {
    return Array.from(rawValue).every(
      ([key, entryValue]) =>
        isSafelyCloneableValue(key, seen) &&
        isSafelyCloneableValue(entryValue, seen),
    );
  }
  if (rawValue instanceof Set) {
    return Array.from(rawValue).every(entryValue =>
      isSafelyCloneableValue(entryValue, seen),
    );
  }

  const prototype = Object.getPrototypeOf(rawValue);
  if (
    !Array.isArray(rawValue) &&
    prototype !== Object.prototype &&
    prototype !== null
  ) {
    return false;
  }
  return Reflect.ownKeys(rawValue).every(key => {
    if (typeof key === "symbol") return false;
    const descriptor = Object.getOwnPropertyDescriptor(rawValue, key);
    return (
      !!descriptor &&
      "value" in descriptor &&
      isSafelyCloneableValue(descriptor.value, seen)
    );
  });
}

export function snapshotValue<T>(value: T): T {
  const rawValue = asRaw(value);
  if (!isSafelyCloneableValue(rawValue)) return rawValue;

  const clones = new WeakMap<object, any>();
  const clone = (input: any): any => {
    if (input === null || typeof input !== "object") return input;
    const rawInput = asRaw(input as object) as any;
    const existing = clones.get(rawInput);
    if (existing) return existing;

    if (rawInput instanceof Date) {
      return new Date(rawInput.getTime());
    }
    if (rawInput instanceof RegExp) {
      const result = new RegExp(rawInput.source, rawInput.flags);
      result.lastIndex = rawInput.lastIndex;
      return result;
    }
    if (rawInput instanceof ArrayBuffer) {
      return rawInput.slice(0);
    }
    if (ArrayBuffer.isView(rawInput)) {
      return structuredClone(rawInput);
    }
    if (rawInput instanceof Map) {
      const result = new Map();
      clones.set(rawInput, result);
      rawInput.forEach((entryValue: any, key: any) => {
        result.set(clone(key), clone(entryValue));
      });
      return result;
    }
    if (rawInput instanceof Set) {
      const result = new Set();
      clones.set(rawInput, result);
      rawInput.forEach((entryValue: any) => {
        result.add(clone(entryValue));
      });
      return result;
    }

    const result: any = Array.isArray(rawInput)
      ? []
      : Object.create(Object.getPrototypeOf(rawInput));
    clones.set(rawInput, result);
    Reflect.ownKeys(rawInput).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(rawInput, key)!;
      Object.defineProperty(result, key, {
        ...descriptor,
        value: clone(descriptor.value),
      });
    });
    return result;
  };

  return clone(rawValue) as T;
}

export function isSameValue(left: unknown, right: unknown): boolean {
  const pending: Array<[unknown, unknown]> = [[left, right]];
  const leftMatches = new WeakMap<object, object>();
  const rightMatches = new WeakMap<object, object>();
  let comparedObjects = 0;

  const sameBytes = (leftBytes: Uint8Array, rightBytes: Uint8Array) =>
    leftBytes.byteLength === rightBytes.byteLength &&
    leftBytes.every((value, index) => value === rightBytes[index]);

  while (pending.length) {
    const [pendingLeft, pendingRight] = pending.pop()!;
    if (Object.is(pendingLeft, pendingRight)) continue;
    if (
      pendingLeft === null ||
      pendingRight === null ||
      typeof pendingLeft !== "object" ||
      typeof pendingRight !== "object"
    ) {
      return false;
    }

    const leftValue = asRaw(pendingLeft as object);
    const rightValue = asRaw(pendingRight as object);
    if (Object.is(leftValue, rightValue)) continue;
    if (++comparedObjects > VALUE_COMPARE_LIMIT) return false;

    const matchedRight = leftMatches.get(leftValue);
    if (matchedRight) {
      if (matchedRight !== rightValue) return false;
      continue;
    }
    const matchedLeft = rightMatches.get(rightValue);
    if (matchedLeft) {
      if (matchedLeft !== leftValue) return false;
      continue;
    }
    leftMatches.set(leftValue, rightValue);
    rightMatches.set(rightValue, leftValue);

    if (leftValue instanceof Date || rightValue instanceof Date) {
      if (
        !(leftValue instanceof Date) ||
        !(rightValue instanceof Date) ||
        !Object.is(leftValue.getTime(), rightValue.getTime())
      ) {
        return false;
      }
      continue;
    }
    if (leftValue instanceof RegExp || rightValue instanceof RegExp) {
      if (
        !(leftValue instanceof RegExp) ||
        !(rightValue instanceof RegExp) ||
        leftValue.source !== rightValue.source ||
        leftValue.flags !== rightValue.flags ||
        leftValue.lastIndex !== rightValue.lastIndex
      ) {
        return false;
      }
      continue;
    }
    if (leftValue instanceof ArrayBuffer || rightValue instanceof ArrayBuffer) {
      if (
        !(leftValue instanceof ArrayBuffer) ||
        !(rightValue instanceof ArrayBuffer) ||
        !sameBytes(new Uint8Array(leftValue), new Uint8Array(rightValue))
      ) {
        return false;
      }
      continue;
    }
    if (ArrayBuffer.isView(leftValue) || ArrayBuffer.isView(rightValue)) {
      if (
        !ArrayBuffer.isView(leftValue) ||
        !ArrayBuffer.isView(rightValue) ||
        leftValue.constructor !== rightValue.constructor ||
        !sameBytes(
          new Uint8Array(
            leftValue.buffer,
            leftValue.byteOffset,
            leftValue.byteLength,
          ),
          new Uint8Array(
            rightValue.buffer,
            rightValue.byteOffset,
            rightValue.byteLength,
          ),
        )
      ) {
        return false;
      }
      continue;
    }
    if (leftValue instanceof Map || rightValue instanceof Map) {
      if (
        !(leftValue instanceof Map) ||
        !(rightValue instanceof Map) ||
        leftValue.size !== rightValue.size
      ) {
        return false;
      }
      const leftEntries = Array.from(leftValue);
      const rightEntries = Array.from(rightValue);
      for (let index = 0; index < leftEntries.length; index += 1) {
        pending.push(
          [leftEntries[index]![0], rightEntries[index]![0]],
          [leftEntries[index]![1], rightEntries[index]![1]],
        );
      }
      continue;
    }
    if (leftValue instanceof Set || rightValue instanceof Set) {
      if (
        !(leftValue instanceof Set) ||
        !(rightValue instanceof Set) ||
        leftValue.size !== rightValue.size
      ) {
        return false;
      }
      const leftEntries = Array.from(leftValue);
      const rightEntries = Array.from(rightValue);
      for (let index = 0; index < leftEntries.length; index += 1) {
        pending.push([leftEntries[index], rightEntries[index]]);
      }
      continue;
    }

    const leftIsArray = Array.isArray(leftValue);
    if (leftIsArray !== Array.isArray(rightValue)) return false;
    const leftPrototype = Object.getPrototypeOf(leftValue);
    const rightPrototype = Object.getPrototypeOf(rightValue);
    if (
      leftPrototype !== rightPrototype ||
      (!leftIsArray &&
        leftPrototype !== Object.prototype &&
        leftPrototype !== null)
    ) {
      return false;
    }

    const leftKeys = Reflect.ownKeys(leftValue);
    const rightKeys = Reflect.ownKeys(rightValue);
    if (
      leftKeys.length !== rightKeys.length ||
      leftKeys.some(
        key => !Object.prototype.hasOwnProperty.call(rightValue, key),
      )
    ) {
      return false;
    }
    for (const key of leftKeys) {
      const leftDescriptor = Object.getOwnPropertyDescriptor(leftValue, key);
      const rightDescriptor = Object.getOwnPropertyDescriptor(rightValue, key);
      if (
        !leftDescriptor ||
        !rightDescriptor ||
        !("value" in leftDescriptor) ||
        !("value" in rightDescriptor)
      ) {
        return false;
      }
      pending.push([leftDescriptor.value, rightDescriptor.value]);
    }
  }

  return true;
}

export class HistoryValueStore {
  private nextId = 0;

  private readonly values = new Map<string, unknown>();

  add(value: unknown): string {
    const id = `value-${++this.nextId}`;
    this.values.set(id, snapshotValue(value));
    return id;
  }

  read<T = unknown>(id: string): T {
    return snapshotValue(this.values.get(id)) as T;
  }

  peek<T = unknown>(id: string): T {
    return this.values.get(id) as T;
  }

  isSame(id: string, value: unknown): boolean {
    return isSameValue(this.values.get(id), value);
  }
}
