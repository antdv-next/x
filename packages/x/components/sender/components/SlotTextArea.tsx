import { classNames } from "@v-c/util";
import { Dropdown, Input } from "antdv-next";
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  ref,
  render,
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
        senderCtx.value.readOnly ? "false" : "true",
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
        if (!config || config.type === "content") {
          return element.innerText || "";
        }

        const rawValue = slotValues.value[nodeInfo.slotKey];
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
              onKeydown={onInternalKeyDown}
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
    };

    const removeSkill = (triggerChange = true) => {
      const skillDom = skillDomRef.value;
      if (!skillDom) return;

      unmountDom(skillDom);
      skillDom.remove();
      skillDomRef.value = null;
      currentSkillRef.value = undefined;

      if (triggerChange) {
        triggerValueChange();
      }
    };

    const renderSkill = () => {
      const editable = editableRef.value;
      const skill = senderCtx.value.skill;
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
        !!senderCtx.value.placeholder;

      if (isEmpty) {
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
        triggerValueChange();
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

    const handleBackspaceDelete = (event: KeyboardEvent) => {
      const selection = getSelection();
      if (!selection || !selection.isCollapsed) return false;

      const editable = editableRef.value;
      if (!editable) return false;

      let anchorNode = selection.anchorNode;
      let offset = selection.anchorOffset;

      if (!anchorNode || !editable.contains(anchorNode)) {
        return false;
      }

      if (anchorNode === editable && offset > 0) {
        anchorNode = editable.childNodes[offset - 1] ?? anchorNode;
        offset = 0;
      }

      if (anchorNode.nodeType === Node.TEXT_NODE && offset > 0) {
        return false;
      }

      const target =
        anchorNode.nodeType === Node.TEXT_NODE
          ? (anchorNode.parentNode as HTMLElement | null)
          : (anchorNode as HTMLElement);

      const previous =
        target === editable
          ? editable.childNodes[Math.max(0, selection.anchorOffset - 1)]
          : target?.previousSibling;

      if (!(previous instanceof HTMLElement)) {
        return false;
      }

      const info = getNodeInfo(previous);
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

    const onInternalKeyDown = (event: KeyboardEvent) => {
      const eventRes = senderCtx.value.onKeyDown?.(event);
      if (eventRes === false || keyLock.value || isComposing.value) {
        return;
      }

      if (event.key === "Backspace" && handleBackspaceDelete(event)) {
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

    const onInternalInput = (event?: Event) => {
      removeSpecificBRs();
      triggerValueChange(event);
    };

    const onInternalPaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const files = event.clipboardData?.files;
      const text = event.clipboardData?.getData("text/plain") ?? "";

      if (!text && files?.length && senderCtx.value.onPasteFile) {
        senderCtx.value.onPasteFile(files);
        return;
      }

      if (text) {
        const selection = getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode(text.replace(/\u200B/g, ""));
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }

      onInternalInput(event);
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
      if (!editable || !slotConfig.length) return;

      mergeSlotConfig(slotConfig);
      const nodes = buildSlotNodes(slotConfig);
      if (!nodes.length) return;

      const insertContext = getRangeForInsert(position);
      if (!insertContext?.range) return;

      const { range, selection } = insertContext;
      editable.focus({ preventScroll });

      if (replaceCharacters) {
        const textBefore = getSelection()?.toString() ?? "";
        if (textBefore.endsWith(replaceCharacters)) {
          range.setStart(
            range.startContainer,
            Math.max(0, range.startOffset - replaceCharacters.length),
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
      clearEditor();
      renderSkill();
      onInternalInput();
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

    watch(
      () => editableRef.value,
      editable => {
        if (!editable) return;
        applySlotConfig(senderCtx.value.slotConfig, true);
      },
      { immediate: true },
    );

    watch(
      () => senderCtx.value.slotConfig,
      configs => {
        applySlotConfig(configs);
      },
      { immediate: true },
    );

    watch(
      () => senderCtx.value.skill,
      skill => {
        if (skill === lastSkillRef.value && skillDomRef.value) {
          return;
        }
        lastSkillRef.value = skill;
        renderSkill();
        void nextTick(() => {
          triggerValueChange();
        });
      },
      { immediate: true },
    );

    watch(
      () => senderCtx.value.readOnly,
      readOnly => {
        slotConfigMap.value.forEach((config, key) => {
          if (config.type === "content") {
            const dom = slotDomMap.value.get(key);
            dom?.setAttribute("contenteditable", readOnly ? "false" : "true");
          }
        });
      },
    );

    onBeforeUnmount(() => {
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
          contenteditable={!senderCtx.value.readOnly}
          spellcheck={false}
          onInput={onInternalInput}
          onKeydown={onInternalKeyDown}
          onKeyup={onInternalKeyUp}
          onPaste={onInternalPaste}
          onCut={onInternalInput}
          onSelect={onInternalSelect}
          onFocus={(e: FocusEvent) => {
            senderCtx.value.onFocus?.(e);
          }}
          onBlur={(e: FocusEvent) => {
            keyLock.value = false;
            senderCtx.value.onBlur?.(e);
          }}
          onCompositionstart={() => {
            isComposing.value = true;
          }}
          onCompositionend={() => {
            isComposing.value = false;
            keyLock.value = false;
          }}
        />
      );
    };
  },
});
