import { classNames } from "@v-c/util";
import { Dropdown, Input } from "antdv-next";
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  ref,
  render,
  toRaw,
  watch,
} from "vue";

import type { InsertPosition, SkillType, SlotConfigType } from "../interface";

import warning from "../../_utils/warning";
import { useSenderContext } from "../context";
import Skill from "./Skill";

type SlotFocusOptions = {
  preventScroll?: boolean;
  cursor?: "start" | "end" | "all" | "slot";
  key?: string;
};

export interface SlotTextAreaRef {
  nativeElement: HTMLDivElement | null;
  focus: (options?: SlotFocusOptions) => void;
  blur: () => void;
  insert: (
    slotConfig: SlotConfigType[],
    position?: InsertPosition,
    replaceCharacters?: string,
    preventScroll?: boolean,
  ) => void;
  clear: () => void;
  getValue: () => {
    value: string;
    slotConfig: SlotConfigType[];
    skill?: SkillType;
  };
}

type NodeInfo = {
  slotKey?: string;
  skillKey?: string;
  nodeType?: string;
  slotConfig?: any;
};

const SUPPORTED_INPUT_TYPES = new Set(["input", "select", "custom", "content"]);

function stringifyValue(value: any) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return `${value}`;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

const isNativeFormControl = (
  target: EventTarget | null,
): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement;

function getDefaultSlotValue(config: SlotConfigType) {
  const key = (config as any).key as string | undefined;
  if (!key) return undefined;

  const props = (config as any).props ?? {};
  if (SUPPORTED_INPUT_TYPES.has(config.type)) {
    return props.defaultValue ?? "";
  }

  return props.value ?? props.label ?? "";
}

type EquivalenceState = {
  leftToRight: Map<object, object>;
  rightToLeft: Map<object, object>;
};

const cloneEquivalenceState = (state: EquivalenceState): EquivalenceState => ({
  leftToRight: new Map(state.leftToRight),
  rightToLeft: new Map(state.rightToLeft),
});

const adoptEquivalenceState = (
  target: EquivalenceState,
  source: EquivalenceState,
) => {
  target.leftToRight = source.leftToRight;
  target.rightToLeft = source.rightToLeft;
};

function isEquivalentValue(
  left: unknown,
  right: unknown,
  state: EquivalenceState = {
    leftToRight: new Map(),
    rightToLeft: new Map(),
  },
): boolean {
  const rawLeft =
    left && typeof left === "object" ? toRaw(left as object) : left;
  const rawRight =
    right && typeof right === "object" ? toRaw(right as object) : right;
  if (
    typeof rawLeft !== "object" ||
    rawLeft === null ||
    typeof rawRight !== "object" ||
    rawRight === null
  ) {
    return Object.is(rawLeft, rawRight);
  }

  const mappedRight = state.leftToRight.get(rawLeft);
  const mappedLeft = state.rightToLeft.get(rawRight);
  if (mappedRight || mappedLeft) {
    return mappedRight === rawRight && mappedLeft === rawLeft;
  }
  state.leftToRight.set(rawLeft, rawRight);
  state.rightToLeft.set(rawRight, rawLeft);
  if (rawLeft === rawRight) return true;

  // Functions and VNodes are runtime resources whose behavior is defined by
  // identity rather than by their enumerable properties.
  if ((rawLeft as any).__v_isVNode || (rawRight as any).__v_isVNode) {
    return false;
  }

  if (Array.isArray(rawLeft) || Array.isArray(rawRight)) {
    if (!(Array.isArray(rawLeft) && Array.isArray(rawRight))) return false;
    if (rawLeft.length !== rawRight.length) return false;
  }

  if (rawLeft instanceof Date || rawRight instanceof Date) {
    return (
      rawLeft instanceof Date &&
      rawRight instanceof Date &&
      Object.is(rawLeft.getTime(), rawRight.getTime())
    );
  }
  if (rawLeft instanceof RegExp || rawRight instanceof RegExp) {
    return (
      rawLeft instanceof RegExp &&
      rawRight instanceof RegExp &&
      rawLeft.source === rawRight.source &&
      rawLeft.flags === rawRight.flags &&
      rawLeft.lastIndex === rawRight.lastIndex
    );
  }
  if (rawLeft instanceof ArrayBuffer || rawRight instanceof ArrayBuffer) {
    if (!(rawLeft instanceof ArrayBuffer && rawRight instanceof ArrayBuffer)) {
      return false;
    }
    if (rawLeft.byteLength !== rawRight.byteLength) return false;
    const leftBytes = new Uint8Array(rawLeft);
    const rightBytes = new Uint8Array(rawRight);
    return leftBytes.every((value, index) => value === rightBytes[index]);
  }
  if (
    typeof SharedArrayBuffer !== "undefined" &&
    (rawLeft instanceof SharedArrayBuffer ||
      rawRight instanceof SharedArrayBuffer)
  ) {
    if (
      !(
        rawLeft instanceof SharedArrayBuffer &&
        rawRight instanceof SharedArrayBuffer
      ) ||
      rawLeft.byteLength !== rawRight.byteLength
    ) {
      return false;
    }
    const leftBytes = new Uint8Array(rawLeft);
    const rightBytes = new Uint8Array(rawRight);
    return leftBytes.every((value, index) => value === rightBytes[index]);
  }
  if (ArrayBuffer.isView(rawLeft) || ArrayBuffer.isView(rawRight)) {
    if (!(ArrayBuffer.isView(rawLeft) && ArrayBuffer.isView(rawRight))) {
      return false;
    }
    if (
      rawLeft.constructor !== rawRight.constructor ||
      rawLeft.byteOffset !== rawRight.byteOffset ||
      rawLeft.byteLength !== rawRight.byteLength
    ) {
      return false;
    }
    if (!isEquivalentValue(rawLeft.buffer, rawRight.buffer, state))
      return false;
    const leftBytes = new Uint8Array(
      rawLeft.buffer,
      rawLeft.byteOffset,
      rawLeft.byteLength,
    );
    const rightBytes = new Uint8Array(
      rawRight.buffer,
      rawRight.byteOffset,
      rawRight.byteLength,
    );
    return leftBytes.every((value, index) => value === rightBytes[index]);
  }
  if (rawLeft instanceof Map || rawRight instanceof Map) {
    if (!(rawLeft instanceof Map && rawRight instanceof Map)) return false;
    if (rawLeft.size !== rawRight.size) return false;
    const leftEntries = Array.from(rawLeft.entries());
    const rightEntries = Array.from(rawRight.entries());
    const matchEntry = (
      index: number,
      used: Set<number>,
      candidateState: EquivalenceState,
    ): EquivalenceState | null => {
      if (index === leftEntries.length) return candidateState;
      const [leftKey, leftValue] = leftEntries[index]!;
      for (let rightIndex = 0; rightIndex < rightEntries.length; rightIndex++) {
        if (used.has(rightIndex)) continue;
        const [rightKey, rightValue] = rightEntries[rightIndex]!;
        const nextState = cloneEquivalenceState(candidateState);
        if (
          !isEquivalentValue(leftKey, rightKey, nextState) ||
          !isEquivalentValue(leftValue, rightValue, nextState)
        ) {
          continue;
        }
        const result = matchEntry(
          index + 1,
          new Set([...used, rightIndex]),
          nextState,
        );
        if (result) return result;
      }
      return null;
    };
    const matchedState = matchEntry(0, new Set(), state);
    if (!matchedState) return false;
    adoptEquivalenceState(state, matchedState);
    return true;
  }
  if (rawLeft instanceof Set || rawRight instanceof Set) {
    if (!(rawLeft instanceof Set && rawRight instanceof Set)) return false;
    if (rawLeft.size !== rawRight.size) return false;
    const leftValues = Array.from(rawLeft.values());
    const rightValues = Array.from(rawRight.values());
    const matchValue = (
      index: number,
      used: Set<number>,
      candidateState: EquivalenceState,
    ): EquivalenceState | null => {
      if (index === leftValues.length) return candidateState;
      for (let rightIndex = 0; rightIndex < rightValues.length; rightIndex++) {
        if (used.has(rightIndex)) continue;
        const nextState = cloneEquivalenceState(candidateState);
        if (
          !isEquivalentValue(
            leftValues[index],
            rightValues[rightIndex],
            nextState,
          )
        ) {
          continue;
        }
        const result = matchValue(
          index + 1,
          new Set([...used, rightIndex]),
          nextState,
        );
        if (result) return result;
      }
      return null;
    };
    const matchedState = matchValue(0, new Set(), state);
    if (!matchedState) return false;
    adoptEquivalenceState(state, matchedState);
    return true;
  }

  const leftPrototype = Object.getPrototypeOf(rawLeft);
  const rightPrototype = Object.getPrototypeOf(rawRight);
  if (
    leftPrototype !== rightPrototype ||
    (!Array.isArray(rawLeft) &&
      leftPrototype !== Object.prototype &&
      leftPrototype !== null)
  ) {
    return false;
  }

  const leftKeys = Reflect.ownKeys(rawLeft);
  const rightKeys = Reflect.ownKeys(rawRight);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every(key => {
    if (!Object.prototype.hasOwnProperty.call(rawRight, key)) return false;
    const leftDescriptor = Object.getOwnPropertyDescriptor(rawLeft, key);
    const rightDescriptor = Object.getOwnPropertyDescriptor(rawRight, key);
    if (!leftDescriptor || !rightDescriptor) return false;
    if (
      leftDescriptor.enumerable !== rightDescriptor.enumerable ||
      leftDescriptor.configurable !== rightDescriptor.configurable
    ) {
      return false;
    }
    const leftIsData = "value" in leftDescriptor;
    const rightIsData = "value" in rightDescriptor;
    if (leftIsData !== rightIsData) return false;
    if (leftIsData && rightIsData) {
      return (
        leftDescriptor.writable === rightDescriptor.writable &&
        isEquivalentValue(leftDescriptor.value, rightDescriptor.value, state)
      );
    }
    return (
      leftDescriptor.get === rightDescriptor.get &&
      leftDescriptor.set === rightDescriptor.set
    );
  });
}

function cloneHistoryValue<T>(
  value: T,
  seen = new WeakMap<object, unknown>(),
): T {
  if (!value || (typeof value !== "object" && typeof value !== "function")) {
    return value;
  }
  if (typeof value === "function" || (value as any).__v_isVNode) return value;

  const rawValue = toRaw(value as object) as any;
  const cached = seen.get(rawValue);
  if (cached) return cached as T;

  if (rawValue instanceof Date) {
    const result = new Date(rawValue.getTime());
    seen.set(rawValue, result);
    return result as T;
  }
  if (rawValue instanceof RegExp) {
    const result = new RegExp(rawValue.source, rawValue.flags);
    result.lastIndex = rawValue.lastIndex;
    seen.set(rawValue, result);
    return result as T;
  }
  if (typeof Node !== "undefined" && rawValue instanceof Node) {
    // DOM nodes are opaque runtime resources. A clone would lose identity,
    // listeners, and other private state without producing a safe snapshot.
    return rawValue as T;
  }
  if (rawValue instanceof ArrayBuffer) {
    const result = rawValue.slice(0);
    seen.set(rawValue, result);
    return result as T;
  }
  if (
    typeof SharedArrayBuffer !== "undefined" &&
    rawValue instanceof SharedArrayBuffer
  ) {
    const result = rawValue.slice(0);
    seen.set(rawValue, result);
    return result as T;
  }
  if (ArrayBuffer.isView(rawValue)) {
    const buffer = cloneHistoryValue(rawValue.buffer, seen);
    const ViewConstructor = rawValue.constructor as new (
      buffer: ArrayBufferLike,
      byteOffset: number,
      length?: number,
    ) => ArrayBufferView;
    const result =
      rawValue instanceof DataView
        ? new DataView(buffer, rawValue.byteOffset, rawValue.byteLength)
        : new ViewConstructor(
            buffer,
            rawValue.byteOffset,
            (rawValue as any).length,
          );
    seen.set(rawValue, result);
    return result as T;
  }
  if (
    rawValue instanceof WeakMap ||
    rawValue instanceof WeakSet ||
    rawValue instanceof Promise
  ) {
    // These objects expose no cloneable state. Retaining identity is safer
    // than manufacturing an instance without the required internal slots.
    return rawValue as T;
  }

  if (rawValue instanceof Map) {
    const result = new Map();
    seen.set(rawValue, result);
    rawValue.forEach((entryValue: unknown, key: unknown) => {
      result.set(
        cloneHistoryValue(key, seen),
        cloneHistoryValue(entryValue, seen),
      );
    });
    return result as T;
  }
  if (rawValue instanceof Set) {
    const result = new Set();
    seen.set(rawValue, result);
    rawValue.forEach((entryValue: unknown) => {
      result.add(cloneHistoryValue(entryValue, seen));
    });
    return result as T;
  }

  const prototype = Object.getPrototypeOf(rawValue);
  if (
    !Array.isArray(rawValue) &&
    prototype !== Object.prototype &&
    prototype !== null
  ) {
    // Preserve opaque native and user-defined instances by identity. Their
    // internal mutable state belongs to the custom slot and cannot be
    // reconstructed safely by Sender history.
    return rawValue as T;
  }

  const result: any = Array.isArray(rawValue) ? [] : Object.create(prototype);
  seen.set(rawValue, result);
  Reflect.ownKeys(rawValue).forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(rawValue, key);
    if (!descriptor) return;
    if ("value" in descriptor) {
      descriptor.value = cloneHistoryValue(descriptor.value, seen);
    }
    try {
      Object.defineProperty(result, key, descriptor);
    } catch {
      result[key] = cloneHistoryValue(rawValue[key], seen);
    }
  });
  return result as T;
}

export default defineComponent({
  name: "SlotTextArea",
  setup(_, { expose }) {
    const senderCtx = useSenderContext();

    const editableRef = ref<HTMLDivElement>();
    const slotDomMap = ref<Map<string, HTMLSpanElement>>(new Map());
    const slotConfigMap = ref<Map<string, any>>(new Map());
    const slotValues = ref<Record<string, any>>({});
    const mountedDomSet = ref<Set<HTMLElement>>(new Set());
    const skillDomRef = ref<HTMLSpanElement | null>(null);
    const currentSkillRef = ref<SkillType | undefined>(undefined);
    const lastSlotConfigRef = ref<readonly SlotConfigType[] | undefined>(
      undefined,
    );
    const lastSkillRef = ref<SkillType | undefined>(undefined);
    const isComposing = ref(false);
    const keyLock = ref(false);

    // ==================== History: full snapshot stack + groups ====================
    // 全量快照栈：每次操作后提交统一 EditorDocument + cursor 快照，
    // Ctrl+Z 只是 index-- 并 restore(stack[index])，不额外 push，避免“越撤销越多”
    type OuterSelectionSnapshot = {
      startPath: number[];
      startOffset: number;
      endPath: number[];
      endOffset: number;
      collapsed: boolean;
    };
    type SlotControlSelectionSnapshot = {
      key: string;
      start: number;
      end: number;
      direction: "forward" | "backward" | "none";
    };
    type EditorSelectionSnapshot =
      | { kind: "outer"; value: OuterSelectionSnapshot }
      | { kind: "control"; value: SlotControlSelectionSnapshot }
      | null;
    type EditorNodeSnapshot =
      | { kind: "text"; value: string }
      | {
          kind: "element";
          tagName: string;
          attributes: [string, string][];
          children: EditorNodeSnapshot[];
        }
      | {
          kind: "slot";
          key: string;
          variant: "main" | "before" | "after";
        }
      | { kind: "skill" };
    type EditorDocumentSnapshot = {
      nodes: EditorNodeSnapshot[];
      slotConfigs: any[];
      slotValues: Record<string, any>;
      skill: any;
    };
    type HistorySnapshot = {
      document: EditorDocumentSnapshot;
      selection: EditorSelectionSnapshot;
      beforeSelection: EditorSelectionSnapshot;
      hasBeforeSelection: boolean;
      t: number;
      inputType: string;
    };
    let historyStack: HistorySnapshot[] = []; // 栈：0..index 为有效历史，存全量快照
    let historyIndex = -1; // 指针：当前快照在栈中的位置
    let isRestoringHistory = false;
    let isManagedHistoryActive = false;
    let pendingHistoryType: string | null = null; // beforeinput 标记，input 后推入
    let pendingBeforeSelection: EditorSelectionSnapshot | undefined;
    let hasPendingControlledSlotConfig = false;
    let pendingControlledSlotConfig: readonly SlotConfigType[] | undefined =
      undefined;
    let hasPendingControlledSkill = false;
    let pendingControlledSkill: SkillType | undefined = undefined;
    let historyInitVersion = 0;
    const MAX_HISTORY = 50;
    const GROUP_MS = 500;
    const getCleanedText = (ori: string) => ori.replace(/\u200B/g, "");

    const getNodePath = (node: Node, root: HTMLElement): number[] => {
      const path: number[] = [];
      let cur: Node | null = node;
      while (cur && cur !== root) {
        const parent = cur.parentNode;
        if (!parent) break;
        const idx = Array.prototype.indexOf.call(parent.childNodes, cur);
        path.unshift(idx);
        cur = parent as Node;
      }
      return path;
    };

    const getNodeByPath = (root: HTMLElement, path: number[]): Node | null => {
      let cur: Node = root;
      for (const idx of path) {
        if (!cur.childNodes[idx]) return null;
        cur = cur.childNodes[idx] as Node;
      }
      return cur;
    };

    const getClampedNodeByPath = (
      root: HTMLElement,
      path: number[],
    ): { node: Node; offsetInNode: boolean } | null => {
      let cur: Node = root;
      for (let i = 0; i < path.length; i++) {
        const idx = path[i]!;
        if (cur.childNodes.length === 0)
          return { node: cur, offsetInNode: true };
        if (!cur.childNodes[idx]) {
          const clampedIdx = Math.min(idx, cur.childNodes.length - 1);
          const clamped = cur.childNodes[clampedIdx] as Node;
          // clamp remaining depth step-by-step instead of drilling to deepest last child
          let deep: Node = clamped;
          for (let j = i + 1; j < path.length; j++) {
            if (deep.childNodes.length === 0) break;
            const jIdx = path[j]!;
            const clampedJ = Math.min(jIdx, deep.childNodes.length - 1);
            deep = deep.childNodes[clampedJ] as Node;
          }
          return { node: deep, offsetInNode: false };
        }
        cur = cur.childNodes[idx] as Node;
      }
      return { node: cur, offsetInNode: false };
    };

    const captureSelectionSnapshot = (): OuterSelectionSnapshot | null => {
      const sel = getSelection();
      const editable = editableRef.value;
      if (!sel || sel.rangeCount === 0 || !editable) return null;
      try {
        const range = sel.getRangeAt(0);
        if (
          !editable.contains(range.startContainer) ||
          !editable.contains(range.endContainer)
        )
          return null;
        return {
          startPath: getNodePath(range.startContainer, editable),
          startOffset: range.startOffset,
          endPath: getNodePath(range.endContainer, editable),
          endOffset: range.endOffset,
          collapsed: range.collapsed,
        };
      } catch {
        return null;
      }
    };

    const captureSlotControlSelection = (
      target: EventTarget | null,
      knownKey?: string,
    ): SlotControlSelectionSnapshot | null => {
      if (
        !(target instanceof HTMLInputElement) &&
        !(target instanceof HTMLTextAreaElement)
      ) {
        return null;
      }
      const key =
        knownKey ??
        target.closest<HTMLElement>("[data-slot-key]")?.dataset.slotKey;
      if (!key || slotConfigMap.value.get(key)?.type !== "input") return null;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      if (start === null || end === null) return null;
      return {
        key,
        start,
        end,
        direction: target.selectionDirection ?? "none",
      };
    };

    const captureEditorSelection = (
      target: EventTarget | null = document.activeElement,
      knownKey?: string,
    ): EditorSelectionSnapshot => {
      const controlSelection = captureSlotControlSelection(target, knownKey);
      if (controlSelection) {
        return { kind: "control", value: controlSelection };
      }

      const targetElement = target instanceof Element ? target : null;
      const targetSlotKey =
        targetElement?.closest<HTMLElement>("[data-slot-key]")?.dataset.slotKey;
      if (
        targetSlotKey &&
        slotConfigMap.value.get(targetSlotKey)?.type === "custom"
      ) {
        return null;
      }

      const editable = editableRef.value;
      if (
        targetElement &&
        editable &&
        targetElement !== editable &&
        !editable.contains(targetElement) &&
        targetElement !== document.body
      ) {
        return null;
      }

      const outerSelection = captureSelectionSnapshot();
      return outerSelection ? { kind: "outer", value: outerSelection } : null;
    };

    const isSameCollapsedSelection = (
      left: EditorSelectionSnapshot,
      right: EditorSelectionSnapshot,
    ) => {
      if (
        left?.kind !== "outer" ||
        right?.kind !== "outer" ||
        !left.value.collapsed ||
        !right.value.collapsed
      ) {
        return false;
      }
      const isSamePath = (a: number[], b: number[]) =>
        a.length === b.length && a.every((value, index) => value === b[index]);
      return (
        left.value.startOffset === right.value.startOffset &&
        left.value.endOffset === right.value.endOffset &&
        isSamePath(left.value.startPath, right.value.startPath) &&
        isSamePath(left.value.endPath, right.value.endPath)
      );
    };

    const restoreSelectionSnapshot = (cursor: OuterSelectionSnapshot) => {
      const editable = editableRef.value;
      if (!editable) return;
      const sel = getSelection();
      if (!sel) return;
      // Focusing after addRange can reset the freshly restored selection in
      // browsers (and does so in JSDOM). Focus first, then apply the snapshot.
      editable.focus();
      const tryDirect = (): boolean => {
        const startNode = getNodeByPath(editable, cursor.startPath);
        const endNode = getNodeByPath(editable, cursor.endPath);
        if (!startNode || !endNode) return false;
        try {
          const range = document.createRange();
          const clamp = (node: Node, offset: number) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const len = node.textContent?.length ?? 0;
              return Math.min(offset, len);
            }
            return Math.min(offset, node.childNodes.length);
          };
          range.setStart(startNode, clamp(startNode, cursor.startOffset));
          range.setEnd(endNode, clamp(endNode, cursor.endOffset));
          sel.removeAllRanges();
          sel.addRange(range);
          return true;
        } catch {
          return false;
        }
      };
      if (tryDirect()) return;
      // editable-level cursor must be restored at editable regardless of clamped node
      if (cursor.startPath.length === 0) {
        try {
          const off = Math.min(cursor.startOffset, editable.childNodes.length);
          const range = document.createRange();
          range.setStart(editable, off);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        } catch {}
      }
      // Fallback: clamp path to nearest valid node (survives rebuild where slot count changed)
      const startClamped = getClampedNodeByPath(editable, cursor.startPath);
      const endClamped = getClampedNodeByPath(editable, cursor.endPath);
      if (startClamped && endClamped) {
        try {
          const range = document.createRange();
          const clamp = (node: Node, offset: number) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const len = node.textContent?.length ?? 0;
              return Math.min(offset, len);
            }
            return Math.min(offset, node.childNodes.length);
          };
          const sNode = startClamped.node;
          const eNode = endClamped.node ?? sNode;
          const sOff =
            sNode.nodeType === Node.TEXT_NODE
              ? clamp(sNode, cursor.startOffset)
              : Math.min(cursor.startOffset, sNode.childNodes.length);
          const eOff =
            eNode.nodeType === Node.TEXT_NODE
              ? clamp(eNode, cursor.endOffset)
              : Math.min(cursor.endOffset, eNode.childNodes.length);
          range.setStart(sNode, sOff);
          if (!cursor.collapsed) range.setEnd(eNode, eOff);
          else range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        } catch {}
      }
      setEndCursor();
    };

    const captureEditorNode = (node: Node): EditorNodeSnapshot | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        return { kind: "text", value: node.textContent ?? "" };
      }
      if (!(node instanceof HTMLElement)) return null;

      const info = getNodeInfo(node);
      if (info?.skillKey) return { kind: "skill" };
      if (info?.slotKey) {
        let variant: "main" | "before" | "after" = "main";
        if (info.nodeType === "nbsp") {
          if (slotDomMap.value.get(`${info.slotKey}_before`) === node) {
            variant = "before";
          } else if (slotDomMap.value.get(`${info.slotKey}_after`) === node) {
            variant = "after";
          } else if (
            node.classList.contains(`${prefixCls.value}-slot-before`)
          ) {
            variant = "before";
          } else {
            variant = "after";
          }
        }
        return { kind: "slot", key: info.slotKey, variant };
      }

      return {
        kind: "element",
        tagName: node.tagName.toLowerCase(),
        attributes: Array.from(node.attributes).map(attribute => [
          attribute.name,
          attribute.value,
        ]),
        children: Array.from(node.childNodes)
          .map(captureEditorNode)
          .filter((child): child is EditorNodeSnapshot => !!child),
      };
    };

    const captureSnapshot = (
      inputType: string = "unknown",
    ): HistorySnapshot => {
      const nextSlotValues = { ...slotValues.value };
      slotConfigMap.value.forEach((config, key) => {
        if (config.type === "content") {
          const dom = slotDomMap.value.get(key);
          if (dom) nextSlotValues[key] = dom.innerText || "";
        }
      });
      slotValues.value = nextSlotValues;
      const editable = editableRef.value;
      const nodes = editable
        ? Array.from(editable.childNodes)
            .map(captureEditorNode)
            .filter((node): node is EditorNodeSnapshot => !!node)
        : [];
      const snapshotSlotKeys = new Set<string>();
      let hasSkillNode = false;
      const collectManagedNodes = (node: EditorNodeSnapshot) => {
        if (node.kind === "slot") {
          // Spacer nodes are part of a content slot's managed structure. Keep
          // their config even when a selection deleted only the main span.
          snapshotSlotKeys.add(node.key);
        } else if (node.kind === "skill") {
          hasSkillNode = true;
        } else if (node.kind === "element") {
          node.children.forEach(collectManagedNodes);
        }
      };
      nodes.forEach(collectManagedNodes);
      // Clone mutable config/value data while retaining function and VNode
      // identities required by customRender and formatResult.
      const rawConfigs = Array.from(slotConfigMap.value.entries())
        .filter(([key]) => snapshotSlotKeys.has(key))
        .map(([, config]) => config);
      const clonedConfigs = cloneHistoryValue(rawConfigs);
      const rawSkill: any = hasSkillNode
        ? (currentSkillRef.value as any)
        : undefined;
      const clonedSkill = rawSkill ? cloneHistoryValue(rawSkill) : undefined;
      return {
        document: {
          nodes,
          slotConfigs: clonedConfigs,
          slotValues: cloneHistoryValue(
            Object.fromEntries(
              Object.entries(slotValues.value).filter(([key]) =>
                snapshotSlotKeys.has(key),
              ),
            ),
          ),
          skill: clonedSkill,
        },
        selection: captureEditorSelection(),
        beforeSelection: null,
        hasBeforeSelection: false,
        t: Date.now(),
        inputType,
      };
    };

    // 推入全量快照（操作后调用），栈里全是完整状态，undo 只是指针--
    // beforeSelection 存操作前的选择，撤销时应回到 before 而非 after
    const pushHistory = (
      inputType: string = "unknown",
      forceNewGroup: boolean = false,
      selection?: EditorSelectionSnapshot,
    ) => {
      if (isRestoringHistory) return;
      const now = Date.now();
      const snap = captureSnapshot(inputType);
      if (selection !== undefined) snap.selection = selection;
      snap.beforeSelection = pendingBeforeSelection ?? null;
      snap.hasBeforeSelection = pendingBeforeSelection !== undefined;
      pendingBeforeSelection = undefined;
      const last = historyStack[historyIndex];
      // Deduplicate no-op input, including a cancelled IME composition.
      const isSameContent =
        !!last && isEquivalentValue(snap.document, last.document);
      const hasRedoBranch = historyIndex < historyStack.length - 1;
      // 分组：500ms 内连续 insertText 覆盖栈顶，不产生新条目，且保留组首的 beforeSelection
      const canGroup =
        !forceNewGroup &&
        !hasRedoBranch &&
        last &&
        last.inputType === "insertText" &&
        inputType === "insertText" &&
        isSameCollapsedSelection(last.selection, snap.beforeSelection) &&
        now - last.t < GROUP_MS;
      if (canGroup) {
        if (isSameContent) {
          last.selection = snap.selection;
          last.t = snap.t;
          pendingHistoryType = null;
          return;
        }
        // 保留组首的 beforeSelection（首次输入前），selection 保持为当前 after
        snap.beforeSelection = last.beforeSelection;
        snap.hasBeforeSelection = last.hasBeforeSelection;
        historyStack[historyIndex] = snap;
      } else {
        if (isSameContent) {
          pendingHistoryType = null;
          return;
        }
        // 丢弃 redo 分支，追加新快照
        historyStack = historyStack.slice(0, historyIndex + 1);
        historyStack.push(snap);
        historyIndex = historyStack.length - 1;
        if (historyStack.length > MAX_HISTORY) {
          historyStack.shift();
          historyIndex--;
        }
      }
      pendingHistoryType = null;
    };

    const restoreSnapshot = (
      snap: HistorySnapshot,
      overrideSelection?: EditorSelectionSnapshot,
    ) => {
      isRestoringHistory = true;
      const editable = editableRef.value;
      if (!editable) {
        isRestoringHistory = false;
        return;
      }
      // Clear current editor state
      unmountAllPortals();
      slotDomMap.value.clear();
      slotConfigMap.value.clear();
      // keep skillDom cleanup
      if (skillDomRef.value) {
        unmountDom(skillDomRef.value);
        skillDomRef.value.remove();
        skillDomRef.value = null;
      }
      currentSkillRef.value = undefined;
      editable.innerHTML = "";
      // Restored editor state must not share mutable objects with the retained
      // history entry, otherwise editing after undo would corrupt redo.
      const documentSnapshot = cloneHistoryValue(snap.document);
      // Restore slotValues and slotConfigMap from snapshot
      slotValues.value = { ...documentSnapshot.slotValues };
      documentSnapshot.slotConfigs.forEach(cfg => {
        if ((cfg as any).key) {
          slotConfigMap.value.set((cfg as any).key, cfg);
        }
      });
      // Restore skill if present
      if (documentSnapshot.skill) {
        currentSkillRef.value = documentSnapshot.skill as SkillType;
      }
      // Build managed nodes once, then place them according to the unified
      // document tree. This also supports slots nested in native paragraphs.
      const managedNodes = new Map<string, Node>();
      documentSnapshot.slotConfigs.forEach(config => {
        if (!config?.key) return;
        buildSlotNodes([config]);
        if (config.type === "content") {
          const before = slotDomMap.value.get(`${config.key}_before`);
          const main = slotDomMap.value.get(config.key);
          const after = slotDomMap.value.get(`${config.key}_after`);
          if (before) managedNodes.set(`${config.key}:before`, before);
          if (main) managedNodes.set(`${config.key}:main`, main);
          if (after) managedNodes.set(`${config.key}:after`, after);
        } else {
          const main = slotDomMap.value.get(config.key);
          if (main) managedNodes.set(`${config.key}:main`, main);
        }
      });
      const restoreEditorNode = (node: EditorNodeSnapshot): Node | null => {
        if (node.kind === "text") return document.createTextNode(node.value);
        if (node.kind === "skill") return null;
        if (node.kind === "slot") {
          return managedNodes.get(`${node.key}:${node.variant}`) ?? null;
        }
        const element = document.createElement(node.tagName);
        node.attributes.forEach(([name, value]) => {
          try {
            element.setAttribute(name, value);
          } catch {}
        });
        node.children.forEach(child => {
          const childNode = restoreEditorNode(child);
          if (childNode) element.appendChild(childNode);
        });
        return element;
      };
      documentSnapshot.nodes.forEach(node => {
        const restoredNode = restoreEditorNode(node);
        if (restoredNode) editable.appendChild(restoredNode);
      });
      // Skill is always rendered at the editor's leading boundary.
      renderSkill(documentSnapshot.skill as SkillType | undefined, true);
      // Need to sync slotValues for content slots that may have been updated via nodes
      // buildSlotNodes already set defaults, but ensure restored values are kept
      slotValues.value = { ...documentSnapshot.slotValues };
      // Re-apply content slot innerText from slotValues (buildSlotNodes for content uses slotValues)
      documentSnapshot.slotConfigs.forEach(cfg => {
        if (cfg.type === "content" && (cfg as any).key) {
          const dom = slotDomMap.value.get((cfg as any).key);
          if (dom) {
            dom.innerText = stringifyValue(slotValues.value[(cfg as any).key]);
          }
        }
      });
      triggerValueChange();
      // Outer and built-in-control selections are mutually exclusive, so each
      // history state restores exactly one managed selection.
      const selectionToRestore =
        overrideSelection === undefined ? snap.selection : overrideSelection;
      void nextTick(() => {
        if (selectionToRestore?.kind === "outer") {
          restoreSelectionSnapshot(selectionToRestore.value);
        } else if (selectionToRestore?.kind === "control") {
          const controlSelection = selectionToRestore.value;
          const slotDom = slotDomMap.value.get(controlSelection.key);
          const control = slotDom?.querySelector<
            HTMLInputElement | HTMLTextAreaElement
          >("input, textarea");
          if (control) {
            control.focus();
            control.setSelectionRange(
              Math.min(controlSelection.start, control.value.length),
              Math.min(controlSelection.end, control.value.length),
              controlSelection.direction,
            );
          }
        }
        isRestoringHistory = false;
        reconcilePendingControlledValues();
      });
    };

    // 全量快照：undo 直接指针--，撤销应回到当前操作的 beforeSelection。
    const handleUndo = (
      fallbackControlSelection: SlotControlSelectionSnapshot | null = null,
    ) => {
      if (historyIndex <= 0) return false;
      const cur = historyStack[historyIndex]!;
      historyIndex--;
      const prev = historyStack[historyIndex]!;
      const selectionBefore =
        cur.hasBeforeSelection ||
        cur.inputType !== "slotValue" ||
        !fallbackControlSelection
          ? cur.beforeSelection
          : { kind: "control" as const, value: fallbackControlSelection };
      restoreSnapshot(prev, selectionBefore);
      return true;
    };

    const handleRedo = () => {
      if (historyIndex >= historyStack.length - 1) return false;
      historyIndex++;
      const next = historyStack[historyIndex]!;
      restoreSnapshot(next, next.selection);
      return true;
    };

    const prefixCls = computed(
      () => senderCtx.value.prefixCls || "antd-sender",
    );

    const mergeInputStyle = computed(() => ({
      ...senderCtx.value.styles?.input,
      ...getAutoSizeStyle(),
    }));

    const getAutoSizeStyle = () => {
      const autoSize = senderCtx.value.autoSize;
      if (autoSize === true) {
        return { height: "auto" };
      }
      if (!autoSize || typeof autoSize !== "object") {
        return {};
      }

      const lineHeight = 22;
      return {
        minHeight: autoSize.minRows
          ? `${autoSize.minRows * lineHeight}px`
          : undefined,
        maxHeight: autoSize.maxRows
          ? `${autoSize.maxRows * lineHeight}px`
          : undefined,
        overflowY: "auto",
      } as const;
    };

    const getNodeInfo = (targetNode: HTMLElement): NodeInfo | null => {
      if (!targetNode?.dataset) return null;
      const slotKey = targetNode.dataset.slotKey;
      return {
        slotKey,
        skillKey: targetNode.dataset.skillKey,
        nodeType: targetNode.dataset.nodeType,
        slotConfig: slotKey ? slotConfigMap.value.get(slotKey) : undefined,
      } as NodeInfo;
    };

    const unmountDom = (container: HTMLElement | null | undefined) => {
      if (!container) return;
      render(null, container);
      mountedDomSet.value.delete(container);
    };

    const unmountAllPortals = () => {
      mountedDomSet.value.forEach(container => {
        render(null, container);
      });
      mountedDomSet.value.clear();
    };

    const buildSkillSpan = (key: string) => {
      const span = document.createElement("span");
      span.setAttribute("contenteditable", "false");
      span.dataset.skillKey = key;
      span.dataset.placeholder = senderCtx.value.placeholder || "";
      span.className = `${prefixCls.value}-skill`;
      return span;
    };

    const buildSlotSpan = (key: string) => {
      const span = document.createElement("span");
      span.setAttribute("contenteditable", "false");
      span.dataset.slotKey = key;
      span.className = `${prefixCls.value}-slot`;
      return span;
    };

    const buildEditSlotSpan = (config: SlotConfigType) => {
      const span = document.createElement("span");
      span.setAttribute(
        "contenteditable",
        senderCtx.value.readOnly || senderCtx.value.disabled ? "false" : "true",
      );
      span.dataset.slotKey = (config as any).key;
      span.className = `${prefixCls.value}-slot ${prefixCls.value}-slot-content`;
      return span;
    };

    const buildSpaceSpan = (slotKey: string, position: "before" | "after") => {
      const span = document.createElement("span");
      span.setAttribute("contenteditable", "false");
      span.dataset.slotKey = slotKey;
      span.dataset.nodeType = "nbsp";
      span.className = `${prefixCls.value}-slot-${position} ${prefixCls.value}-slot-no-width`;
      span.textContent = "\u00A0";
      return span;
    };

    const getNodeTextValue = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? "";
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return "";
      }

      const element = node as HTMLElement;
      const nodeInfo = getNodeInfo(element);

      if (!nodeInfo) {
        return element.innerText || element.textContent || "";
      }

      if (nodeInfo.skillKey) {
        return "";
      }

      if (nodeInfo.slotKey) {
        if (nodeInfo.nodeType === "nbsp") {
          return " ";
        }

        const config = nodeInfo.slotConfig;
        if (!config) {
          return element.innerText || "";
        }

        const rawValue =
          config.type === "content"
            ? element.innerText || ""
            : slotValues.value[nodeInfo.slotKey];
        const formatted = config.formatResult?.(rawValue);
        return formatted ?? stringifyValue(rawValue);
      }

      return element.innerText || element.textContent || "";
    };

    const getEditorValue: SlotTextAreaRef["getValue"] = () => {
      const editable = editableRef.value;
      const emptyResult = {
        value: "",
        slotConfig: [] as SlotConfigType[],
        skill: undefined,
      };
      if (!editable) return emptyResult;

      const childNodes = editable.childNodes;
      if (childNodes.length === 0) return emptyResult;

      const textList: string[] = [];
      const currentSlotConfig: SlotConfigType[] = [];
      let currentSkill: any;

      const appendText = (value: string) => {
        textList.push(value);
        if (value) currentSlotConfig.push({ type: "text", value });
      };
      const collectNodeValue = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          appendText(node.textContent ?? "");
          return;
        }
        if (!(node instanceof HTMLElement)) return;

        const info = getNodeInfo(node);
        if (info?.skillKey) {
          if (currentSkillRef.value) currentSkill = currentSkillRef.value;
          return;
        }
        if (info?.slotKey) {
          const textValue = getNodeTextValue(node);
          textList.push(textValue);
          if (info.nodeType !== "nbsp") {
            const config = slotConfigMap.value.get(info.slotKey);
            if (config) {
              currentSlotConfig.push({
                ...config,
                value: textValue,
              } as SlotConfigType);
            }
          }
          return;
        }

        if (!node.querySelector("[data-slot-key],[data-skill-key]")) {
          appendText(getNodeTextValue(node));
          return;
        }
        node.childNodes.forEach(collectNodeValue);
      };

      childNodes.forEach(collectNodeValue);

      return {
        value: textList.join(""),
        slotConfig: currentSlotConfig,
        skill: currentSkill as SkillType | undefined,
      };
    };

    const updateSubmitDisabled = () => {
      const value = getEditorValue();
      senderCtx.value.setSubmitDisabled?.(
        !value.value && value.slotConfig.length === 0 && !value.skill,
      );
    };

    const triggerValueChange = (event?: Event) => {
      const value = getEditorValue();
      senderCtx.value.onChange?.(
        value.value,
        event,
        value.slotConfig,
        value.skill,
      );
      updateSkillEmptyStatus(value);
      updateSubmitDisabled();
    };
    const updateSlot = (key: string, value: any, event?: Event) => {
      if (senderCtx.value.readOnly || senderCtx.value.disabled) return;
      const config = slotConfigMap.value.get(key);
      const eventTarget = event?.target ?? document.activeElement;
      const controlSelection = captureSlotControlSelection(eventTarget, key);
      const selectionAfter = controlSelection
        ? ({ kind: "control", value: controlSelection } as const)
        : captureEditorSelection(eventTarget, key);
      // Composition owns a single history entry from compositionstart to
      // compositionend. Recording each custom-slot update here would clear
      // that marker and make one IME commit require multiple undos.
      if (!isComposing.value && pendingBeforeSelection === undefined) {
        // A native input event has already advanced its caret by the time the
        // value callback runs. Only beforeinput can provide its true pre-edit
        // selection; synthetic input events fall back at undo time.
        if (!(config?.type === "input" && controlSelection)) {
          pendingBeforeSelection = captureEditorSelection(eventTarget, key);
        }
      }
      slotValues.value = {
        ...slotValues.value,
        [key]: value,
      };

      const dom = slotDomMap.value.get(key);
      if (config && dom && config.type !== "content") {
        renderSlot(config as any, dom);
      }

      triggerValueChange(event);
      if (!isComposing.value) {
        pushHistory("slotValue", true, selectionAfter);
      }
    };

    const buildSelectMenuItems = (options: string[] | undefined) => {
      return (options ?? []).map(option => ({ label: option, key: option }));
    };

    const renderSlot = (config: SlotConfigType, slotDom: HTMLSpanElement) => {
      if (!("key" in config) || !config.key) return;

      const slotValue = slotValues.value[config.key];
      let node: any = null;

      switch (config.type) {
        case "input": {
          node = (
            <Input
              class={`${prefixCls.value}-slot-input`}
              placeholder={config.props?.placeholder}
              value={slotValue ?? ""}
              size="small"
              variant="borderless"
              readonly={senderCtx.value.readOnly}
              disabled={senderCtx.value.disabled}
              onChange={(e: any) => {
                updateSlot(config.key as string, e?.target?.value ?? "", e);
              }}
            />
          );
          break;
        }
        case "select": {
          const displayValue = stringifyValue(slotValue);
          node = (
            <Dropdown
              disabled={senderCtx.value.readOnly || senderCtx.value.disabled}
              trigger={["click"]}
              menu={{
                items: buildSelectMenuItems(config.props?.options),
                selectable: true,
                selectedKeys: displayValue ? [displayValue] : [],
                onSelect: ({ key, domEvent }: any) => {
                  updateSlot(config.key as string, key, domEvent as Event);
                },
              }}
            >
              <span
                class={classNames([
                  `${prefixCls.value}-slot-select`,
                  {
                    placeholder: !displayValue,
                    [`${prefixCls.value}-slot-select-selector-value`]:
                      !!displayValue,
                  },
                ])}
              >
                <span
                  data-placeholder={config.props?.placeholder}
                  class={`${prefixCls.value}-slot-select-value`}
                >
                  {displayValue}
                </span>
                <span class={`${prefixCls.value}-slot-select-arrow`}>▼</span>
              </span>
            </Dropdown>
          );
          break;
        }
        case "tag": {
          node = (
            <span class={`${prefixCls.value}-slot-tag`}>
              {config.props?.label ?? config.props?.value ?? ""}
            </span>
          );
          break;
        }
        case "custom": {
          node = config.customRender?.(
            slotValue,
            (nextValue: any) => {
              updateSlot(config.key as string, nextValue);
            },
            {
              disabled: senderCtx.value.disabled,
              readOnly: senderCtx.value.readOnly,
            },
            config,
          );
          break;
        }
        case "content": {
          slotDom.innerText = stringifyValue(slotValue);
          slotDom.dataset.placeholder = config.props?.placeholder ?? "";
          return;
        }
        default:
          return;
      }

      if (!node) {
        return;
      }

      mountedDomSet.value.add(slotDom);
      render(node, slotDom);
    };

    const buildSlotNodes = (configs: readonly SlotConfigType[]) => {
      const list: Node[] = [];

      configs.forEach(config => {
        if (config.type === "text") {
          list.push(document.createTextNode(config.value || ""));
          return;
        }

        if (!("key" in config) || !config.key) {
          warning(false, "Sender", "Slot key is missing");
          return;
        }

        slotConfigMap.value.set(config.key, config);

        if (config.type === "content") {
          const before = buildSpaceSpan(config.key, "before");
          const slot = buildEditSlotSpan(config);
          const after = buildSpaceSpan(config.key, "after");

          slotValues.value[config.key] =
            slotValues.value[config.key] ?? getDefaultSlotValue(config);
          slot.innerText = stringifyValue(slotValues.value[config.key]);
          slot.dataset.placeholder = config.props?.placeholder ?? "";

          slotDomMap.value.set(`${config.key}_before`, before);
          slotDomMap.value.set(config.key, slot);
          slotDomMap.value.set(`${config.key}_after`, after);

          list.push(before, slot, after);
          return;
        }

        const slot = buildSlotSpan(config.key);
        slotValues.value[config.key] =
          slotValues.value[config.key] ?? getDefaultSlotValue(config);
        slotDomMap.value.set(config.key, slot);
        renderSlot(config, slot);
        list.push(slot);
      });

      return list;
    };

    const mergeSlotConfig = (configs: readonly SlotConfigType[]) => {
      const nextValues = { ...slotValues.value };
      configs.forEach(config => {
        if ("key" in config && config.key) {
          slotConfigMap.value.set(config.key, config);
          if (!(config.key in nextValues)) {
            nextValues[config.key] = getDefaultSlotValue(config);
          }
        }
      });
      slotValues.value = nextValues;
    };

    const clearEditor = () => {
      unmountAllPortals();
      slotDomMap.value.clear();
      slotConfigMap.value.clear();
      slotValues.value = {};
      currentSkillRef.value = undefined;

      if (skillDomRef.value) {
        unmountDom(skillDomRef.value);
      }
      skillDomRef.value = null;

      if (editableRef.value) {
        editableRef.value.innerHTML = "";
      }
    };

    const getSelection = () => {
      if (typeof window === "undefined") return null;
      return window.getSelection();
    };

    const setRange = (range: Range, selection: Selection) => {
      selection.removeAllRanges();
      selection.addRange(range);
    };

    const setCursorPosition = (
      targetNode: Node,
      offset: number,
      preventScroll?: boolean,
    ) => {
      const editable = editableRef.value;
      if (!editable) return;
      editable.focus({ preventScroll });
      const selection = getSelection();
      if (!selection) return;
      const range = document.createRange();
      range.setStart(targetNode, offset);
      range.collapse(true);
      setRange(range, selection);
    };

    const setStartCursor = (preventScroll?: boolean) => {
      const editable = editableRef.value;
      if (!editable) return;
      const startIndex = skillDomRef.value ? 1 : 0;
      setCursorPosition(editable, startIndex, preventScroll);
    };

    const setEndCursor = (preventScroll?: boolean) => {
      const editable = editableRef.value;
      if (!editable) return;
      editable.focus({ preventScroll });
      const selection = getSelection();
      if (!selection) return;
      const range = document.createRange();
      range.selectNodeContents(editable);
      range.collapse(false);
      setRange(range, selection);
    };

    const selectAll = (preventScroll?: boolean) => {
      const editable = editableRef.value;
      if (!editable) return;
      editable.focus({ preventScroll });
      const selection = getSelection();
      if (!selection) return;
      const range = document.createRange();
      range.selectNodeContents(editable);
      if (skillDomRef.value) {
        range.setStart(editable, 1);
      }
      setRange(range, selection);
    };

    const focusSlot = (key?: string, preventScroll?: boolean) => {
      const editable = editableRef.value;
      if (!editable) return;

      const resolveTarget = (slotKey: string) => {
        const slotDom = slotDomMap.value.get(slotKey);
        const slotCfg = slotConfigMap.value.get(slotKey);
        if (!slotDom || !slotCfg) return null;

        if (slotCfg.type === "input") {
          return slotDom.querySelector("input") as HTMLInputElement | null;
        }

        if (slotCfg.type === "content") {
          return slotDom;
        }

        return null;
      };

      if (key) {
        const target = resolveTarget(key);
        if (target instanceof HTMLInputElement) {
          target.focus({ preventScroll });
          return;
        }
        if (target instanceof HTMLSpanElement) {
          setCursorPosition(target, 0, preventScroll);
          return;
        }
      }

      for (const node of Array.from(editable.childNodes)) {
        if (!(node instanceof HTMLElement)) continue;
        const slotKey = node.dataset.slotKey;
        const nodeType = node.dataset.nodeType;
        if (!slotKey || nodeType === "nbsp") continue;
        const target = resolveTarget(slotKey);
        if (target instanceof HTMLInputElement) {
          target.focus({ preventScroll });
          return;
        }
        if (target instanceof HTMLSpanElement) {
          setCursorPosition(target, 0, preventScroll);
          return;
        }
      }

      setEndCursor(preventScroll);
    };

    const removeSlot = (key: string, event?: Event) => {
      const editable = editableRef.value;
      if (!editable) return;
      pendingBeforeSelection = captureEditorSelection(
        event?.target ?? document.activeElement,
      );
      editable.querySelectorAll(`[data-slot-key="${key}"]`).forEach(element => {
        unmountDom(element as HTMLElement);
        element.remove();
      });

      const nextValues = { ...slotValues.value };
      delete nextValues[key];
      slotValues.value = nextValues;

      slotConfigMap.value.delete(key);
      slotDomMap.value.delete(key);
      slotDomMap.value.delete(`${key}_before`);
      slotDomMap.value.delete(`${key}_after`);

      triggerValueChange(event);
      pushHistory("delete", true);
    };

    const removeSkill = (triggerChange = true) => {
      const skillDom = skillDomRef.value;
      if (!skillDom) return;
      if (triggerChange) {
        pendingBeforeSelection = captureEditorSelection();
      }
      unmountDom(skillDom);
      skillDom.remove();
      skillDomRef.value = null;
      currentSkillRef.value = undefined;

      if (triggerChange) {
        editableRef.value?.focus();
        triggerValueChange();
        pushHistory("delete", true);
      }
    };

    const renderSkill = (
      skillOverride?: SkillType,
      useOverride: boolean = false,
    ) => {
      const editable = editableRef.value;
      const skill = useOverride ? skillOverride : senderCtx.value.skill;
      if (!editable) return;

      if (!skill) {
        removeSkill(false);
        return;
      }

      let skillDom = skillDomRef.value;
      if (!skillDom) {
        skillDom = buildSkillSpan(skill.value);
        editable.insertBefore(skillDom, editable.firstChild);
        skillDomRef.value = skillDom;
      }

      currentSkillRef.value = skill;
      mountedDomSet.value.add(skillDom);
      render(
        <Skill
          prefixCls={prefixCls.value}
          skill={skill}
          disabled={senderCtx.value.readOnly || senderCtx.value.disabled}
          removeSkill={() => removeSkill(true)}
        />,
        skillDom,
      );
    };

    const updateSkillEmptyStatus = (value = getEditorValue()) => {
      const skillDom = skillDomRef.value;
      if (!skillDom) return;

      const isEmpty =
        !value.value &&
        value.slotConfig.length === 0 &&
        !!senderCtx.value.placeholder &&
        !skillDom.hasChildNodes();

      if (isEmpty && !senderCtx.value.readOnly && !senderCtx.value.disabled) {
        skillDom.setAttribute("contenteditable", "true");
        skillDom.classList.add(`${prefixCls.value}-skill-empty`);
      } else {
        skillDom.setAttribute("contenteditable", "false");
        skillDom.classList.remove(`${prefixCls.value}-skill-empty`);
      }
    };

    const initFromSlotConfig = (
      configs: readonly SlotConfigType[] | undefined,
    ) => {
      const editable = editableRef.value;
      if (!editable) return;

      clearEditor();

      const mergeConfigs = configs ?? [];
      mergeConfigs.forEach(config => {
        if ("key" in config && config.key) {
          slotConfigMap.value.set(config.key, config);
          const defaultValue = getDefaultSlotValue(config);
          if (defaultValue !== undefined) {
            slotValues.value[config.key] = defaultValue;
          }
        }
      });

      const nodes = buildSlotNodes(mergeConfigs);
      nodes.forEach(node => {
        editable.appendChild(node);
      });

      renderSkill();
      void nextTick(() => {
        const value = getEditorValue();
        updateSkillEmptyStatus(value);
        updateSubmitDisabled();
      });
    };

    const removeSpecificBRs = () => {
      if (senderCtx.value.submitType !== "enter") return;
      editableRef.value?.querySelectorAll("br").forEach(br => br.remove());
    };

    const shouldSubmit = (event: KeyboardEvent) => {
      const { key, shiftKey, ctrlKey, altKey, metaKey } = event;
      if (key !== "Enter") return false;
      const isModifierPressed = ctrlKey || altKey || metaKey;
      const submitType = senderCtx.value.submitType ?? "enter";

      return (
        (submitType === "enter" && !shiftKey && !isModifierPressed) ||
        (submitType === "shiftEnter" && shiftKey && !isModifierPressed)
      );
    };

    const findOuterContainer = (node: Node | null) => {
      const editable = editableRef.value;
      if (!node || !editable) return null;

      let current: Node | null = node;
      if (current.nodeType === Node.TEXT_NODE) {
        current = current.parentNode;
      }

      while (current && current !== editable) {
        if (current instanceof HTMLElement && current.tagName === "SPAN") {
          return current;
        }
        current = current.parentNode;
      }

      return null;
    };

    const findManagedContainer = (node: Node | null) => {
      const editable = editableRef.value;
      let current = node;
      while (current && current !== editable) {
        if (current instanceof HTMLElement) {
          const info = getNodeInfo(current);
          if (info?.skillKey || (info?.slotKey && info.nodeType !== "nbsp")) {
            return current;
          }
        }
        current = current.parentNode;
      }
      return null;
    };

    const rangeIntersectsSlot = (range: Range): boolean => {
      const editable = editableRef.value;
      if (!editable) return false;
      if (slotDomMap.value.size === 0 && !skillDomRef.value) return false;
      // Try native intersectsNode per node with individual try
      for (const dom of slotDomMap.value.values()) {
        try {
          if ((range as any).intersectsNode?.(dom)) return true;
        } catch {}
        // Fallback: check if dom is inside range via compareBoundaryPoints
        try {
          const domRange = document.createRange();
          domRange.selectNode(dom);
          const r: any = range as any;
          if (r.compareBoundaryPoints) {
            const beforeEnd =
              r.compareBoundaryPoints(Range.START_TO_END, domRange) < 0;
            const afterStart =
              r.compareBoundaryPoints(Range.END_TO_START, domRange) > 0;
            if (beforeEnd && afterStart) return true;
          }
        } catch {}
      }
      if (skillDomRef.value) {
        try {
          if ((range as any).intersectsNode?.(skillDomRef.value)) return true;
        } catch {}
        try {
          const domRange = document.createRange();
          domRange.selectNode(skillDomRef.value);
          const r: any = range as any;
          if (r.compareBoundaryPoints) {
            const beforeEnd =
              r.compareBoundaryPoints(Range.START_TO_END, domRange) < 0;
            const afterStart =
              r.compareBoundaryPoints(Range.END_TO_START, domRange) > 0;
            if (beforeEnd && afterStart) return true;
          }
        } catch {}
      }
      // Fallback for JSDOM select-all: commonAncestor is editable and range not collapsed
      try {
        if (!range.collapsed && range.commonAncestorContainer === editable)
          return true;
        const container = range.commonAncestorContainer as HTMLElement;
        if (
          container instanceof HTMLElement &&
          container.querySelector?.("[data-slot-key],[data-skill-key]")
        )
          return true;
        if (editable.contains(container) && !range.collapsed) {
          // If range start/end are inside editable and not collapsed, assume intersects if slots exist
          // More precise check already done, this is last resort for JSDOM
          return true;
        }
      } catch {}
      return false;
    };

    const selectionContainsSlot = (): boolean => {
      const sel = getSelection();
      if (!sel || sel.rangeCount === 0) return false;
      const range = sel.getRangeAt(0);
      if (range.collapsed) return false;
      return rangeIntersectsSlot(range);
    };

    const handleSelectionDelete = (
      event: KeyboardEvent | InputEvent,
    ): boolean => {
      const selection = getSelection();
      const editable = editableRef.value;
      if (!editable || !selection || selection.rangeCount === 0) return false;
      const range = selection.getRangeAt(0);
      if (range.collapsed || !rangeIntersectsSlot(range)) return false;
      // Selection contains slot(s) – ensure undo can restore via history
      if (event instanceof KeyboardEvent) event.preventDefault();
      else (event as InputEvent).preventDefault?.();
      pendingBeforeSelection = captureEditorSelection(event.target);
      const startContainer = findManagedContainer(range.startContainer);
      const endContainer = findManagedContainer(range.endContainer);
      if (
        startContainer &&
        getNodeInfo(startContainer)?.slotConfig?.type !== "content"
      ) {
        range.setStartBefore(startContainer);
      }
      if (
        endContainer &&
        getNodeInfo(endContainer)?.slotConfig?.type !== "content"
      ) {
        range.setEndAfter(endContainer);
      }
      range.deleteContents();
      const remainingKeys = new Set<string>();
      editable.querySelectorAll("[data-slot-key]").forEach(el => {
        const k = (el as HTMLElement).dataset.slotKey!;
        const base = k.replace(/_before$|_after$/, "");
        remainingKeys.add(base);
        remainingKeys.add(k);
      });
      const toDelete: string[] = [];
      slotDomMap.value.forEach((_, k) => {
        if (!remainingKeys.has(k)) toDelete.push(k);
      });
      toDelete.forEach(k => {
        const dom = slotDomMap.value.get(k);
        if (dom) unmountDom(dom as HTMLElement);
        slotDomMap.value.delete(k);
      });
      const nextSlotValues = { ...slotValues.value };
      slotConfigMap.value.forEach((config, key) => {
        if (config.type === "content") {
          const dom = slotDomMap.value.get(key);
          if (dom && editable.contains(dom)) {
            nextSlotValues[key] = dom.innerText || "";
          }
        }
      });
      slotValues.value = nextSlotValues;
      const remainingBase = new Set<string>();
      slotDomMap.value.forEach((_, k) => {
        if (!k.endsWith("_before") && !k.endsWith("_after"))
          remainingBase.add(k);
      });
      slotConfigMap.value.forEach((_, k) => {
        if (
          !remainingBase.has(k) &&
          !editable.querySelector(`[data-slot-key="${k}"]`)
        ) {
          slotConfigMap.value.delete(k);
          const nv = { ...slotValues.value };
          delete nv[k];
          slotValues.value = nv;
        }
      });
      if (skillDomRef.value && !editable.contains(skillDomRef.value)) {
        unmountDom(skillDomRef.value);
        skillDomRef.value = null;
        currentSkillRef.value = undefined;
      }
      triggerValueChange(event as unknown as Event);
      pushHistory("delete", true);
      return true;
    };

    const handleDeleteNextSlot = (event: KeyboardEvent): boolean => {
      const selection = getSelection();
      const editable = editableRef.value;
      if (!editable || !selection || selection.rangeCount === 0) return false;
      const range = selection.getRangeAt(0);
      if (!range.collapsed) return false;
      const anchorNode = selection.anchorNode;
      const focusOffset = selection.focusOffset;
      if (!anchorNode || !editable.contains(anchorNode)) return false;
      let nextSibling: Node | null = null;
      if (anchorNode === editable) {
        nextSibling = editable.childNodes[focusOffset] || null;
      } else if (focusOffset === (anchorNode.textContent?.length ?? 0)) {
        const outer = findOuterContainer(anchorNode);
        const boundary =
          outer && editable.contains(outer)
            ? outer
            : (anchorNode as HTMLElement);
        nextSibling = boundary.nextSibling;
      } else {
        return false;
      }
      let cur: Node | null = nextSibling;
      while (cur) {
        if (cur instanceof HTMLElement) {
          const info = getNodeInfo(cur);
          if (info?.slotKey || info?.skillKey) {
            event.preventDefault();
            if (info.slotKey) removeSlot(info.slotKey, event);
            else removeSkill(true);
            return true;
          }
          if (cur.textContent) return false;
        } else if (cur.nodeType === Node.TEXT_NODE) {
          if (cur.textContent) return false;
        }
        cur = cur.nextSibling;
      }
      return false;
    };

    const handleDeleteOperation = (
      event: KeyboardEvent | ClipboardEvent,
      operationType: "backspace" | "cut" | "delete",
    ) => {
      const selection = getSelection();
      const editable = editableRef.value;
      if (!editable || !selection || selection.rangeCount === 0) return false;

      const range = selection.getRangeAt(0);

      const anchorNode = selection.anchorNode;
      const focusOffset = selection.focusOffset;

      if (!anchorNode || !editable.contains(anchorNode)) {
        return false;
      }

      if (anchorNode.nodeType === Node.TEXT_NODE && range) {
        const parentElement = anchorNode.parentNode as HTMLElement;
        const nodeInfo = getNodeInfo(parentElement);
        const selectedText = range.toString();
        const textLength = anchorNode.textContent?.length ?? 0;
        const isFullTextSelected = textLength === selectedText.length;
        const isSingleCharAtEnd = textLength === 1 && focusOffset === 1;

        if (
          nodeInfo?.slotConfig?.type === "content" &&
          (isFullTextSelected || isSingleCharAtEnd)
        ) {
          event.preventDefault();
          pendingBeforeSelection = captureEditorSelection(event.target);
          parentElement.innerHTML = "";
          parentElement.innerText = "";
          // sync slotValues for content clearing
          if (nodeInfo.slotKey) {
            slotValues.value = {
              ...slotValues.value,
              [nodeInfo.slotKey]: "",
            };
          }
          triggerValueChange(event as unknown as Event);
          pushHistory("deleteContent", true);
          return true;
        }
      }

      const isIgnorableBoundaryNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return !(node.textContent ?? "");
        }

        if (!(node instanceof HTMLElement)) {
          return true;
        }

        if (node.tagName === "BR") {
          return true;
        }

        return !node.textContent;
      };

      const getPreviousSibling = () => {
        if (operationType !== "backspace") {
          return null;
        }

        if (anchorNode === editable) {
          return editable.childNodes[focusOffset - 1] || null;
        }

        if (focusOffset !== 0) {
          return null;
        }

        const outer = findOuterContainer(anchorNode);
        const boundaryNode =
          outer && editable.contains(outer)
            ? outer
            : anchorNode.nodeType === Node.TEXT_NODE
              ? anchorNode
              : (anchorNode as HTMLElement);

        return boundaryNode.previousSibling;
      };

      const findPreviousDeletableNode = (node: Node | null) => {
        let current = node;
        while (current) {
          if (current instanceof HTMLElement) {
            const nodeInfo = getNodeInfo(current);
            if (nodeInfo?.slotKey || nodeInfo?.skillKey) {
              return current;
            }
          }

          if (!isIgnorableBoundaryNode(current)) {
            return null;
          }

          current = current.previousSibling;
        }

        return null;
      };

      const target = findPreviousDeletableNode(getPreviousSibling());

      if (!target) {
        return false;
      }

      const info = getNodeInfo(target);
      if (info?.slotKey) {
        event.preventDefault();
        removeSlot(info.slotKey, event);
        return true;
      }

      if (info?.skillKey) {
        event.preventDefault();
        removeSkill(true);
        return true;
      }

      return false;
    };

    const hasManagedHistory = () => {
      if (isManagedHistoryActive) return true;
      if (slotDomMap.value.size > 0 || !!skillDomRef.value) return true;
      const activeStack =
        historyIndex >= 0 ? historyStack.slice(0, historyIndex + 1) : [];
      return activeStack.some(
        snapshot =>
          !!snapshot.document.skill ||
          snapshot.document.slotConfigs.some(config => config?.type !== "text"),
      );
    };

    const ensureManagedHistoryBaseline = () => {
      if (!hasManagedHistory()) {
        // Replace stale native/init entries so the first managed undo
        // returns to the current editor text instead of an empty mount snapshot.
        historyStack = [];
        historyIndex = -1;
        pushHistory("managedBaseline", true);
      }
      isManagedHistoryActive = true;
    };
    const onBeforeInput = (event: InputEvent) => {
      if (
        isRestoringHistory ||
        isComposing.value ||
        senderCtx.value.readOnly ||
        senderCtx.value.disabled
      )
        return;
      const inputType = (event as InputEvent).inputType || "";
      if (inputType === "historyUndo" || inputType === "historyRedo") {
        const nestedSlotKey = isNativeFormControl(event.target)
          ? event.target.closest<HTMLElement>("[data-slot-key]")?.dataset
              .slotKey
          : undefined;
        if (
          nestedSlotKey &&
          slotConfigMap.value.get(nestedSlotKey)?.type === "custom"
        ) {
          return;
        }
        if (!hasManagedHistory()) return;
        event.preventDefault();
        const controlSelection = captureSlotControlSelection(event.target);
        if (inputType === "historyUndo") handleUndo(controlSelection);
        else handleRedo();
        return;
      }
      const controlSelection = captureSlotControlSelection(event.target);
      if (controlSelection) {
        pendingBeforeSelection = {
          kind: "control",
          value: controlSelection,
        };
        return;
      }
      const sel = getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const editable = editableRef.value;
      if (!editable || !editable.contains(range.commonAncestorContainer))
        return;
      if (pendingHistoryType === "insertFromPaste") return;
      const captureIfNeeded = () => {
        if (pendingBeforeSelection === undefined) {
          pendingBeforeSelection = captureEditorSelection(event.target);
        }
      };
      const isDeleteType =
        inputType.startsWith("delete") || inputType.includes("Cut");
      const isInsertType = inputType.startsWith("insert") && !range.collapsed;
      // delete/insert 覆盖 slot 时需要历史
      if (isDeleteType && rangeIntersectsSlot(range)) {
        pendingHistoryType = inputType;
        captureIfNeeded();
        return;
      }
      if (isInsertType && rangeIntersectsSlot(range)) {
        pendingHistoryType = inputType;
        captureIfNeeded();
        return;
      }
      if (
        inputType === "insertText" &&
        range.collapsed &&
        slotDomMap.value.size > 0
      ) {
        const anchor = sel.anchorNode as HTMLElement | null;
        const outer = anchor ? findOuterContainer(anchor) : null;
        const info = outer ? getNodeInfo(outer as HTMLElement) : null;
        if (info?.slotConfig?.type === "content") {
          pendingHistoryType = "insertText";
          captureIfNeeded();
          return;
        }
      }
      // Keep plain text operations in the same stack after the final slot is removed.
      if (
        hasManagedHistory() &&
        (inputType === "insertText" ||
          inputType === "insertFromPaste" ||
          inputType.startsWith("delete") ||
          inputType.startsWith("insert"))
      ) {
        pendingHistoryType = inputType;
        captureIfNeeded();
      }
    };
    const onInternalCut = (event: ClipboardEvent) => {
      if (senderCtx.value.readOnly || senderCtx.value.disabled) return;
      // A nested native control owns its cut operation. Browsers may retain a
      // stale outer document selection after focus moves into the control.
      if (isNativeFormControl(event.target)) return;
      // Cut with slot selection is handled as delete with history (push after)
      if (selectionContainsSlot()) {
        const selection = getSelection();
        event.clipboardData?.setData("text/plain", selection?.toString() ?? "");
        if (handleSelectionDelete(event as unknown as InputEvent)) return;
      }
      handleDeleteOperation(event, "cut");
    };

    const onInternalKeyDown = (event: KeyboardEvent) => {
      const eventRes = senderCtx.value.onKeyDown?.(event);
      if (eventRes === false || keyLock.value || isComposing.value) {
        return;
      }

      // 浏览器原生对 contenteditable + 原子 span 的撤销不可靠（会重建文本节点导致叠加），
      // 当前或历史快照存在 slot/skill 时接管 Ctrl+Z/Y；纯文本交给浏览器原生历史。
      const isMod = event.ctrlKey || event.metaKey;
      const keyLower = event.key.toLowerCase();
      const sel = getSelection();
      const inEditable =
        !!editableRef.value &&
        !!sel &&
        sel.rangeCount > 0 &&
        editableRef.value.contains(sel.anchorNode as Node | null);
      const eventFromEditable =
        !!editableRef.value &&
        event.target instanceof Node &&
        editableRef.value.contains(event.target);
      const eventFromNestedFormControl = isNativeFormControl(event.target);
      const nestedControlKey = eventFromNestedFormControl
        ? (event.target as HTMLElement).closest<HTMLElement>("[data-slot-key]")
            ?.dataset.slotKey
        : undefined;
      const nestedCustomControl =
        !!nestedControlKey &&
        slotConfigMap.value.get(nestedControlKey)?.type === "custom";
      const nestedControlSelection = captureSlotControlSelection(event.target);
      const editableFocused =
        inEditable ||
        eventFromEditable ||
        document.activeElement === editableRef.value;
      const shouldUseManagedHistory = hasManagedHistory();
      if (
        !senderCtx.value.readOnly &&
        !senderCtx.value.disabled &&
        editableFocused &&
        shouldUseManagedHistory &&
        !nestedCustomControl &&
        isMod &&
        keyLower === "z"
      ) {
        event.preventDefault();
        if (event.shiftKey) handleRedo();
        else handleUndo(nestedControlSelection);
        return;
      }
      if (
        !senderCtx.value.readOnly &&
        !senderCtx.value.disabled &&
        editableFocused &&
        shouldUseManagedHistory &&
        !nestedCustomControl &&
        isMod &&
        keyLower === "y"
      ) {
        event.preventDefault();
        handleRedo();
        return;
      }

      if (
        (senderCtx.value.readOnly || senderCtx.value.disabled) &&
        (event.key === "Backspace" || event.key === "Delete")
      ) {
        return;
      }

      // A nested form control owns its ordinary editing keys. The document
      // selection may still point at an older outer-editor selection, so it
      // must not be used to infer a structural slot deletion here.
      if (
        eventFromNestedFormControl &&
        (event.key === "Backspace" || event.key === "Delete")
      ) {
        return;
      }

      // Selection containing slot: any Backspace/Delete should use history-aware delete
      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        handleSelectionDelete(event)
      ) {
        return;
      }

      if (
        event.key === "Backspace" &&
        handleDeleteOperation(event, "backspace")
      ) {
        return;
      }

      if (event.key === "Delete" && handleDeleteNextSlot(event)) {
        return;
      }

      if (shouldSubmit(event)) {
        event.preventDefault();
        keyLock.value = true;
        senderCtx.value.triggerSend?.();
        return;
      }

      if (
        (event.key === "a" || event.key === "A") &&
        (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault();
        selectAll(true);
      }
    };

    const onInternalKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        keyLock.value = false;
      }
      senderCtx.value.onKeyUp?.(event);
    };

    const normalizeSkillTextInput = () => {
      const editable = editableRef.value;
      const skillDom = skillDomRef.value;
      if (!editable || !skillDom) return;

      const selection = getSelection();
      const cursorNode =
        selection?.anchorNode && skillDom.contains(selection.anchorNode)
          ? selection.anchorNode
          : null;
      const cursorOffset = selection?.anchorOffset ?? 0;
      const wrapperCls = `${prefixCls.value}-skill-wrapper`;
      const textNodes = Array.from(skillDom.childNodes).filter(node => {
        if (
          node instanceof HTMLElement &&
          node.classList.contains(wrapperCls)
        ) {
          return false;
        }

        return node.textContent;
      });

      const referenceNode = skillDom.nextSibling;
      textNodes.forEach(node => {
        editable.insertBefore(node, referenceNode);
      });

      if (cursorNode && editable.contains(cursorNode)) {
        const range = document.createRange();
        const nextOffset =
          cursorNode.nodeType === Node.TEXT_NODE
            ? Math.min(cursorOffset, cursorNode.textContent?.length ?? 0)
            : Math.min(cursorOffset, cursorNode.childNodes.length);

        range.setStart(cursorNode, nextOffset);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    };

    const onInternalInput = (event?: Event) => {
      if (senderCtx.value.readOnly || senderCtx.value.disabled) return;
      removeSpecificBRs();
      normalizeSkillTextInput();
      triggerValueChange(event);
      if (!isComposing.value && pendingHistoryType) {
        const t = pendingHistoryType;
        pendingHistoryType = null;
        const forceNew = t !== "insertText";
        pushHistory(t, forceNew);
        // pushHistory normally consumes this selection. Keep the input boundary
        // explicit as well so a restore-time input cannot leak it forward.
        pendingBeforeSelection = undefined;
      }
    };

    const onInternalCompositionStart = (event: CompositionEvent) => {
      if (senderCtx.value.readOnly || senderCtx.value.disabled) return;
      isComposing.value = true;
      if (!hasManagedHistory()) return;
      pendingBeforeSelection = captureEditorSelection(event.target);
      pendingHistoryType = "insertCompositionText";
    };
    const onInternalCompositionEnd = (event: CompositionEvent) => {
      isComposing.value = false;
      keyLock.value = false;
      if (senderCtx.value.readOnly || senderCtx.value.disabled) return;
      const selectionAfter = captureEditorSelection(event.target);
      void nextTick(() => {
        if (pendingHistoryType === "insertCompositionText") {
          pushHistory("insertCompositionText", true, selectionAfter);
        }
      });
    };

    const onInternalPaste = (event: ClipboardEvent) => {
      if (senderCtx.value.readOnly || senderCtx.value.disabled) return;
      if (isNativeFormControl(event.target)) {
        senderCtx.value.onPaste?.(event);
        return;
      }
      event.preventDefault();
      const files = event.clipboardData?.files;
      const text = event.clipboardData?.getData("text/plain") ?? "";

      if (!text && files?.length && senderCtx.value.onPasteFile) {
        senderCtx.value.onPasteFile(files);
        return;
      }

      if (text) {
        if (pendingBeforeSelection === undefined) {
          pendingBeforeSelection = captureEditorSelection(event.target);
        }
        const cleanedText = getCleanedText(text);
        pendingHistoryType = "insertFromPaste";
        let success = false;
        try {
          success = document.execCommand("insertText", false, cleanedText);
        } catch (err) {
          warning(false, "Sender", `insertText command failed: ${String(err)}`);
        }
        if (!success) {
          const selection = getSelection();
          if (selection && selection.rangeCount > 0) {
            // Range insertion bypasses the browser's native undo stack. From
            // this point the editor must use managed history even without a
            // slot or skill, seeded with the current plain-text baseline.
            ensureManagedHistoryBaseline();
            pendingBeforeSelection = captureEditorSelection(event.target);
            pendingHistoryType = "insertFromPaste";
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(cleanedText);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            onInternalInput(event);
          }
        } else {
          // Some browsers do not dispatch input for execCommand. Save immediately
          // when the synchronous input handler did not consume the marker.
          if (pendingHistoryType === "insertFromPaste") {
            onInternalInput(event);
          }
        }
      }
      senderCtx.value.onPaste?.(event);
    };
    const onInternalSelect = () => {
      const selection = getSelection();
      const editable = editableRef.value;
      if (!selection || !editable) return;

      if (
        selection.focusNode === editable &&
        selection.focusOffset === 0 &&
        getEditorValue().skill
      ) {
        setCursorPosition(editable, 1);
      }
    };

    const getRangeForInsert = (position: InsertPosition = "cursor") => {
      const editable = editableRef.value;
      if (!editable) return null;

      const selection = getSelection();
      const range = document.createRange();

      if (position === "start") {
        const index = skillDomRef.value ? 1 : 0;
        range.setStart(editable, index);
        range.collapse(true);
        return { range, selection };
      }

      if (position === "end") {
        range.selectNodeContents(editable);
        range.collapse(false);
        return { range, selection };
      }

      if (
        selection &&
        selection.rangeCount > 0 &&
        editable.contains(selection.getRangeAt(0).startContainer)
      ) {
        const currentRange = selection.getRangeAt(0).cloneRange();
        const outer = findOuterContainer(currentRange.startContainer);
        const outerInfo = outer ? getNodeInfo(outer) : null;

        if (
          outer &&
          outerInfo?.slotKey &&
          outerInfo.slotConfig?.type !== "content"
        ) {
          currentRange.setStartAfter(outer);
          currentRange.collapse(true);
        }

        return { range: currentRange, selection };
      }

      range.selectNodeContents(editable);
      range.collapse(false);
      return { range, selection };
    };

    const insert: SlotTextAreaRef["insert"] = (
      slotConfig,
      position = "cursor",
      replaceCharacters,
      preventScroll,
    ) => {
      const editable = editableRef.value;
      if (
        !editable ||
        !slotConfig.length ||
        senderCtx.value.readOnly ||
        senderCtx.value.disabled
      )
        return;
      ensureManagedHistoryBaseline();
      pendingBeforeSelection = captureEditorSelection();
      mergeSlotConfig(slotConfig);
      const nodes = buildSlotNodes(slotConfig);
      if (!nodes.length) return;

      const insertContext = getRangeForInsert(position);
      if (!insertContext?.range) return;

      const { range, selection } = insertContext;
      editable.focus({ preventScroll });

      if (replaceCharacters) {
        const { startContainer, startOffset } = range;
        const textBefore =
          startContainer.nodeType === Node.TEXT_NODE
            ? (startContainer.textContent?.slice(0, startOffset) ?? "")
            : "";
        if (textBefore.endsWith(replaceCharacters)) {
          range.setStart(
            startContainer,
            Math.max(0, startOffset - replaceCharacters.length),
          );
        }
      }

      range.deleteContents();
      nodes.forEach(node => {
        range.insertNode(node);
        range.setStartAfter(node);
      });
      range.collapse(true);

      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      onInternalInput();
      pushHistory("insert", true);
    };

    const focus: SlotTextAreaRef["focus"] = options => {
      const cursor = options?.cursor ?? "end";

      if (cursor === "start") {
        setStartCursor(options?.preventScroll);
        return;
      }
      if (cursor === "all") {
        selectAll(options?.preventScroll);
        return;
      }
      if (cursor === "slot") {
        focusSlot(options?.key, options?.preventScroll);
        return;
      }
      setEndCursor(options?.preventScroll);
    };

    const clear: SlotTextAreaRef["clear"] = () => {
      if (senderCtx.value.readOnly || senderCtx.value.disabled) return;
      ensureManagedHistoryBaseline();
      pendingBeforeSelection = captureEditorSelection();
      clearEditor();
      renderSkill();
      onInternalInput();
      pushHistory("delete", true);
    };

    expose<SlotTextAreaRef>({
      get nativeElement() {
        return editableRef.value ?? null;
      },
      focus,
      blur() {
        editableRef.value?.blur();
      },
      insert,
      clear,
      getValue: getEditorValue,
    });

    const applySlotConfig = (
      configs: readonly SlotConfigType[] | undefined,
      force = false,
    ) => {
      if (!force && configs === lastSlotConfigRef.value) {
        return;
      }
      lastSlotConfigRef.value = configs;
      initFromSlotConfig(configs);
    };

    const initHistoryStack = () => {
      const initVersion = ++historyInitVersion;
      historyStack = [];
      historyIndex = -1;
      isManagedHistoryActive = slotDomMap.value.size > 0 || !!skillDomRef.value;
      pendingHistoryType = null;
      pendingBeforeSelection = undefined;
      void nextTick(() => {
        if (initVersion !== historyInitVersion) return;
        // Skip if insert/clear already seeded managed history in this tick.
        if (historyStack.length > 0) return;
        // 推入初始全量快照作为基线
        pushHistory("init", true);
      });
    };

    const reconcilePendingControlledValues = () => {
      let shouldResetHistory = false;

      if (hasPendingControlledSlotConfig) {
        const configs = pendingControlledSlotConfig;
        hasPendingControlledSlotConfig = false;
        pendingControlledSlotConfig = undefined;
        if (isEquivalentValue(configs, getEditorValue().slotConfig)) {
          lastSlotConfigRef.value = configs;
        } else {
          applySlotConfig(configs, true);
          shouldResetHistory = true;
        }
      }

      if (hasPendingControlledSkill) {
        const skill = pendingControlledSkill;
        hasPendingControlledSkill = false;
        pendingControlledSkill = undefined;
        if (isEquivalentValue(skill, currentSkillRef.value)) {
          lastSkillRef.value = skill;
        } else {
          lastSkillRef.value = skill;
          renderSkill(skill, true);
          shouldResetHistory = true;
        }
      }

      if (shouldResetHistory) {
        initHistoryStack();
        void nextTick(() => {
          const value = getEditorValue();
          updateSkillEmptyStatus(value);
          updateSubmitDisabled();
        });
      }
    };

    watch(
      () => editableRef.value,
      editable => {
        if (!editable) return;
        applySlotConfig(senderCtx.value.slotConfig, true);
        if (!isRestoringHistory) initHistoryStack();
      },
      { immediate: true },
    );

    watch(
      () => senderCtx.value.slotConfig,
      configs => {
        if (isRestoringHistory) {
          pendingControlledSlotConfig = configs;
          hasPendingControlledSlotConfig = true;
          return;
        }
        if (isEquivalentValue(configs, getEditorValue().slotConfig)) {
          lastSlotConfigRef.value = configs;
          return;
        }
        // Controlled props are authoritative. Any actual external value
        // establishes a new history baseline.
        applySlotConfig(configs);
        initHistoryStack();
      },
      { immediate: true },
    );

    watch(
      () => senderCtx.value.skill,
      skill => {
        if (isRestoringHistory) {
          pendingControlledSkill = skill;
          hasPendingControlledSkill = true;
          return;
        }
        if (isEquivalentValue(skill, currentSkillRef.value)) {
          lastSkillRef.value = skill;
          return;
        }
        lastSkillRef.value = skill;
        renderSkill();
        initHistoryStack();
        void nextTick(() => {
          const value = getEditorValue();
          updateSkillEmptyStatus(value);
          updateSubmitDisabled();
        });
      },
      { immediate: true },
    );

    watch(
      () => [senderCtx.value.readOnly, senderCtx.value.disabled] as const,
      ([readOnly, disabled]) => {
        const editable = !(readOnly || disabled);
        slotConfigMap.value.forEach((config, key) => {
          const dom = slotDomMap.value.get(key);
          if (!dom) return;
          if (config.type === "content") {
            dom.setAttribute("contenteditable", editable ? "true" : "false");
          } else {
            renderSlot(config, dom);
          }
        });
        if (currentSkillRef.value) {
          renderSkill(currentSkillRef.value as any, true);
          updateSkillEmptyStatus();
        }
        // switching to readOnly/disabled should not leave stale pending history
        if (readOnly || disabled) {
          pendingHistoryType = null;
          pendingBeforeSelection = undefined;
          isComposing.value = false;
          keyLock.value = false;
        }
      },
    );

    onBeforeUnmount(() => {
      pendingHistoryType = null;
      pendingBeforeSelection = undefined;
      unmountAllPortals();
    });

    return () => {
      const inputCls = `${prefixCls.value}-input`;

      return (
        <div
          ref={editableRef}
          role="textbox"
          tabindex={0}
          class={classNames([
            inputCls,
            `${inputCls}-slot`,
            senderCtx.value.classNames?.input,
          ])}
          style={mergeInputStyle.value}
          data-placeholder={senderCtx.value.placeholder}
          contenteditable={
            !senderCtx.value.readOnly && !senderCtx.value.disabled
          }
          spellcheck={false}
          onBeforeinput={onBeforeInput as any}
          onInput={onInternalInput}
          onKeydown={onInternalKeyDown}
          onKeyup={onInternalKeyUp}
          onPaste={onInternalPaste}
          onCut={onInternalCut}
          onSelect={onInternalSelect}
          onFocus={(e: FocusEvent) => {
            senderCtx.value.onFocus?.(e);
          }}
          onBlur={(e: FocusEvent) => {
            keyLock.value = false;
            pendingBeforeSelection = undefined;
            // blur mid-composition without compositionend (e.g. IME cancelled) should not leave stale pending
            if (isComposing.value) {
              isComposing.value = false;
              pendingHistoryType = null;
              pendingBeforeSelection = undefined;
            }
            senderCtx.value.onBlur?.(e);
          }}
          onCompositionstart={onInternalCompositionStart}
          onCompositionend={onInternalCompositionEnd}
        />
      );
    };
  },
});
