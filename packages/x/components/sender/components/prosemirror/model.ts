import type { Node as ProseMirrorNode } from "prosemirror-model";

import { Schema } from "prosemirror-model";

import type { SkillType, SlotConfigType } from "../../interface";

import { HistoryValueStore, isSameValue, snapshotValue } from "./value";

export const senderSchema = new Schema({
  nodes: {
    doc: { content: "inline*" },
    text: { group: "inline" },
    slot: {
      group: "inline",
      inline: true,
      atom: true,
      selectable: true,
      attrs: {
        key: {},
        type: {},
        valueId: {},
        selectionStart: { default: null },
        selectionEnd: { default: null },
        selectionDirection: { default: "none" },
      },
      toDOM: node => [
        "span",
        {
          "data-slot-key": node.attrs.key,
          "data-slot-type": node.attrs.type,
        },
      ],
    },
    contentSlot: {
      group: "inline",
      inline: true,
      content: "text*",
      isolating: true,
      selectable: true,
      attrs: { key: {} },
      toDOM: node => [
        "span",
        { "data-content-key": node.attrs.key },
        ["span", { "data-slot-key": node.attrs.key }, 0],
      ],
    },
    skill: {
      group: "inline",
      inline: true,
      atom: true,
      selectable: true,
      attrs: { value: {} },
      toDOM: node => ["span", { "data-skill-key": node.attrs.value }],
    },
  },
});

export function stringifyValue(value: unknown): string {
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

export function getSlotValue(config: SlotConfigType): unknown {
  if (config.type === "text") return config.value ?? "";
  const rawConfig = config as any;
  if (Object.prototype.hasOwnProperty.call(rawConfig, "value")) {
    return rawConfig.value;
  }
  if (config.type === "tag") return config.props?.value ?? "";
  return config.props?.defaultValue ?? "";
}

export function createDocument(
  configs: readonly SlotConfigType[] | undefined,
  skill: SkillType | undefined,
  values: HistoryValueStore,
): ProseMirrorNode {
  const nodes: ProseMirrorNode[] = [];
  if (skill?.value) {
    nodes.push(senderSchema.nodes.skill!.create({ value: skill.value }));
  }
  (configs ?? []).forEach(config => {
    if (config.type === "text") {
      if (config.value) nodes.push(senderSchema.text(config.value));
      return;
    }
    if (config.type === "content") {
      const text = stringifyValue(getSlotValue(config));
      nodes.push(
        senderSchema.nodes.contentSlot!.create(
          { key: config.key },
          text ? senderSchema.text(text) : undefined,
        ),
      );
      return;
    }
    nodes.push(
      senderSchema.nodes.slot!.create({
        key: config.key,
        type: config.type,
        valueId: values.add(getSlotValue(config)),
      }),
    );
  });
  return senderSchema.nodes.doc!.create(undefined, nodes);
}

export type EditorResult = {
  value: string;
  slotConfig: SlotConfigType[];
  skill?: SkillType;
};

export function documentToResult(
  doc: ProseMirrorNode,
  values: HistoryValueStore,
  definitions: ReadonlyMap<string, SlotConfigType>,
  skills: ReadonlyMap<string, SkillType>,
): EditorResult {
  const text: string[] = [];
  const slotConfig: SlotConfigType[] = [];
  let skill: SkillType | undefined;

  doc.forEach(node => {
    if (node.isText) {
      const value = node.text ?? "";
      text.push(value);
      if (value) slotConfig.push({ type: "text", value });
      return;
    }
    if (node.type === senderSchema.nodes.skill) {
      skill = skills.get(node.attrs.value);
      return;
    }

    const key = node.attrs.key as string;
    const definition = definitions.get(key);
    if (!definition) return;
    const rawValue =
      node.type === senderSchema.nodes.contentSlot
        ? node.textContent
        : values.read(node.attrs.valueId);
    const displayValue =
      definition.formatResult?.(rawValue) ?? stringifyValue(rawValue);
    if (definition.type === "content") text.push(` ${displayValue} `);
    else text.push(displayValue);

    const structuredValue =
      definition.type === "custom" ? snapshotValue(rawValue) : displayValue;
    slotConfig.push({
      ...definition,
      value: structuredValue,
    } as SlotConfigType);
  });

  return { value: text.join(""), slotConfig, skill };
}

type ComparableNode =
  | { kind: "text"; value: string }
  | { kind: "skill"; value: string }
  | {
      kind: "slot";
      key: string;
      type: SlotConfigType["type"];
      value: unknown;
      definition: SlotConfigType;
    };

function configsToComparable(
  configs: readonly SlotConfigType[] | undefined,
  skill: SkillType | undefined,
): ComparableNode[] {
  const result: ComparableNode[] = [];
  if (skill?.value) result.push({ kind: "skill", value: skill.value });
  (configs ?? []).forEach(config => {
    if (config.type === "text") {
      if (config.value) {
        result.push({ kind: "text", value: config.value });
      }
      return;
    }
    result.push({
      kind: "slot",
      key: config.key,
      type: config.type,
      value: getSlotValue(config),
      definition: config,
    });
  });
  return result;
}

function docToComparable(
  doc: ProseMirrorNode,
  values: HistoryValueStore,
  definitions: ReadonlyMap<string, SlotConfigType>,
): ComparableNode[] {
  const result: ComparableNode[] = [];
  doc.forEach(node => {
    if (node.isText) {
      if (node.text) result.push({ kind: "text", value: node.text });
      return;
    }
    if (node.type === senderSchema.nodes.skill) {
      result.push({ kind: "skill", value: node.attrs.value });
      return;
    }
    const key = node.attrs.key as string;
    const definition = definitions.get(key);
    if (!definition) return;
    result.push({
      kind: "slot",
      key,
      type: definition.type,
      value:
        node.type === senderSchema.nodes.contentSlot
          ? node.textContent
          : values.peek(node.attrs.valueId),
      definition,
    });
  });
  return result;
}

export function isEquivalentDocument(
  doc: ProseMirrorNode,
  configs: readonly SlotConfigType[] | undefined,
  skill: SkillType | undefined,
  values: HistoryValueStore,
  definitions: ReadonlyMap<string, SlotConfigType>,
): boolean {
  const expected = configsToComparable(configs, skill);
  const current = docToComparable(doc, values, definitions);
  return (
    expected.length === current.length &&
    expected.every((node, index) => {
      const currentNode = current[index];
      if (!currentNode || node.kind !== currentNode.kind) return false;
      if (node.kind === "text" && currentNode.kind === "text") {
        return node.value === currentNode.value;
      }
      if (node.kind === "skill" && currentNode.kind === "skill") {
        return node.value === currentNode.value;
      }
      if (node.kind !== "slot" || currentNode.kind !== "slot") return false;
      if (node.key !== currentNode.key || node.type !== currentNode.type) {
        return false;
      }
      if (isSameValue(node.value, currentNode.value)) return true;
      if (node.type !== "custom") {
        const currentDisplayValue =
          currentNode.definition.formatResult?.(currentNode.value) ??
          stringifyValue(currentNode.value);
        return isSameValue(node.value, currentDisplayValue);
      }
      return false;
    })
  );
}

export function collectDefinitions(
  definitions: Map<string, SlotConfigType>,
  configs: readonly SlotConfigType[] | undefined,
) {
  (configs ?? []).forEach(config => {
    if (config.type !== "text") definitions.set(config.key, config);
  });
}
