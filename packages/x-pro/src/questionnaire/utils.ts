import type {
  QuestionnaireAnswer,
  QuestionnaireAnswers,
  QuestionnairePayload,
} from "./types";

export type QuestionnaireGateReason =
  | "required"
  | "minSelections"
  | "maxSelections"
  | "invalidConfig";
export interface QuestionnaireValidation {
  valid: boolean;
  empty: boolean;
  invalidQuestions: number[];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
const text = (value: unknown) => typeof value === "string";
const optionalText = (value: unknown) => value === undefined || text(value);
const optionalBoolean = (value: unknown) =>
  value === undefined || typeof value === "boolean";
const optionalCount = (value: unknown) =>
  value === undefined ||
  (typeof value === "number" && Number.isSafeInteger(value) && value >= 0);

/** Validate untrusted wire data before reading question/option fields in the view. */
export function validateQuestionnaire(
  payload: unknown,
): QuestionnaireValidation {
  const invalid = { valid: false, empty: false, invalidQuestions: [] };
  if (
    !record(payload) ||
    !text(payload.id) ||
    !payload.id ||
    !optionalCount(payload.revision) ||
    payload.revision === undefined ||
    !Array.isArray(payload.questions) ||
    ![
      payload.title,
      payload.description,
      payload.submitLabel,
      payload.expiresAt,
    ].every(optionalText) ||
    !optionalBoolean(payload.allowSkip) ||
    (payload.expiresAt !== undefined &&
      !Number.isFinite(Date.parse(payload.expiresAt as string)))
  )
    return invalid;
  const ids = new Set<string>();
  const invalidQuestions: number[] = [];
  payload.questions.forEach((q: unknown, index: number) => {
    if (!record(q) || !text(q.id) || !q.id || ids.has(q.id)) {
      invalidQuestions.push(index);
      return;
    }
    ids.add(q.id);
    const values = new Set<string>();
    const optionsValid =
      q.options === undefined ||
      (Array.isArray(q.options) &&
        q.options.every((o: unknown) => {
          if (
            !record(o) ||
            !text(o.value) ||
            !o.value ||
            values.has(o.value) ||
            !text(o.label) ||
            !optionalText(o.description) ||
            !optionalBoolean(o.disabled)
          )
            return false;
          values.add(o.value);
          return true;
        }));
    if (
      !text(q.title) ||
      ![q.description, q.customLabel, q.customPlaceholder].every(
        optionalText,
      ) ||
      ![q.required, q.allowCustom, q.autoAdvance].every(optionalBoolean) ||
      ![q.minSelections, q.maxSelections, q.customMaxLength].every(
        optionalCount,
      ) ||
      !["single", "multiple"].includes(q.type as string) ||
      !optionsValid ||
      (!(q.options as unknown[] | undefined)?.length && !q.allowCustom) ||
      q.customMaxLength === 0 ||
      (typeof q.minSelections === "number" &&
        typeof q.maxSelections === "number" &&
        q.minSelections > q.maxSelections)
    )
      invalidQuestions.push(index);
  });
  return {
    valid: true,
    empty: payload.questions.length === 0,
    invalidQuestions,
  };
}

/** Copy only known, enabled options; never mutate controlled answers. */
export function pruneAnswers(
  payload: QuestionnairePayload,
  answers: unknown,
): QuestionnaireAnswers {
  const result = Object.create(null) as QuestionnaireAnswers;
  if (!record(answers)) return result;
  const validation = validateQuestionnaire(payload);
  if (!validation.valid) return result;
  payload.questions.forEach((q, index) => {
    if (validation.invalidQuestions.includes(index)) return;
    const raw = Object.hasOwn(answers, q.id) ? answers[q.id] : undefined;
    if (!record(raw)) return;
    const selected = Array.isArray(raw.selected)
      ? [
          ...new Set(
            raw.selected.filter(
              (v): v is string =>
                typeof v === "string" &&
                !!q.options?.some(o => o.value === v && !o.disabled),
            ),
          ),
        ]
      : [];
    const custom =
      q.allowCustom && text(raw.custom)
        ? raw.custom.slice(0, q.customMaxLength ?? 500)
        : undefined;
    result[q.id] = {
      selected:
        q.type === "single"
          ? custom?.trim()
            ? []
            : selected.slice(0, 1)
          : selected,
      ...(custom !== undefined ? { custom } : {}),
    };
  });
  return result;
}

export function isAnswered(answer?: QuestionnaireAnswer): boolean {
  return !!(answer?.selected.length || answer?.custom?.trim());
}

/** Custom text counts as one choice for a multiple-choice question. */
export function resolveSubmitGate(
  payload: QuestionnairePayload,
  answers: QuestionnaireAnswers,
): { questionIndex: number; reason: QuestionnaireGateReason } | undefined {
  const validation = validateQuestionnaire(payload);
  if (!validation.valid || validation.empty)
    return { questionIndex: 0, reason: "invalidConfig" };
  for (const [questionIndex, q] of payload.questions.entries()) {
    if (validation.invalidQuestions.includes(questionIndex))
      return { questionIndex, reason: "invalidConfig" };
    const answer = answers[q.id];
    if (q.required !== false && !isAnswered(answer))
      return { questionIndex, reason: "required" };
    const count =
      (answer?.selected.length ?? 0) + (answer?.custom?.trim() ? 1 : 0);
    if (q.type === "multiple" && count < (q.minSelections ?? 0))
      return { questionIndex, reason: "minSelections" };
    if (q.type === "multiple" && count > (q.maxSelections ?? Infinity))
      return { questionIndex, reason: "maxSelections" };
  }
}

export function clampStep(step: number, total: number): number {
  return Math.max(
    0,
    Math.min(
      Number.isFinite(step) ? Math.trunc(step) : 0,
      Math.max(0, total - 1),
    ),
  );
}
