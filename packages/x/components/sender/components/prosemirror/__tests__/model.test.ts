import { describe, expect, it } from "vitest";

import { documentToResult, isEquivalentDocument, senderSchema } from "../model";
import { HistoryValueStore } from "../value";

describe("prosemirror/model", () => {
  it("serializes top-level hard breaks as text newlines", () => {
    const values = new HistoryValueStore();
    const definitions = new Map();
    const doc = senderSchema.nodes.doc!.create(undefined, [
      senderSchema.text("first"),
      senderSchema.nodes.hardBreak!.create(),
      senderSchema.text("second"),
    ]);

    const result = documentToResult(doc, values, definitions, new Map());

    expect(result).toEqual({
      value: "first\nsecond",
      slotConfig: [
        { type: "text", value: "first" },
        { type: "text", value: "\n" },
        { type: "text", value: "second" },
      ],
      skill: undefined,
    });
    expect(
      isEquivalentDocument(
        doc,
        result.slotConfig,
        result.skill,
        values,
        definitions,
      ),
    ).toBe(true);
  });
});
