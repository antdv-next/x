import { describe, expect, it, vi } from "vitest";

import type { QuestionnairePayload } from "../src";

import { pruneAnswers, resolveSubmitGate, validateQuestionnaire } from "../src";
import { readDraft, removeDraft, writeDraft } from "../src/questionnaire/draft";
import { installBrowserStorage } from "./_util-storage";

installBrowserStorage();

const payload: QuestionnairePayload = {
  id: "q",
  revision: 1,
  questions: [
    {
      id: "one",
      title: "One",
      type: "single",
      allowCustom: true,
      options: [
        { value: "a", label: "A" },
        { value: "b", label: "B", disabled: true },
      ],
    },
  ],
};

describe("questionnaire wire validation", () => {
  it("keeps browser storage independent of the Node global", () => {
    const storage = globalThis.window.localStorage;
    vi.stubGlobal("localStorage", undefined);
    vi.stubGlobal("window", { localStorage: storage });
    try {
      const answers = { one: { selected: ["a"] } };
      writeDraft("browser", payload, answers, 0, []);
      expect(readDraft("browser", payload)?.answers).toEqual(answers);
      removeDraft("browser");
      expect(storage.getItem("browser")).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("skips draft operations without a browser window", () => {
    vi.stubGlobal("window", undefined);
    try {
      expect(readDraft("server", payload)).toBeUndefined();
      expect(() => writeDraft("server", payload, {}, 0, [])).not.toThrow();
      expect(() => removeDraft("server")).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it.each([
    null,
    {},
    { ...payload, revision: -1 },
    { ...payload, expiresAt: "tomorrow" },
    { ...payload, title: () => "unsafe" },
  ])("rejects malformed envelopes: %j", value => {
    expect(validateQuestionnaire(value).valid).toBe(false);
  });
  it("isolates invalid questions instead of rejecting good siblings", () => {
    const p = {
      ...payload,
      questions: [
        ...payload.questions,
        { id: "two", title: "No input", type: "single" },
      ],
    };
    expect(validateQuestionnaire(p)).toEqual({
      valid: true,
      empty: false,
      invalidQuestions: [1],
    });
    expect(
      resolveSubmitGate(p as QuestionnairePayload, {
        one: { selected: ["a"] },
      }),
    ).toEqual({ questionIndex: 1, reason: "invalidConfig" });
  });
  it("rejects duplicate identities, duplicate option values and impossible bounds", () => {
    expect(
      validateQuestionnaire({
        ...payload,
        questions: [payload.questions[0], payload.questions[0]],
      }).invalidQuestions,
    ).toEqual([1]);
    expect(
      validateQuestionnaire({
        ...payload,
        questions: [
          {
            ...payload.questions[0],
            options: [
              { value: "a", label: "A" },
              { value: "a", label: "A" },
            ],
          },
        ],
      }).invalidQuestions,
    ).toEqual([0]);
    expect(
      validateQuestionnaire({
        ...payload,
        questions: [
          { ...payload.questions[0], minSelections: 3, maxSelections: 1 },
        ],
      }).invalidQuestions,
    ).toEqual([0]);
  });
  it("prunes unknown and disabled values, clones input and handles object-key ids", () => {
    const answers = {
      one: { selected: ["a", "a", "b", "unknown"] },
      extra: { selected: ["a"] },
    };
    expect(pruneAnswers(payload, answers)).toEqual({
      one: { selected: ["a"] },
    });
    expect(answers.one.selected).toHaveLength(4);
    expect(
      pruneAnswers(payload, { one: { selected: ["a"], custom: "Other" } }).one,
    ).toEqual({ selected: [], custom: "Other" });
    const p = {
      ...payload,
      questions: [{ ...payload.questions[0]!, id: "__proto__" }],
    };
    expect(
      pruneAnswers(p, JSON.parse('{"__proto__":{"selected":["a"]}}'))[
        "__proto__"
      ],
    ).toEqual({ selected: ["a"] });
  });
  it("counts custom text once and provides required/min/max reasons", () => {
    const p: QuestionnairePayload = {
      ...payload,
      questions: [
        {
          ...payload.questions[0]!,
          type: "multiple",
          minSelections: 2,
          maxSelections: 2,
        },
      ],
    };
    expect(resolveSubmitGate(p, {})?.reason).toBe("required");
    expect(
      resolveSubmitGate(p, { one: { selected: ["a"], custom: "  " } })?.reason,
    ).toBe("minSelections");
    expect(
      resolveSubmitGate(p, { one: { selected: ["a"], custom: "Other" } }),
    ).toBeUndefined();
    expect(
      resolveSubmitGate(p, { one: { selected: ["a", "b"], custom: "Other" } })
        ?.reason,
    ).toBe("maxSelections");
  });
  it("ignores expired, corrupt and mismatching drafts and storage errors", () => {
    globalThis.window.localStorage.setItem(
      "draft",
      JSON.stringify({
        id: "q",
        revision: 1,
        savedAt: Date.now() - 86_400_001,
        answers: {},
      }),
    );
    expect(readDraft("draft", payload)).toBeUndefined();
    globalThis.window.localStorage.setItem("draft", "{bad");
    expect(readDraft("draft", payload)).toBeUndefined();
    const spy = vi
      .spyOn(Object.getPrototypeOf(globalThis.window.localStorage), "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    expect(readDraft("draft", payload)).toBeUndefined();
    spy.mockRestore();
    globalThis.window.localStorage.clear();
  });
});
