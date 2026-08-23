import type { Node as ProseMirrorNode } from "prosemirror-model";
import type { Command, Transaction } from "prosemirror-state";
import type { NodeView } from "prosemirror-view";
import type { CSSProperties } from "vue";

import { classNames } from "@v-c/util";
import { Dropdown, Input } from "antdv-next";
import { baseKeymap } from "prosemirror-commands";
import { closeHistory, history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { Fragment, Slice } from "prosemirror-model";
import { EditorState, NodeSelection, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  render,
  watch,
} from "vue";

import type {
  InsertPosition,
  SenderCopyInfo,
  SkillType,
  SlotConfigType,
} from "../interface";

import { useSenderContext } from "../context";
import {
  collectDefinitions,
  createDocument,
  documentToResult,
  isEquivalentDocument,
  senderSchema,
  stringifyValue,
} from "./prosemirror/model";
import { HistoryValueStore, isSameValue } from "./prosemirror/value";
import Skill from "./Skill";

const SILENT_META = "senderSilent";
const InputControl = Input as unknown as import("vue").DefineComponent<
  Record<string, unknown>,
  Record<string, unknown>,
  unknown
>;

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

type ManagedNodeView = NodeView & { refresh: () => void };

export default defineComponent({
  name: "SlotTextArea",
  setup(_, { expose }) {
    const senderCtx = useSenderContext();
    const editableRef = ref<HTMLDivElement>();
    const prefixCls = computed(
      () => senderCtx.value.prefixCls || "antd-sender",
    );
    const definitions = new Map<string, SlotConfigType>();
    const skills = new Map<string, SkillType>();
    const values = new HistoryValueStore();
    const managedNodeViews = new Set<ManagedNodeView>();
    const cancelCompositionHandlers = new Set<() => void>();
    let editorView: EditorView | null = null;
    let restoreControlKey: string | null = null;
    let managedHistoryActive = !!(
      senderCtx.value.skill?.value ||
      senderCtx.value.slotConfig?.some(config => config.type !== "text")
    );
    let lastEditOwner: "control" | "outer" | null = null;
    let closeGroupAfterInput = false;
    let controlledConfigs = senderCtx.value.slotConfig;
    let controlledSkill = senderCtx.value.skill;

    const getAutoSizeStyle = (): CSSProperties => {
      const autoSize = senderCtx.value.autoSize;
      if (!autoSize) return {};
      const lineHeight = 22;
      if (autoSize === true) {
        return {
          minHeight: `${lineHeight}px`,
          overflowY: undefined,
        };
      }
      return {
        minHeight: autoSize.minRows
          ? `${autoSize.minRows * lineHeight}px`
          : undefined,
        maxHeight: autoSize.maxRows
          ? `${autoSize.maxRows * lineHeight}px`
          : undefined,
        overflowY: autoSize.maxRows ? "auto" : undefined,
      };
    };

    const mergeInputStyle = computed<CSSProperties>(() => ({
      ...senderCtx.value.styles?.input,
      ...getAutoSizeStyle(),
    }));

    const isLocked = () =>
      !!(senderCtx.value.readOnly || senderCtx.value.disabled);

    const flushDom = () => {
      (editorView as any)?.domObserver?.flush?.();
    };

    const getValue = () => {
      flushDom();
      if (!editorView) return { value: "", slotConfig: [] };
      return documentToResult(
        editorView.state.doc,
        values,
        definitions,
        skills,
      );
    };

    const triggerValueChange = (event?: Event) => {
      const value = getValue();
      senderCtx.value.onChange?.(
        value.value,
        event,
        value.slotConfig,
        value.skill,
      );
      senderCtx.value.setSubmitDisabled?.(
        !value.value && value.slotConfig.length === 0 && !value.skill,
      );
    };

    const refreshNodeViews = () => {
      managedNodeViews.forEach(nodeView => nodeView.refresh());
    };

    const findNodePosition = (key: string, type?: string) => {
      if (!editorView) return null;
      let result: number | null = null;
      editorView.state.doc.descendants((node, pos) => {
        if (
          result === null &&
          node.attrs.key === key &&
          (!type || node.attrs.type === type)
        ) {
          result = pos;
          return false;
        }
        return result === null;
      });
      return result;
    };

    const restoreSelectedControl = () => {
      if (!editorView) return false;
      const selection = editorView.state.selection;
      const selectedNode =
        selection instanceof NodeSelection &&
        selection.node.type === senderSchema.nodes.slot &&
        selection.node.attrs.type === "input"
          ? selection.node
          : null;
      const key = restoreControlKey ?? (selectedNode?.attrs.key as string);
      if (!key) return false;
      const pos = findNodePosition(key, "input");
      const node = pos === null ? null : editorView.state.doc.nodeAt(pos);
      if (!node) return false;
      let cancelled = false;
      const cancel = () => {
        cancelled = true;
      };
      void nextTick(() => {
        if (cancelled) return;
        const slot = Array.from(
          editableRef.value?.querySelectorAll<HTMLElement>("[data-slot-key]") ??
            [],
        ).find(element => element.dataset.slotKey === key);
        const input = slot?.querySelector<HTMLInputElement>("input");
        if (!input) return;
        input.focus();
        if (
          typeof node.attrs.selectionStart === "number" &&
          typeof node.attrs.selectionEnd === "number"
        ) {
          input.setSelectionRange(
            Math.min(node.attrs.selectionStart, input.value.length),
            Math.min(node.attrs.selectionEnd, input.value.length),
            node.attrs.selectionDirection,
          );
        }
        restoreControlKey = null;
      });
      onBeforeUnmount(cancel);
      return true;
    };

    const syncDocumentEmptyState = () => {
      editorView?.dom.toggleAttribute(
        "data-empty",
        editorView.state.doc.content.size === 0,
      );
    };

    const dispatchTransaction = (transaction: Transaction) => {
      if (!editorView) return;
      if (transaction.docChanged && !managedHistoryActive) {
        transaction.setMeta("addToHistory", false);
      }
      const nextState = editorView.state.apply(transaction);
      editorView.updateState(nextState);
      syncDocumentEmptyState();
      if (transaction.docChanged && !transaction.getMeta(SILENT_META)) {
        triggerValueChange(transaction.getMeta("uiEvent"));
      }
      if (transaction.docChanged) {
        refreshNodeViews();
      }
    };

    const dispatchSilent = (transaction: Transaction) => {
      transaction.setMeta("addToHistory", false);
      transaction.setMeta(SILENT_META, true);
      editorView?.dispatch(transaction);
    };

    const closeManagedGroup = () => {
      if (!editorView || !managedHistoryActive) return;
      dispatchSilent(closeHistory(editorView.state.tr));
    };

    const selectManagedNode = (getPos: () => number | null) => {
      if (!editorView) return;
      const pos = getPos();
      if (pos === null) return;
      const selection = editorView.state.selection;
      if (selection instanceof NodeSelection && selection.from === pos) {
        return;
      }
      const transaction = closeHistory(
        editorView.state.tr.setSelection(
          NodeSelection.create(editorView.state.doc, pos),
        ),
      );
      dispatchSilent(transaction);
    };

    const recordControlSelection = (
      getPos: () => number | null,
      target: HTMLInputElement,
      breakGroup: boolean,
    ) => {
      if (!editorView) return;
      const pos = getPos();
      if (pos === null) return;
      const node = editorView.state.doc.nodeAt(pos);
      if (!node) return;
      const selectionStart = Math.min(
        target.selectionStart ?? 0,
        target.value.length,
      );
      const selectionEnd = Math.min(
        target.selectionEnd ?? selectionStart,
        target.value.length,
      );
      let transaction = editorView.state.tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        selectionStart,
        selectionEnd,
        selectionDirection: target.selectionDirection ?? "none",
      });
      transaction = transaction.setSelection(
        NodeSelection.create(transaction.doc, pos),
      );
      if (breakGroup) transaction = closeHistory(transaction);
      dispatchSilent(transaction);
    };

    const captureActiveControlSelection = () => {
      const input = document.activeElement;
      if (!(input instanceof HTMLInputElement)) return;
      const slot = input.closest<HTMLElement>("[data-slot-key]");
      const key = slot?.dataset.slotKey;
      if (!key) return;
      const pos = findNodePosition(key, "input");
      if (pos === null) return;
      recordControlSelection(() => pos, input, true);
    };

    const updateSlotValue = (
      getPos: () => number | null,
      value: unknown,
      event?: Event,
      control?: HTMLInputElement,
      force = false,
    ) => {
      if (!editorView || isLocked()) return;
      const pos = getPos();
      if (pos === null) return;
      const node = editorView.state.doc.nodeAt(pos);
      if (!node || (!force && values.isSame(node.attrs.valueId, value))) return;
      const attrs = {
        ...node.attrs,
        valueId: values.add(value),
        selectionStart: control?.selectionStart ?? node.attrs.selectionStart,
        selectionEnd: control?.selectionEnd ?? node.attrs.selectionEnd,
        selectionDirection:
          control?.selectionDirection ?? node.attrs.selectionDirection,
      };
      const transaction = editorView.state.tr.setNodeMarkup(
        pos,
        undefined,
        attrs,
      );
      if (control) {
        transaction.setSelection(NodeSelection.create(transaction.doc, pos));
      }
      transaction.setMeta("uiEvent", event);
      managedHistoryActive = true;
      lastEditOwner = "control";
      editorView.dispatch(transaction);
    };

    const runHistory = (
      command: Command,
      event?: Event,
      controlKey?: string,
    ) => {
      if (!editorView || isLocked() || !managedHistoryActive) return false;
      const previousControlValueId = controlKey
        ? (() => {
            const pos = findNodePosition(controlKey, "input");
            return pos === null
              ? undefined
              : editorView?.state.doc.nodeAt(pos)?.attrs.valueId;
          })()
        : undefined;
      const handled = command(
        editorView.state,
        editorView.dispatch,
        editorView,
      );
      event?.preventDefault();
      if (handled) {
        if (controlKey) {
          const pos = findNodePosition(controlKey, "input");
          const nextControlValueId =
            pos === null
              ? undefined
              : editorView.state.doc.nodeAt(pos)?.attrs.valueId;
          restoreControlKey =
            previousControlValueId !== nextControlValueId ? controlKey : null;
        }
        if (!restoreSelectedControl()) {
          restoreControlKey = null;
          editorView.focus();
        }
      }
      return handled || !!event;
    };

    const routePasteEvent = (event: ClipboardEvent) => {
      const files = event.clipboardData?.files;
      const text = event.clipboardData?.getData("text/plain");
      if (!text && files?.length && senderCtx.value.onPasteFile) {
        event.preventDefault();
        senderCtx.value.onPasteFile(files);
        return true;
      }
      return false;
    };

    const getSelectionSlice = () => {
      if (!editorView) return null;
      const { from, to } = editorView.state.selection;
      if (from === to) return null;
      try {
        return editorView.state.doc.slice(from, to);
      } catch {
        return null;
      }
    };

    const sliceToCopyPayload = (
      slice: Slice,
    ): {
      slotConfig: SlotConfigType[];
      skill?: SkillType;
      value: string;
      text: string;
    } => {
      const fragment = slice.content;
      const nodes: ProseMirrorNode[] = [];
      fragment.forEach(node => nodes.push(node));
      // Slice content is a fragment of inline nodes — build a temporary doc for documentToResult
      const tempDoc = senderSchema.nodes.doc!.create(
        undefined,
        Fragment.from(nodes),
      );
      const result = documentToResult(tempDoc, values, definitions, skills);
      // documentToResult returns {value, slotConfig, skill} — map value -> text for copy payload
      return {
        slotConfig: result.slotConfig,
        skill: result.skill,
        value: result.value,
        text: result.value,
      };
    };

    const handleCopyOrCut = (
      event: ClipboardEvent,
      type: "copy" | "cut",
    ): boolean => {
      if (!editorView) return false;
      const slice = getSelectionSlice();
      let payload: {
        slotConfig: SlotConfigType[];
        skill?: SkillType;
        value: string;
        text: string;
      } | null = null;
      let payloadText = "";
      if (slice) {
        const sliced = sliceToCopyPayload(slice);
        payload = {
          ...sliced,
          value: sliced.text,
          text: sliced.text,
        };
        payloadText = payload.text;
      } else {
        payloadText = window.getSelection()?.toString() ?? "";
        payload = {
          slotConfig: [],
          skill: undefined,
          value: payloadText,
          text: payloadText,
        };
      }
      const info: SenderCopyInfo = {
        value: payload.value,
        slotConfig: payload.slotConfig,
        skill: payload.skill,
        text: payloadText,
      };
      const handler =
        type === "copy" ? senderCtx.value.onCopy : senderCtx.value.onCut;
      handler?.(event, info);
      if (event.defaultPrevented) return true;
      if (type === "copy" && !slice && !payloadText) return false;
      try {
        event.clipboardData?.setData("text/plain", payloadText);
      } catch {
        // Some browsers restrict clipboard writes. The consumer can take over
        // by preventing the event and writing its own payload in the callback.
      }
      if (type === "cut" && isLocked()) return true;
      if (type === "cut" && slice) {
        flushDom();
        syncSelectionFromDom();
        const sel = editorView.state.selection;
        const hasRange = sel.from !== sel.to;
        let delFrom = sel.from;
        let delTo = sel.to;
        if (!hasRange) {
          const nativeSel = window.getSelection();
          const range = nativeSel?.rangeCount ? nativeSel.getRangeAt(0) : null;
          const coversDomAll =
            !!range &&
            !range.collapsed &&
            editorView.dom.contains(range.commonAncestorContainer);
          if (coversDomAll) {
            delFrom = 0;
            delTo = editorView.state.doc.content.size;
          } else {
            return false;
          }
        }
        if (delFrom !== delTo) {
          managedHistoryActive = true;
          closeManagedGroup();
          editorView.dispatch(editorView.state.tr.delete(delFrom, delTo));
          closeManagedGroup();
          lastEditOwner = "outer";
        }
      } else if (type === "cut" && !slice) {
        const nativeSel = window.getSelection();
        if (!nativeSel) return false;
        const range = nativeSel.rangeCount ? nativeSel.getRangeAt(0) : null;
        const coversDomAll =
          !!range &&
          !range.collapsed &&
          editorView.dom.contains(range.commonAncestorContainer);
        if (coversDomAll && payloadText) {
          flushDom();
          syncSelectionFromDom();
          managedHistoryActive = true;
          closeManagedGroup();
          editorView.dispatch(
            editorView.state.tr.delete(0, editorView.state.doc.content.size),
          );
          closeManagedGroup();
          lastEditOwner = "outer";
        }
      }
      return type === "copy";
    };

    const routePasteCallback = (event: ClipboardEvent): boolean => {
      const text = event.clipboardData?.getData("text/plain") ?? "";
      senderCtx.value.onPaste?.(event, {
        text,
        slotConfig: [],
        skill: undefined,
      });
      return event.defaultPrevented;
    };
    const createSlotNodeView = (
      initialNode: ProseMirrorNode,
      _view: EditorView,
      getPos: () => number | undefined,
    ): ManagedNodeView => {
      let node = initialNode;
      let isComposing = false;
      let pendingValue: unknown;
      let hasPendingValue = false;
      let receivedBeforeInput = false;
      const dom = document.createElement("span");
      dom.contentEditable = "false";
      const cancelComposition = () => {
        isComposing = false;
        pendingValue = undefined;
        hasPendingValue = false;
        receivedBeforeInput = false;
      };
      cancelCompositionHandlers.add(cancelComposition);

      const resolvePos = () => {
        const pos = getPos();
        return typeof pos === "number" ? pos : null;
      };

      const commitValue = (
        value: unknown,
        event?: Event,
        control?: HTMLInputElement,
        force = false,
      ) => {
        if (isComposing) {
          pendingValue = value;
          hasPendingValue = true;
          return;
        }
        updateSlotValue(resolvePos, value, event, control, force);
      };

      const handleHistoryKey = (event: KeyboardEvent) => {
        const modifier = event.ctrlKey || event.metaKey;
        if (!modifier) return false;
        const key = event.key.toLowerCase();
        if (key !== "z" && key !== "y") return false;
        const command = key === "y" || event.shiftKey ? redo : undo;
        return runHistory(command, event, node.attrs.key);
      };

      const routeControlCopyOrCut = (
        event: ClipboardEvent,
        type: "copy" | "cut",
      ) => {
        const input = event.target as HTMLInputElement;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? start;
        const text = input.value.slice(start, end);
        const info: SenderCopyInfo = {
          value: text,
          slotConfig: [],
          skill: undefined,
          text,
        };
        const handler =
          type === "copy" ? senderCtx.value.onCopy : senderCtx.value.onCut;
        handler?.(event, info);
      };

      const refresh = () => {
        const config = definitions.get(node.attrs.key);
        if (!config) return;
        dom.dataset.slotKey = node.attrs.key;
        dom.dataset.nodeType = "slot";
        dom.className = `${prefixCls.value}-slot`;
        const rawValue = values.read(node.attrs.valueId);
        let child: unknown = null;

        if (config.type === "input") {
          child = (
            <InputControl
              class={`${prefixCls.value}-slot-input`}
              placeholder={config.props?.placeholder}
              value={stringifyValue(rawValue)}
              size="small"
              variant="borderless"
              readonly={senderCtx.value.readOnly}
              disabled={senderCtx.value.disabled}
              onFocus={(event: FocusEvent) => {
                const input = event.target as HTMLInputElement;
                selectManagedNode(resolvePos);
                recordControlSelection(resolvePos, input, true);
              }}
              onBeforeinput={(event: InputEvent) => {
                const input = event.target as HTMLInputElement;
                if (
                  event.inputType === "historyUndo" ||
                  event.inputType === "historyRedo"
                ) {
                  runHistory(
                    event.inputType === "historyUndo" ? undo : redo,
                    event,
                    node.attrs.key,
                  );
                  return;
                }
                receivedBeforeInput = true;
                recordControlSelection(resolvePos, input, false);
              }}
              onSelect={(event: Event) => {
                recordControlSelection(
                  resolvePos,
                  event.target as HTMLInputElement,
                  true,
                );
              }}
              onKeydown={(event: KeyboardEvent) => {
                if (senderCtx.value.onKeyDown?.(event) === false) return;
                if (handleHistoryKey(event)) return;
                if (!event.isComposing && shouldSubmit(event)) {
                  event.preventDefault();
                  senderCtx.value.triggerSend?.();
                }
              }}
              onKeyup={(event: KeyboardEvent) => {
                senderCtx.value.onKeyUp?.(event);
              }}
              onPaste={(event: ClipboardEvent) => {
                const text = event.clipboardData?.getData("text/plain") ?? "";
                const info = { text, slotConfig: [], skill: undefined };
                senderCtx.value.onPaste?.(event, info);
                if (!event.defaultPrevented) routePasteEvent(event);
              }}
              onCopy={(event: ClipboardEvent) => {
                routeControlCopyOrCut(event, "copy");
              }}
              onCut={(event: ClipboardEvent) => {
                routeControlCopyOrCut(event, "cut");
              }}
              onCompositionstart={() => {
                isComposing = true;
                pendingValue = undefined;
                hasPendingValue = false;
              }}
              onCompositionend={(event: CompositionEvent) => {
                isComposing = false;
                const input = event.target as HTMLInputElement;
                commitValue(
                  hasPendingValue ? pendingValue : input.value,
                  event,
                  input,
                  false,
                );
                pendingValue = undefined;
                hasPendingValue = false;
              }}
              onChange={(event: Event) => {
                const input = event.target as HTMLInputElement;
                if (!receivedBeforeInput && !isComposing) closeManagedGroup();
                commitValue(input.value, event, input);
                if (!receivedBeforeInput && !isComposing) closeManagedGroup();
                receivedBeforeInput = false;
              }}
            />
          );
        } else if (config.type === "select") {
          const displayValue = stringifyValue(rawValue);
          child = (
            <Dropdown
              disabled={isLocked()}
              trigger={["click"]}
              menu={{
                items: (config.props?.options ?? []).map(option => ({
                  label: option,
                  key: option,
                })),
                selectable: true,
                selectedKeys: displayValue ? [displayValue] : [],
                onSelect: ({ key, domEvent }: any) => {
                  commitValue(key, domEvent as Event);
                },
              }}
            >
              <span
                class={classNames([
                  `${prefixCls.value}-slot-select`,
                  { placeholder: !displayValue },
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
        } else if (config.type === "tag") {
          child = (
            <span class={`${prefixCls.value}-slot-tag`}>
              {config.props?.label ?? config.props?.value ?? ""}
            </span>
          );
        } else if (config.type === "custom") {
          child = config.customRender?.(
            rawValue,
            (nextValue: unknown) =>
              commitValue(nextValue, undefined, undefined, true),
            {
              disabled: senderCtx.value.disabled,
              readOnly: senderCtx.value.readOnly,
            },
            config,
          );
        }
        render(child as Parameters<typeof render>[0], dom);
      };

      dom.addEventListener("compositionstart", () => {
        if (node.attrs.type !== "custom") return;
        const pos = resolvePos();
        if (pos === null) return;
        isComposing = true;
        pendingValue = undefined;
        hasPendingValue = false;
      });
      dom.addEventListener("compositionend", event => {
        if (node.attrs.type !== "custom") return;
        const pos = resolvePos();
        if (pos === null) {
          isComposing = false;
          pendingValue = undefined;
          hasPendingValue = false;
          return;
        }
        isComposing = false;
        if (hasPendingValue) {
          updateSlotValue(resolvePos, pendingValue, event, undefined, true);
        }
        pendingValue = undefined;
        hasPendingValue = false;
      });

      const nodeView: ManagedNodeView = {
        dom,
        refresh,
        update(nextNode) {
          if (nextNode.type !== node.type) return false;
          node = nextNode;
          refresh();
          return true;
        },
        stopEvent: () => true,
        ignoreMutation: () => true,
        destroy() {
          cancelCompositionHandlers.delete(cancelComposition);
          managedNodeViews.delete(nodeView);
          render(null, dom);
        },
      };
      managedNodeViews.add(nodeView);
      refresh();
      return nodeView;
    };

    const createContentNodeView = (
      initialNode: ProseMirrorNode,
    ): ManagedNodeView => {
      let node = initialNode;
      const dom = document.createElement("span");
      const before = document.createElement("span");
      const contentDOM = document.createElement("span");
      const after = document.createElement("span");
      dom.append(before, contentDOM, after);

      const refresh = () => {
        const config = definitions.get(node.attrs.key);
        dom.dataset.contentKey = node.attrs.key;
        before.dataset.slotKey = node.attrs.key;
        before.dataset.nodeType = "nbsp";
        before.className = `${prefixCls.value}-slot-before ${prefixCls.value}-slot-no-width`;
        before.textContent = "\u00A0";
        after.dataset.slotKey = node.attrs.key;
        after.dataset.nodeType = "nbsp";
        after.className = `${prefixCls.value}-slot-after ${prefixCls.value}-slot-no-width`;
        after.textContent = "\u00A0";
        contentDOM.dataset.slotKey = node.attrs.key;
        contentDOM.dataset.nodeType = "slot";
        contentDOM.className = `${prefixCls.value}-slot-content`;
        contentDOM.dataset.placeholder =
          config?.type === "content" ? (config.props?.placeholder ?? "") : "";
        contentDOM.setAttribute(
          "contenteditable",
          isLocked() ? "false" : "true",
        );
      };

      const nodeView: ManagedNodeView = {
        dom,
        contentDOM,
        refresh,
        update(nextNode) {
          if (nextNode.type !== node.type) return false;
          node = nextNode;
          refresh();
          return true;
        },
        ignoreMutation(mutation) {
          return !contentDOM.contains(mutation.target);
        },
        destroy() {
          managedNodeViews.delete(nodeView);
        },
      };
      managedNodeViews.add(nodeView);
      refresh();
      return nodeView;
    };

    const createSkillNodeView = (
      initialNode: ProseMirrorNode,
      _view: EditorView,
      getPos: () => number | undefined,
    ): ManagedNodeView => {
      let node = initialNode;
      const dom = document.createElement("span");
      dom.contentEditable = "false";
      const resolvePos = () => {
        const pos = getPos();
        return typeof pos === "number" ? pos : null;
      };
      const refresh = () => {
        const skill = skills.get(node.attrs.value);
        if (!skill) return;
        dom.dataset.skillKey = node.attrs.value;
        dom.dataset.nodeType = "skill";
        dom.className = `${prefixCls.value}-skill`;
        dom.dataset.placeholder = senderCtx.value.placeholder ?? "";
        render(
          <Skill
            prefixCls={prefixCls.value}
            skill={skill}
            disabled={isLocked()}
            removeSkill={() => {
              if (!editorView || isLocked()) return;
              const pos = resolvePos();
              if (pos === null) return;
              const currentNode = editorView.state.doc.nodeAt(pos);
              if (
                !currentNode ||
                currentNode.type !== senderSchema.nodes.skill
              ) {
                return;
              }
              managedHistoryActive = true;
              closeManagedGroup();
              const transaction = editorView.state.tr.delete(
                pos,
                pos + currentNode.nodeSize,
              );
              transaction.setSelection(
                TextSelection.near(transaction.doc.resolve(pos)),
              );
              editorView.focus();
              editorView.dispatch(transaction);
              closeManagedGroup();
            }}
          />,
          dom,
        );
        const isEmptyDoc =
          !getValue().value &&
          getValue().slotConfig.length === 0 &&
          !!senderCtx.value.placeholder;
        // 旧逻辑：skillDom.hasChildNodes() 后永不在 skill 上显示 placeholder
        // PM 下 Skill 已 render，hasChildNodes() 为 true 时不应 skill-empty
        const shouldShowSkillPlaceholder = isEmptyDoc && !dom.hasChildNodes();
        dom.classList.toggle(
          `${prefixCls.value}-skill-empty`,
          shouldShowSkillPlaceholder,
        );
      };
      const nodeView: ManagedNodeView = {
        dom,
        refresh,
        update(nextNode) {
          if (nextNode.type !== node.type) return false;
          node = nextNode;
          refresh();
          return true;
        },
        stopEvent: () => true,
        ignoreMutation: () => true,
        destroy() {
          managedNodeViews.delete(nodeView);
          render(null, dom);
        },
      };
      managedNodeViews.add(nodeView);
      refresh();
      return nodeView;
    };

    const shouldSubmit = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return false;
      const modifier = event.ctrlKey || event.altKey || event.metaKey;
      const submitType = senderCtx.value.submitType ?? "enter";
      return (
        (submitType === "enter" && !event.shiftKey && !modifier) ||
        (submitType === "shiftEnter" && event.shiftKey && !modifier)
      );
    };

    const normalizeSkillText = () => {
      if (!editorView) return false;
      let changed = false;
      const nativeSelection = window.getSelection();
      const selectedOffset = nativeSelection?.anchorOffset ?? 0;
      let selectedSkill: { value: string; textLength: number } | null = null;
      editableRef.value
        ?.querySelectorAll<HTMLElement>("[data-skill-key]")
        .forEach(skillDom => {
          const textNodes = Array.from(skillDom.childNodes).filter(
            child => child.nodeType === Node.TEXT_NODE && child.textContent,
          );
          if (!textNodes.length) return;
          skillDom.classList.remove(`${prefixCls.value}-skill-empty`);
          selectedSkill = {
            value: skillDom.dataset.skillKey ?? "",
            textLength: textNodes.reduce(
              (length, child) => length + (child.textContent?.length ?? 0),
              0,
            ),
          };
          const reference = skillDom.nextSibling;
          textNodes.forEach(child => {
            editorView?.dom.insertBefore(child, reference);
          });
          changed = true;
        });
      if (changed) (editorView as any).domObserver?.flush?.();
      if (changed && selectedSkill) {
        const capturedSkill: { value: string; textLength: number } =
          selectedSkill;
        let selectionPosition: number | null = null;
        editorView.state.doc.descendants((node, pos) => {
          if (
            selectionPosition === null &&
            node.type === senderSchema.nodes.skill &&
            node.attrs.value === capturedSkill.value
          ) {
            selectionPosition = pos + node.nodeSize + capturedSkill.textLength;
            return false;
          }
          return selectionPosition === null;
        });
        if (selectionPosition !== null) {
          dispatchSilent(
            editorView.state.tr.setSelection(
              TextSelection.create(editorView.state.doc, selectionPosition),
            ),
          );
          const restoreNativeSelection = () => {
            const textNode = Array.from(editorView?.dom.childNodes ?? []).find(
              child => child.nodeType === Node.TEXT_NODE && child.textContent,
            );
            if (!textNode) return;
            const range = document.createRange();
            range.setStart(
              textNode,
              Math.min(selectedOffset, textNode.textContent?.length ?? 0),
            );
            range.collapse(true);
            nativeSelection?.removeAllRanges();
            nativeSelection?.addRange(range);
          };
          restoreNativeSelection();
          void nextTick(restoreNativeSelection);
        }
      }
      return changed;
    };

    const flushNativeInput = () => {
      normalizeSkillText();
      syncContentDom();
      (editorView as any)?.domObserver?.flush?.();
      if (closeGroupAfterInput) {
        closeGroupAfterInput = false;
        closeManagedGroup();
      }
      return true;
    };

    const syncContentDom = () => {
      if (!editorView) return false;
      let transaction = editorView.state.tr;
      const contents = Array.from(
        editableRef.value?.querySelectorAll<HTMLElement>(
          `.${prefixCls.value}-slot-content`,
        ) ?? [],
      );
      const updates: Array<{
        from: number;
        to: number;
        nodes: ProseMirrorNode[];
      }> = [];
      editorView.state.doc.descendants((node, pos) => {
        if (node.type !== senderSchema.nodes.contentSlot) return true;
        const content = contents.find(
          element => element.dataset.slotKey === node.attrs.key,
        );
        const value = content?.innerText ?? content?.textContent ?? "";

        // Serialize current node content for comparison
        const parts: string[] = [];
        node.forEach(child => {
          if (child.isText) {
            parts.push(child.text ?? "");
          } else if (child.type === senderSchema.nodes.hardBreak) {
            parts.push("\n");
          }
        });
        const currentValue = parts.join("");

        if (value !== currentValue) {
          // Convert value with \n into text + hardBreak nodes
          const newNodes: ProseMirrorNode[] = [];
          const lines = value.split("\n");
          lines.forEach((line, index) => {
            if (line) newNodes.push(senderSchema.text(line));
            if (index < lines.length - 1) {
              newNodes.push(senderSchema.nodes.hardBreak!.create());
            }
          });
          updates.push({
            from: pos + 1,
            to: pos + node.nodeSize - 1,
            nodes: newNodes,
          });
        }
        return false;
      });
      updates
        .sort((left, right) => right.from - left.from)
        .forEach(update => {
          transaction = transaction.replaceWith(
            update.from,
            update.to,
            update.nodes.length > 0 ? update.nodes : [],
          );
        });
      if (!transaction.docChanged) return false;
      editorView.dispatch(transaction);
      return true;
    };

    const syncSelectionFromDom = () => {
      if (!editorView) return;
      if (
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.closest("[data-node-type='slot']")
      ) {
        return;
      }
      const selection = window.getSelection();
      if (
        !selection?.anchorNode ||
        !selection.focusNode ||
        !editorView.dom.contains(selection.anchorNode) ||
        !editorView.dom.contains(selection.focusNode)
      ) {
        return;
      }
      try {
        const anchor = editorView.posAtDOM(
          selection.anchorNode,
          selection.anchorOffset,
        );
        const head = editorView.posAtDOM(
          selection.focusNode,
          selection.focusOffset,
        );
        if (
          anchor !== editorView.state.selection.anchor ||
          head !== editorView.state.selection.head
        ) {
          dispatchSilent(
            editorView.state.tr.setSelection(
              TextSelection.create(editorView.state.doc, anchor, head),
            ),
          );
        }
      } catch {
        // Synthetic DOM edits can temporarily point outside the parsed model.
        // Position calculation errors are logged but don't prevent execution.
        if (typeof console !== "undefined" && console.warn) {
          console.warn(
            "SlotTextArea: syncSelectionFromDom position calculation failed",
          );
        }
      }
    };

    const handleSyntheticDeletion = (event: KeyboardEvent) => {
      if (!editorView || isLocked()) return false;
      if (event.key !== "Backspace" && event.key !== "Delete") return false;
      const nativeRange = window.getSelection()?.rangeCount
        ? window.getSelection()!.getRangeAt(0)
        : null;
      const startContent =
        nativeRange?.startContainer.parentElement?.closest<HTMLElement>(
          `.${prefixCls.value}-slot-content`,
        );
      const endContent =
        nativeRange?.endContainer.parentElement?.closest<HTMLElement>(
          `.${prefixCls.value}-slot-content`,
        );
      if (
        nativeRange &&
        !nativeRange.collapsed &&
        startContent &&
        startContent === endContent
      ) {
        const pos = findNodePosition(startContent.dataset.slotKey ?? "");
        if (pos !== null) {
          const contentNode = editorView.state.doc.nodeAt(pos);
          if (
            contentNode &&
            contentNode.type === senderSchema.nodes.contentSlot
          ) {
            const maxOffset = contentNode.content.size;
            const from = pos + 1 + Math.min(nativeRange.startOffset, maxOffset);
            const to = pos + 1 + Math.min(nativeRange.endOffset, maxOffset);
            if (from <= to && to <= pos + contentNode.nodeSize - 1) {
              event.preventDefault();
              const transaction = editorView.state.tr.delete(from, to);
              transaction.setSelection(
                TextSelection.near(transaction.doc.resolve(from)),
              );
              editorView.dispatch(transaction);
              return true;
            }
          }
        }
      }
      syncSelectionFromDom();
      const { selection } = editorView.state;
      let from = selection.from;
      let to = selection.to;
      if (selection.empty) {
        if (event.key === "Backspace" && from > 0) {
          const before = selection.$from.nodeBefore;
          // Text nodes should delete one character, atomic slots/skills delete whole node
          from -= before?.isText ? 1 : (before?.nodeSize ?? 1);
        } else if (
          event.key === "Delete" &&
          to < editorView.state.doc.content.size
        ) {
          const after = selection.$to.nodeAfter;
          to += after?.isText ? 1 : (after?.nodeSize ?? 1);
        } else {
          return false;
        }
      }
      event.preventDefault();
      const transaction = editorView.state.tr.delete(from, to);
      transaction.setSelection(
        TextSelection.near(transaction.doc.resolve(from)),
      );
      editorView.dispatch(transaction);
      return true;
    };

    const createPlugins = () => [
      history({ newGroupDelay: 500 }),
      keymap({
        "Mod-z": undo,
        "Shift-Mod-z": redo,
        "Mod-y": redo,
      }),
      keymap(baseKeymap),
    ];

    const applyControlledState = () => {
      if (!editorView) return;
      const configs = senderCtx.value.slotConfig;
      const skill = senderCtx.value.skill;
      const configsChanged = configs !== controlledConfigs;
      const skillChanged = skill !== controlledSkill;
      if (!configsChanged && !skillChanged) return;
      controlledConfigs = configs;
      controlledSkill = skill;
      if (skill?.value || configs?.some(config => config.type !== "text")) {
        managedHistoryActive = true;
      }
      if (skill?.value) skills.set(skill.value, skill);
      // Skill-only external change must not clobber locally edited slots
      // (demo keeps slotConfig as static template while skill is controlled).
      // If slotConfig reference is unchanged, patch skill node incrementally.
      if (!configsChanged && skillChanged) {
        collectDefinitions(definitions, configs);
        const doc = editorView.state.doc;
        const hasSkill = doc.firstChild?.type === senderSchema.nodes.skill;
        const currentSkillValue = hasSkill
          ? (doc.firstChild!.attrs.value as string | undefined)
          : undefined;
        const nextSkillValue = skill?.value;
        const currentSkillProps =
          hasSkill && currentSkillValue
            ? skills.get(currentSkillValue)
            : undefined;
        const skillPropsChanged =
          currentSkillValue === nextSkillValue &&
          skill &&
          currentSkillProps &&
          !isSameValue(currentSkillProps, skill);
        if (currentSkillValue !== nextSkillValue || skillPropsChanged) {
          let tr = editorView.state.tr;
          if (hasSkill) {
            tr = tr.delete(0, doc.firstChild!.nodeSize);
          }
          if (nextSkillValue) {
            const skillNode = senderSchema.nodes.skill!.create({
              value: nextSkillValue,
            });
            tr = tr.insert(0, skillNode);
          }
          tr.setMeta("addToHistory", false);
          tr.setMeta(SILENT_META, true);
          dispatchTransaction(tr);
        } else {
          refreshNodeViews();
        }
        return;
      }
      // 受控为空（Ctrl+A 全删后 demo 未驱动 slotConfig）时，不应把空 doc 误判为等效而跳过；
      // 需让本地删除的空文档保持为空，不被受控回声还原。
      const controlledEmpty =
        !skill?.value && (!configs || configs.length === 0);
      const docEmpty = editorView.state.doc.content.size === 0;
      if (controlledEmpty && docEmpty) {
        collectDefinitions(definitions, configs);
        refreshNodeViews();
        return;
      }
      collectDefinitions(definitions, configs);
      const equivalent = isEquivalentDocument(
        editorView.state.doc,
        configs,
        skill,
        values,
        definitions,
      );
      if (equivalent) {
        refreshNodeViews();
        return;
      }
      const state = EditorState.create({
        schema: senderSchema,
        doc: createDocument(configs, skill, values),
        plugins: createPlugins(),
      });
      editorView.updateState(state);
      syncDocumentEmptyState();
      void nextTick(() => triggerValueChange());
    };

    onMounted(() => {
      const root = editableRef.value;
      if (!root) return;
      const rangePrototype = Range.prototype as any;
      if (!rangePrototype.getClientRects) {
        rangePrototype.getClientRects = () => [];
      }
      if (!rangePrototype.getBoundingClientRect) {
        rangePrototype.getBoundingClientRect = () => ({
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          width: 0,
          height: 0,
        });
      }
      collectDefinitions(definitions, senderCtx.value.slotConfig);
      if (senderCtx.value.skill?.value) {
        skills.set(senderCtx.value.skill.value, senderCtx.value.skill);
      }
      const state = EditorState.create({
        schema: senderSchema,
        doc: createDocument(
          senderCtx.value.slotConfig,
          senderCtx.value.skill,
          values,
        ),
        plugins: createPlugins(),
      });
      editorView = new EditorView(
        { mount: root },
        {
          state,
          dispatchTransaction,
          editable: () => !isLocked(),
          nodeViews: {
            slot: createSlotNodeView,
            contentSlot: createContentNodeView,
            skill: createSkillNodeView,
          },
          attributes: {
            role: "textbox",
            tabindex: "0",
            spellcheck: "false",
          },
          handleDOMEvents: {
            focus: (_view, event) => {
              senderCtx.value.onFocus?.(event as FocusEvent);
              return false;
            },
            blur: (_view, event) => {
              cancelCompositionHandlers.forEach(cancel => cancel());
              senderCtx.value.onBlur?.(event as FocusEvent);
              return false;
            },
            beforeinput: (_view, rawEvent) => {
              const event = rawEvent as InputEvent;
              if (event.inputType === "historyUndo") {
                if (isLocked() || !managedHistoryActive) return true;
                return runHistory(undo, event);
              }
              if (event.inputType === "historyRedo") {
                if (isLocked() || !managedHistoryActive) return true;
                return runHistory(redo, event);
              }
              if (
                event.inputType.startsWith("format") ||
                [
                  "insertHorizontalRule",
                  "insertLink",
                  "insertOrderedList",
                  "insertUnorderedList",
                ].includes(event.inputType)
              ) {
                event.preventDefault();
                return true;
              }
              if (lastEditOwner === "control") closeManagedGroup();
              if (event.inputType === "insertFromPaste") {
                closeManagedGroup();
                closeGroupAfterInput = true;
              }
              lastEditOwner = "outer";
              syncSelectionFromDom();
              return false;
            },
            input: () => flushNativeInput(),
            keydown: (_view, rawEvent) => {
              const event = rawEvent as KeyboardEvent;
              const result = senderCtx.value.onKeyDown?.(event);
              if (result === false) return true;
              if (event.isComposing) return false;
              const modifier = event.ctrlKey || event.metaKey;
              const key = event.key.toLowerCase();
              if (modifier && (key === "z" || key === "y")) {
                if (isLocked() || !managedHistoryActive) return true;
                return runHistory(
                  key === "y" || event.shiftKey ? redo : undo,
                  event,
                );
              }
              if (handleSyntheticDeletion(event)) return true;
              // Handle Enter key in content slots to insert hardBreak
              if (
                event.key === "Enter" &&
                !shouldSubmit(event) &&
                editorView &&
                !isLocked()
              ) {
                const { selection } = editorView.state;
                const $pos = selection.$from;
                const parent = $pos.parent;
                // Check if we're inside a contentSlot
                if (parent.type === senderSchema.nodes.contentSlot) {
                  event.preventDefault();
                  const tr = editorView.state.tr.replaceSelectionWith(
                    senderSchema.nodes.hardBreak!.create(),
                  );
                  editorView.dispatch(tr);
                  return true;
                }
              }
              if (shouldSubmit(event)) {
                event.preventDefault();
                senderCtx.value.triggerSend?.();
                return true;
              }
              return false;
            },
            keyup: (_view, event) => {
              senderCtx.value.onKeyUp?.(event as KeyboardEvent);
              return false;
            },
            copy: (_view, event) => {
              const handled = handleCopyOrCut(event as ClipboardEvent, "copy");
              if (handled) event.preventDefault();
              return handled;
            },
            paste: (_view, event) => {
              const clipboardEvent = event as ClipboardEvent;
              if (routePasteCallback(clipboardEvent)) return true;
              if (isLocked()) {
                clipboardEvent.preventDefault();
                return true;
              }
              const text = clipboardEvent.clipboardData?.getData("text/plain");
              if (routePasteEvent(clipboardEvent)) return true;
              if (text !== undefined) {
                clipboardEvent.preventDefault();
                flushDom();
                syncSelectionFromDom();
                managedHistoryActive = true;
                closeManagedGroup();
                editorView?.dispatch(editorView.state.tr.insertText(text));
                closeManagedGroup();
                lastEditOwner = "outer";
                return true;
              }
              return false;
            },
            cut: (_view, event) => {
              handleCopyOrCut(event as ClipboardEvent, "cut");
              event.preventDefault();
              return true;
            },
          },
        },
      );
      syncDocumentEmptyState();
      triggerValueChange();
    });

    watch(
      () => [senderCtx.value.slotConfig, senderCtx.value.skill] as const,
      () => applyControlledState(),
    );

    watch(
      () => [
        senderCtx.value.readOnly,
        senderCtx.value.disabled,
        senderCtx.value.placeholder,
      ],
      () => {
        if (!editorView) return;
        editorView.setProps({ editable: () => !isLocked() });
        refreshNodeViews();
      },
    );

    const createNodes = (configs: readonly SlotConfigType[]) => {
      collectDefinitions(definitions, configs);
      const doc = createDocument(configs, undefined, values);
      return Array.from({ length: doc.childCount }, (_, index) =>
        doc.child(index),
      );
    };

    const insert: SlotTextAreaRef["insert"] = (
      configs,
      position: InsertPosition = "cursor",
      replaceCharacters,
      preventScroll,
    ) => {
      if (!editorView || isLocked() || !configs.length) return;
      const focusedInputKey =
        document.activeElement instanceof HTMLInputElement
          ? document.activeElement.closest<HTMLElement>("[data-slot-key]")
              ?.dataset.slotKey
          : undefined;
      captureActiveControlSelection();
      if (position === "cursor" && replaceCharacters) {
        const selection = window.getSelection();
        if (selection?.rangeCount) {
          const range = selection.getRangeAt(0);
          if (
            range.collapsed &&
            range.startContainer.nodeType === Node.TEXT_NODE
          ) {
            const textBefore =
              range.startContainer.textContent?.slice(0, range.startOffset) ??
              "";
            const searchLength = Math.min(
              replaceCharacters.length,
              textBefore.length,
            );
            const actualMatch = textBefore.slice(-searchLength);
            const expectedMatch = replaceCharacters.slice(-searchLength);
            if (actualMatch === expectedMatch) {
              range.setStart(
                range.startContainer,
                range.startOffset - searchLength,
              );
              range.deleteContents();
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }
      }
      flushDom();
      syncSelectionFromDom();
      managedHistoryActive = true;
      closeManagedGroup();
      let from = editorView.state.selection.from;
      let to = editorView.state.selection.to;
      const selectedNode =
        editorView.state.selection instanceof NodeSelection
          ? editorView.state.selection.node
          : null;
      if (
        position === "cursor" &&
        focusedInputKey &&
        selectedNode?.type === senderSchema.nodes.slot &&
        selectedNode.attrs.type === "input" &&
        focusedInputKey === selectedNode.attrs.key
      ) {
        from = to = editorView.state.selection.to;
      }
      if (position === "start") {
        const first = editorView.state.doc.firstChild;
        from = to =
          first?.type === senderSchema.nodes.skill ? first.nodeSize : 0;
      } else if (position === "end") {
        from = to = editorView.state.doc.content.size;
      }
      if (replaceCharacters && from === to) {
        if (
          editorView.state.doc.textBetween(
            from,
            Math.min(
              editorView.state.doc.content.size,
              from + replaceCharacters.length,
            ),
          ) === replaceCharacters
        ) {
          from += replaceCharacters.length;
          to = from;
        }
        const start = Math.max(0, from - replaceCharacters.length);
        if (
          editorView.state.doc.textBetween(start, from) === replaceCharacters
        ) {
          from = start;
        } else if (
          editorView.state.doc.textContent.endsWith(replaceCharacters)
        ) {
          to = editorView.state.doc.content.size;
          from = to - replaceCharacters.length;
        }
      }
      const nodes = createNodes(configs);
      if (!nodes.length) return;
      const transaction = editorView.state.tr.replaceWith(from, to, nodes);
      transaction.setSelection(
        TextSelection.near(
          transaction.doc.resolve(
            from + nodes.reduce((size, node) => size + node.nodeSize, 0),
          ),
        ),
      );
      editorView.focus();
      editorView.dispatch(transaction);
      closeManagedGroup();
      if (!preventScroll)
        editableRef.value?.scrollIntoView?.({ block: "nearest" });
    };

    const setCursor = (
      cursor: "start" | "end" | "all",
      preventScroll?: boolean,
    ) => {
      if (!editorView) return;
      const doc = editorView.state.doc;
      let selection;
      if (cursor === "all") {
        const from =
          doc.firstChild?.type === senderSchema.nodes.skill
            ? doc.firstChild.nodeSize
            : 0;
        selection = TextSelection.create(doc, from, doc.content.size);
      } else {
        const position =
          cursor === "start" &&
          doc.firstChild?.type === senderSchema.nodes.skill
            ? doc.firstChild.nodeSize
            : cursor === "start"
              ? 0
              : doc.content.size;
        selection = TextSelection.near(doc.resolve(position));
      }
      dispatchSilent(editorView.state.tr.setSelection(selection));
      editorView.focus();
      if (!preventScroll) {
        editorView.dom.scrollIntoView?.({ block: "nearest" });
      }
    };

    const focus: SlotTextAreaRef["focus"] = options => {
      if (!editorView) return;
      // When document is empty (only placeholder visible), default to start cursor
      const doc = editorView.state.doc;
      const isEmpty =
        doc.content.size === 0 ||
        (doc.content.size === doc.firstChild?.nodeSize &&
          doc.firstChild?.type === senderSchema.nodes.skill);
      const defaultCursor = isEmpty ? "start" : "end";
      const cursor = options?.cursor ?? defaultCursor;
      if (cursor !== "slot") {
        setCursor(cursor, options?.preventScroll);
        return;
      }
      const key = options?.key;
      const candidates = Array.from(
        editableRef.value?.querySelectorAll<HTMLElement>(
          "[data-slot-key][data-node-type='slot']",
        ) ?? [],
      );
      const dom = key
        ? candidates.find(element => element.dataset.slotKey === key)
        : candidates.find(
            element =>
              !!element.querySelector("input") ||
              element.classList.contains(`${prefixCls.value}-slot-content`),
          );
      const input = dom?.querySelector<HTMLInputElement>("input");
      if (input) input.focus({ preventScroll: options?.preventScroll });
      else if (dom?.classList.contains(`${prefixCls.value}-slot-content`)) {
        dom.focus({ preventScroll: options?.preventScroll });
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(dom);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
        syncSelectionFromDom();
        if (!options?.preventScroll) {
          dom.scrollIntoView?.({ block: "nearest" });
        }
      } else setCursor(defaultCursor, options?.preventScroll);
    };

    const clear: SlotTextAreaRef["clear"] = () => {
      if (!editorView || isLocked()) return;
      captureActiveControlSelection();
      flushDom();
      managedHistoryActive = true;
      closeManagedGroup();
      if (editorView.state.doc.content.size === 0) return;
      const transaction = editorView.state.tr.delete(
        0,
        editorView.state.doc.content.size,
      );
      transaction.setSelection(TextSelection.create(transaction.doc, 0));
      editorView.dispatch(transaction);
      closeManagedGroup();
    };

    expose<SlotTextAreaRef>({
      get nativeElement() {
        return editableRef.value ?? null;
      },
      focus,
      blur() {
        editorView?.dom.blur();
      },
      insert,
      clear,
      getValue,
    });

    onBeforeUnmount(() => {
      managedNodeViews.forEach(nodeView => nodeView.destroy?.());
      managedNodeViews.clear();
      editorView?.destroy();
      editorView = null;
    });

    return () => {
      const inputCls = `${prefixCls.value}-input`;
      return (
        <div
          ref={editableRef}
          class={classNames([
            inputCls,
            `${inputCls}-slot`,
            senderCtx.value.classNames?.input,
          ])}
          style={mergeInputStyle.value}
          data-placeholder={senderCtx.value.placeholder}
        />
      );
    };
  },
});
