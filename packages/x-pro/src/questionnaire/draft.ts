import type { QuestionnaireAnswers, QuestionnairePayload } from "./types";

import { pruneAnswers } from "./utils";

const TTL = 24 * 60 * 60 * 1000;
export function readDraft(
  key: string,
  payload: QuestionnairePayload,
):
  | { answers: QuestionnaireAnswers; step: number; skipped: string[] }
  | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (
      draft.id !== payload.id ||
      draft.revision !== payload.revision ||
      !Number.isFinite(draft.savedAt) ||
      Date.now() - draft.savedAt > TTL ||
      draft.savedAt > Date.now()
    )
      return;
    return {
      answers: pruneAnswers(payload, draft.answers),
      step: typeof draft.step === "number" ? draft.step : 0,
      skipped: Array.isArray(draft.skipped)
        ? draft.skipped.filter(
            (id: unknown) =>
              typeof id === "string" &&
              payload.questions.some(q => q.id === id && q.required === false),
          )
        : [],
    };
  } catch {
    /* Storage can be unavailable in private browsing or SSR. */
  }
}
export function writeDraft(
  key: string,
  payload: QuestionnairePayload,
  answers: QuestionnaireAnswers,
  step: number,
  skipped: string[],
) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        id: payload.id,
        revision: payload.revision,
        savedAt: Date.now(),
        answers,
        step,
        skipped,
      }),
    );
  } catch {
    /* Draft persistence must never block answering. */
  }
}
export function removeDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* Optional storage. */
  }
}
