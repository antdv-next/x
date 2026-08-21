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

function getDefaultSlotValue(config: SlotConfigType) {
  const key = (config as any).key as string | undefined;
  if (!key) return undefined;

  const props = (config as any).props ?? {};
  if (SUPPORTED_INPUT_TYPES.has(config.type)) {
    return props.defaultValue ?? "";
  }

  return props.value ?? props.label ?? "";
}

function isEquivalentValue(
  left: unknown,
  right: unknown,
  seen = new WeakMap<object, object>(),
): boolean {
  const rawLeft =
    left && typeof left === "object" ? toRaw(left as object) : left;
  const rawRight =
    right && typeof right === "object" ? toRaw(right as object) : right;
  if (Object.is(rawLeft, rawRight)) return true;
  if (
    !rawLeft ||
    !rawRight ||
    typeof rawLeft !== "object" ||
    typeof rawRight !== "object"
  ) {
    return false;
  }
  // bidirectional cycle check
  if (seen.get(rawLeft as object) === rawRight) return true;
  if (seen.get(rawRight as object) === rawLeft) return true;
  seen.set(rawLeft as object, rawRight as object);
  seen.set(rawRight as object, rawLeft as object);

  if (Array.isArray(rawLeft) || Array.isArray(rawRight)) {
    return (
      Array.isArray(rawLeft) &&
      Array.isArray(rawRight) &&
      rawLeft.length === rawRight.length &&
      rawLeft.every((value, index) =>
        isEquivalentValue(value, rawRight[index], seen),
      )
    );
  }

  // Date
  if (rawLeft instanceof Date || rawRight instanceof Date) {
    return (
      rawLeft instanceof Date &&
      rawRight instanceof Date &&
      rawLeft.getTime() === rawRight.getTime()
    );
  }
  // RegExp
  if (rawLeft instanceof RegExp || rawRight instanceof RegExp) {
    return (
      rawLeft instanceof RegExp &&
      rawRight instanceof RegExp &&
      rawLeft.source === rawRight.source &&
      rawLeft.flags === rawRight.flags
    );
  }
  // Map
  if (rawLeft instanceof Map || rawRight instanceof Map) {
    if (!(rawLeft instanceof Map && rawRight instanceof Map)) return false;
    if (rawLeft.size !== rawRight.size) return false;
    for (const [k, v] of rawLeft as Map<unknown, unknown>) {
      // try direct key, fallback to deep key search
      if ((rawRight as Map<unknown, unknown>).has(k)) {
        if (
          !isEquivalentValue(
            v,
            (rawRight as Map<unknown, unknown>).get(k),
            seen,
          )
        )
          return false;
      } else {
        let found = false;
        for (const [rk, rv] of rawRight as Map<unknown, unknown>) {
          if (
            isEquivalentValue(k, rk, seen) &&
            isEquivalentValue(v, rv, seen)
          ) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
    }
    return true;
  }
  // Set
  if (rawLeft instanceof Set || rawRight instanceof Set) {
    if (!(rawLeft instanceof Set && rawRight instanceof Set)) return false;
    if ((rawLeft as Set<unknown>).size !== (rawRight as Set<unknown>).size)
      return false;
    for (const v of rawLeft as Set<unknown>) {
      let has = false;
      for (const rv of rawRight as Set<unknown>) {
        if (isEquivalentValue(v, rv, seen)) {
          has = true;
          break;
        }
      }
      if (!has) return false;
    }
    return true;
  }

  const leftPrototype = Object.getPrototypeOf(rawLeft);
  const rightPrototype = Object.getPrototypeOf(rawRight);
  if (
    leftPrototype !== rightPrototype ||
    (leftPrototype !== Object.prototype && leftPrototype !== null)
  ) {
    return false;
  }

  const leftKeys: (string | symbol)[] = [
    ...Object.keys(rawLeft as object),
    ...Object.getOwnPropertySymbols(rawLeft as object),
  ];
  const rightKeys: (string | symbol)[] = [
    ...Object.keys(rawRight as object),
    ...Object.getOwnPropertySymbols(rawRight as object),
  ];
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every(
    key =>
      Object.prototype.hasOwnProperty.call(rawRight as object, key) &&
      isEquivalentValue(
        (rawLeft as Record<string | symbol, unknown>)[key as string],
        (rawRight as Record<string | symbol, unknown>)[key as string],
        seen,
      ),
  );
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
    // 全量快照栈：每次操作后 push 一份完整快照（slotConfigs/values/skill/cursor），
    // Ctrl+Z 只是 index-- 并 restore(stack[index])，不额外 push，避免“越撤销越多”
    type SelectionSnapshot = {
      startPath: number[];
      startOffset: number;
      endPath: number[];
      endOffset: number;
      collapsed: boolean;
    } | null;
    type HistorySnapshot = {
      slotConfigs: any[];
      slotValues: Record<string, any>;
      skill: any;
      cursor: SelectionSnapshot; // after cursor (光标在操作后)
      beforeCursor: SelectionSnapshot | null; // before cursor (撤销应回到此处)
      t: number;
      inputType: string;
    };
    let historyStack: HistorySnapshot[] = []; // 栈：0..index 为有效历史，存全量快照
    let historyIndex = -1; // 指针：当前快照在栈中的位置
    let isRestoringHistory = false;
    let isManagedHistoryActive = false;
    let pendingHistoryType: string | null = null; // beforeinput 标记，input 后推入
    let pendingBeforeCursor: SelectionSnapshot | null = null; // 操作前的光标，撤销应回到此处而非操作后
    type PendingEcho<T> = {
      value: T;
      emittedAt: number;
      origin: "local" | "sync";
    };
    // Controlled parents normally echo onChange values in emission order.
    // Match only the next pending operation and expire abandoned echoes so a
    // later external value cannot accidentally match old emitted content.
    const PENDING_ECHO_TTL = 5000;
    const MAX_PENDING_ECHOES = 20;
    const pendingEmittedSlotConfigs: PendingEcho<
      readonly SlotConfigType[] | undefined
    >[] = [];
    const pendingEmittedSkills: PendingEcho<SkillType | undefined>[] = [];
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

    const captureSelectionSnapshot = (): SelectionSnapshot => {
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

    const restoreSelectionSnapshot = (cursor: SelectionSnapshot) => {
      const editable = editableRef.value;
      if (!editable) return;
      const sel = getSelection();
      if (!sel) return;
      if (!cursor) {
        setEndCursor();
        return;
      }
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
          editable.focus();
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
          editable.focus();
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
          editable.focus();
          return;
        } catch {}
      }
      setEndCursor();
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
      const val = getEditorValue();
      // Shallow clone slotConfigs to avoid DataCloneError on functions/VNodes and keep reference for customRender/formatResult
      const rawConfigs: any[] = (val as any).slotConfig as any[];
      const clonedConfigs = rawConfigs.map((c: any) => {
        if (!c || typeof c !== "object") return c;
        const copy: any = { ...c };
        if (c.props && typeof c.props === "object") copy.props = { ...c.props };
        return copy;
      });
      const rawSkill: any = currentSkillRef.value as any;
      let clonedSkill: any = undefined;
      if (rawSkill) {
        try {
          clonedSkill =
            typeof structuredClone === "function"
              ? (structuredClone as any)(rawSkill)
              : JSON.parse(JSON.stringify(rawSkill));
        } catch {
          clonedSkill = { ...rawSkill };
          if (rawSkill.props) clonedSkill.props = { ...rawSkill.props };
        }
      }
      return {
        slotConfigs: clonedConfigs,
        slotValues: { ...slotValues.value },
        skill: clonedSkill,
        cursor: captureSelectionSnapshot(),
        beforeCursor: null as SelectionSnapshot,
        t: Date.now(),
        inputType,
      };
    };

    // 推入全量快照（操作后调用），栈里全是完整状态，undo 只是指针--
    // beforeCursor 存操作前的光标，撤销时应回到 before 而非 after
    const pushHistory = (
      inputType: string = "unknown",
      forceNewGroup: boolean = false,
    ) => {
      if (isRestoringHistory) return;
      const now = Date.now();
      const snap = captureSnapshot(inputType);
      snap.beforeCursor = pendingBeforeCursor;
      pendingBeforeCursor = null;
      const last = historyStack[historyIndex];
      // dedup: skip identical snapshots (e.g. IME recomposition no-op) — but never skip composition which must be recorded
      const isSameContent =
        inputType !== "insertCompositionText" &&
        !!last &&
        isEquivalentValue(snap.slotConfigs, last.slotConfigs) &&
        isEquivalentValue(snap.slotValues, last.slotValues) &&
        isEquivalentValue(snap.skill, last.skill);
      // 分组：500ms 内连续 insertText 覆盖栈顶，不产生新条目，且保留组首的 beforeCursor
      const canGroup =
        !forceNewGroup &&
        last &&
        last.inputType === "insertText" &&
        inputType === "insertText" &&
        now - last.t < GROUP_MS;
      if (canGroup) {
        if (isSameContent) {
          last.cursor = snap.cursor;
          last.t = snap.t;
          pendingHistoryType = null;
          return;
        }
        // 保留组首的 beforeCursor（首次输入前），cursor 保持为当前 after
        snap.beforeCursor = last.beforeCursor;
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
      overrideCursor?: SelectionSnapshot | null,
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
      // Restore slotValues and slotConfigMap from snapshot
      slotValues.value = { ...snap.slotValues };
      snap.slotConfigs.forEach(cfg => {
        if ((cfg as any).key) {
          slotConfigMap.value.set((cfg as any).key, cfg);
        }
      });
      // Restore skill if present
      if (snap.skill) {
        currentSkillRef.value = snap.skill as SkillType;
      }
      // Rebuild DOM from slotConfigs
      const nodes = buildSlotNodes(snap.slotConfigs);
      nodes.forEach(node => {
        editable.appendChild(node);
      });
      // Re-render skill from the snapshot rather than the current prop.
      renderSkill(snap.skill as SkillType | undefined, true);
      // Need to sync slotValues for content slots that may have been updated via nodes
      // buildSlotNodes already set defaults, but ensure restored values are kept
      slotValues.value = { ...snap.slotValues };
      // Re-apply content slot innerText from slotValues (buildSlotNodes for content uses slotValues)
      snap.slotConfigs.forEach(cfg => {
        if (cfg.type === "content" && (cfg as any).key) {
          const dom = slotDomMap.value.get((cfg as any).key);
          if (dom) {
            dom.innerText = stringifyValue(slotValues.value[(cfg as any).key]);
          }
        }
      });
      triggerValueChange();
      // Restore cursor after DOM rebuild - defer to nextTick to ensure DOM is ready
      const cursorToRestore =
        overrideCursor !== undefined ? overrideCursor : snap.cursor;
      void nextTick(() => {
        restoreSelectionSnapshot(cursorToRestore ?? snap.cursor);
        isRestoringHistory = false;
      });
    };

    // 全量快照：undo 直接指针--，撤销应回到操作前的光标（cur.beforeCursor），而非 prev 的 after
    const handleUndo = () => {
      if (historyIndex <= 0) return false;
      const cur = historyStack[historyIndex]!;
      historyIndex--;
      const prev = historyStack[historyIndex]!;
      // 用 prev 的内容 + cur 的 beforeCursor（操作前）
      const cursorBefore = (cur as any).beforeCursor ?? cur.cursor;
      restoreSnapshot(prev, cursorBefore);
      return true;
    };

    const handleRedo = () => {
      if (historyIndex >= historyStack.length - 1) return false;
      historyIndex++;
      const next = historyStack[historyIndex]!;
      // redo 回到操作后的状态，光标为 after
      restoreSnapshot(next, next.cursor);
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
        return element.innerText || "";
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

      return element.innerText || "";
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

      childNodes.forEach(node => {
        const textValue = getNodeTextValue(node);
        textList.push(textValue);

        if (node.nodeType === Node.TEXT_NODE) {
          if (textValue) {
            currentSlotConfig.push({ type: "text", value: textValue });
          }
          return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const info = getNodeInfo(node as HTMLElement);
          if (!info) return;

          if (info.skillKey && currentSkillRef.value) {
            currentSkill = currentSkillRef.value;
          }

          if (info.slotKey && info.nodeType !== "nbsp") {
            const cfg = slotConfigMap.value.get(info.slotKey);
            if (cfg) {
              currentSlotConfig.push({
                ...cfg,
                value: textValue,
              } as SlotConfigType);
            }
          }
        }
      });

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

    const recordPendingEcho = <T,>(
      queue: PendingEcho<T>[],
      value: T,
      emittedAt: number,
      origin: "local" | "sync",
    ) => {
      if (origin === "sync") {
        queue.splice(0, queue.length, { value, emittedAt, origin });
        return;
      }
      // A real edit supersedes an unacknowledged prop-synchronization echo.
      for (let index = queue.length - 1; index >= 0; index--) {
        if (queue[index]?.origin === "sync") queue.splice(index, 1);
      }
      queue.push({ value, emittedAt, origin });
      if (queue.length > MAX_PENDING_ECHOES) queue.shift();
    };

    const triggerValueChange = (
      event?: Event,
      echoOrigin: "local" | "sync" = "local",
    ) => {
      const value = getEditorValue();
      const emittedAt = Date.now();
      recordPendingEcho(
        pendingEmittedSlotConfigs,
        value.slotConfig,
        emittedAt,
        echoOrigin,
      );
      recordPendingEcho(
        pendingEmittedSkills,
        value.skill,
        emittedAt,
        echoOrigin,
      );
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
      pendingBeforeCursor = captureSelectionSnapshot();
      slotValues.value = {
        ...slotValues.value,
        [key]: value,
      };

      const config = slotConfigMap.value.get(key);
      const dom = slotDomMap.value.get(key);
      if (config && dom && config.type !== "content") {
        renderSlot(config as any, dom);
      }

      triggerValueChange(event);
      pushHistory("slotValue", true);
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
      pendingBeforeCursor = captureSelectionSnapshot();
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
      if (triggerChange) pendingBeforeCursor = captureSelectionSnapshot();
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
        triggerValueChange(undefined, "sync");
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
      pendingBeforeCursor = captureSelectionSnapshot();
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
          pendingBeforeCursor = captureSelectionSnapshot();
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
          !!snapshot.skill ||
          snapshot.slotConfigs.some(config => config?.type !== "text"),
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
      const sel = getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const editable = editableRef.value;
      if (!editable || !editable.contains(range.commonAncestorContainer))
        return;
      if (pendingHistoryType === "insertFromPaste") return;
      const captureIfNeeded = () => {
        if (!pendingBeforeCursor)
          pendingBeforeCursor = captureSelectionSnapshot();
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
        isMod &&
        keyLower === "z"
      ) {
        event.preventDefault();
        if (event.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if (
        !senderCtx.value.readOnly &&
        !senderCtx.value.disabled &&
        editableFocused &&
        shouldUseManagedHistory &&
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
      }
    };

    const onInternalCompositionStart = () => {
      if (senderCtx.value.readOnly || senderCtx.value.disabled) return;
      isComposing.value = true;
      if (!hasManagedHistory()) return;
      pendingBeforeCursor = captureSelectionSnapshot();
      pendingHistoryType = "insertCompositionText";
    };
    const onInternalCompositionEnd = () => {
      isComposing.value = false;
      keyLock.value = false;
      if (senderCtx.value.readOnly || senderCtx.value.disabled) return;
      void nextTick(() => {
        if (pendingHistoryType === "insertCompositionText") {
          pushHistory("insertCompositionText", true);
        }
      });
    };

    const onInternalPaste = (event: ClipboardEvent) => {
      if (senderCtx.value.readOnly || senderCtx.value.disabled) return;
      event.preventDefault();
      const files = event.clipboardData?.files;
      const text = event.clipboardData?.getData("text/plain") ?? "";

      if (!text && files?.length && senderCtx.value.onPasteFile) {
        senderCtx.value.onPasteFile(files);
        return;
      }

      if (text) {
        if (!pendingBeforeCursor)
          pendingBeforeCursor = captureSelectionSnapshot();
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
      pendingBeforeCursor = captureSelectionSnapshot();
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
      pendingBeforeCursor = captureSelectionSnapshot();
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

    const consumePendingEcho = <T,>(queue: PendingEcho<T>[], value: T) => {
      while (queue[0] && Date.now() - queue[0].emittedAt > PENDING_ECHO_TTL) {
        queue.shift();
      }

      if (queue.length === 0) return false;
      const lastIndex = queue.length - 1;
      let matchIndex = -1;
      // Preserve ordinary delayed echoes in FIFO order.
      if (isEquivalentValue(value, queue[0]!.value)) {
        matchIndex = 0;
      } else if (isEquivalentValue(value, queue[lastIndex]!.value)) {
        // A debounced parent may echo only the newest operation. Consume the
        // skipped intermediate echoes together, but never match an older
        // value while newer local operations are still pending.
        matchIndex = lastIndex;
      }
      if (matchIndex < 0) return false;
      queue.splice(0, matchIndex + 1);
      return true;
    };

    const isEmittedSlotConfig = (
      configs: readonly SlotConfigType[] | undefined,
    ) => consumePendingEcho(pendingEmittedSlotConfigs, configs);

    const isEmittedSkill = (skill: SkillType | undefined) =>
      consumePendingEcho(pendingEmittedSkills, skill);

    const initHistoryStack = () => {
      const initVersion = ++historyInitVersion;
      historyStack = [];
      historyIndex = -1;
      isManagedHistoryActive = slotDomMap.value.size > 0 || !!skillDomRef.value;
      pendingHistoryType = null;
      void nextTick(() => {
        if (initVersion !== historyInitVersion) return;
        // Skip if insert/clear already seeded managed history in this tick.
        if (historyStack.length > 0) return;
        // 推入初始全量快照作为基线
        pushHistory("init", true);
      });
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
        if (isEmittedSlotConfig(configs)) {
          lastSlotConfigRef.value = configs;
          return;
        }
        if (isRestoringHistory) {
          lastSlotConfigRef.value = configs;
          return;
        }
        // Reset is a new baseline - clear history unless it's from undo/redo restore
        pendingEmittedSlotConfigs.length = 0;
        applySlotConfig(configs);
        initHistoryStack();
      },
      { immediate: true },
    );

    watch(
      () => senderCtx.value.skill,
      skill => {
        if (isEmittedSkill(skill)) {
          lastSkillRef.value = skill;
          return;
        }
        if (isRestoringHistory) {
          lastSkillRef.value = skill;
          return;
        }
        if (skill === lastSkillRef.value && skillDomRef.value) {
          return;
        }
        pendingEmittedSkills.length = 0;
        lastSkillRef.value = skill;
        renderSkill();
        initHistoryStack();
        void nextTick(() => {
          triggerValueChange(undefined, "sync");
        });
      },
      { immediate: true },
    );

    watch(
      () => [senderCtx.value.readOnly, senderCtx.value.disabled] as const,
      ([readOnly, disabled]) => {
        const editable = !(readOnly || disabled);
        slotConfigMap.value.forEach((config, key) => {
          if (config.type === "content") {
            const dom = slotDomMap.value.get(key);
            dom?.setAttribute("contenteditable", editable ? "true" : "false");
          }
        });
        if (currentSkillRef.value) {
          renderSkill(currentSkillRef.value as any, true);
          updateSkillEmptyStatus();
        }
        // switching to readOnly/disabled should not leave stale pending history
        if (readOnly || disabled) {
          pendingHistoryType = null;
          pendingBeforeCursor = null;
          isComposing.value = false;
          keyLock.value = false;
        }
      },
    );

    onBeforeUnmount(() => {
      pendingHistoryType = null;
      pendingBeforeCursor = null;
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
            // blur mid-composition without compositionend (e.g. IME cancelled) should not leave stale pending
            if (isComposing.value) {
              isComposing.value = false;
              pendingHistoryType = null;
              pendingBeforeCursor = null;
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
