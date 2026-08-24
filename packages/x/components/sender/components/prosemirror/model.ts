import type { Node as ProseMirrorNode } from "prosemirror-model";

import { Schema } from "prosemirror-model";

import type { SkillType, SlotConfigType } from "../../interface";

import { HistoryValueStore, isSameValue, snapshotValue } from "./value";

function stringifyLabel(value: unknown): string {
  if (value === undefined || value === null || typeof value === "boolean") {
    return "";
  }
  if (typeof value === "string" || typeof value === "number") {
    return `${value}`;
  }
  if (Array.isArray(value)) {
    return value.map(stringifyLabel).join("");
  }
  if ((value as any).__v_isVNode) {
    const children = (value as any).children;
    if (typeof children === "function") return stringifyLabel(children());
    if (children && typeof children === "object" && !Array.isArray(children)) {
      const defaultSlot = children.default;
      if (typeof defaultSlot === "function") {
        return stringifyLabel(defaultSlot());
      }
    }
    return stringifyLabel(children);
  }
  return stringifyValue(value);
}

export const senderSchema = new Schema({
  nodes: {
    doc: { content: "inline*" },
    text: { group: "inline" },
    hardBreak: {
      group: "inline",
      inline: true,
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM: () => ["br"],
    },
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
      content: "(text | hardBreak)*",
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
  if (config.type === "tag") {
    return config.props?.value ?? stringifyLabel(config.props?.label);
  }
  if (config.type === "select") {
    const defaultValue = config.props?.defaultValue;
    const options = config.props?.options ?? [];
    if (defaultValue !== undefined && !options.includes(defaultValue)) {
      return options[0] ?? "";
    }
    return defaultValue ?? "";
  }
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
      const contentNodes: ProseMirrorNode[] = [];
      if (text) {
        // Split by \n and create text nodes with hardBreak between them
        const lines = text.split("\n");
        lines.forEach((line, index) => {
          if (line) contentNodes.push(senderSchema.text(line));
          if (index < lines.length - 1) {
            contentNodes.push(senderSchema.nodes.hardBreak!.create());
          }
        });
      }
      nodes.push(
        senderSchema.nodes.contentSlot!.create(
          { key: config.key },
          contentNodes.length > 0 ? contentNodes : undefined,
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
    if (node.type === senderSchema.nodes.hardBreak) {
      text.push("\n");
      slotConfig.push({ type: "text", value: "\n" });
      return;
    }
    if (node.type === senderSchema.nodes.skill) {
      skill = skills.get(node.attrs.value);
      return;
    }

    const key = node.attrs.key as string;
    const definition = definitions.get(key);
    if (!definition) return;

    let rawValue: unknown;
    let displayValue: string;

    if (node.type === senderSchema.nodes.contentSlot) {
      // Serialize content with hardBreak nodes as \n
      const parts: string[] = [];
      node.forEach(child => {
        if (child.isText) {
          parts.push(child.text ?? "");
        } else if (child.type === senderSchema.nodes.hardBreak) {
          parts.push("\n");
        }
      });
      rawValue = parts.join("");
      displayValue =
        definition.formatResult?.(rawValue) ?? stringifyValue(rawValue);
    } else {
      rawValue = values.read(node.attrs.valueId);
      displayValue =
        definition.formatResult?.(rawValue) ?? stringifyValue(rawValue);
    }

    if (definition.type === "content") text.push(displayValue);
    else text.push(displayValue);

    // Keep custom slot values round-trippable for controlled usage. The
    // formatted value is only the message text, not the structured value.
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
    if (node.type === senderSchema.nodes.hardBreak) {
      result.push({ kind: "text", value: "\n" });
      return;
    }
    if (node.type === senderSchema.nodes.skill) {
      result.push({ kind: "skill", value: node.attrs.value });
      return;
    }
    const key = node.attrs.key as string;
    const definition = definitions.get(key);
    if (!definition) return;

    let value: unknown;
    if (node.type === senderSchema.nodes.contentSlot) {
      // Serialize content with hardBreak nodes as \n
      const parts: string[] = [];
      node.forEach(child => {
        if (child.isText) {
          parts.push(child.text ?? "");
        } else if (child.type === senderSchema.nodes.hardBreak) {
          parts.push("\n");
        }
      });
      value = parts.join("");
    } else {
      value = values.peek(node.attrs.valueId);
    }

    result.push({
      kind: "slot",
      key,
      type: definition.type,
      value,
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
