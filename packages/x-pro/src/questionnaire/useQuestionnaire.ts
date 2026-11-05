import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";

import type {
  QuestionnaireAnswers,
  QuestionnaireEmits,
  QuestionnaireProps,
  QuestionnaireStatus,
  QuestionnaireSubmission,
} from "./types";

import { readDraft, removeDraft, writeDraft } from "./draft";
import {
  clampStep,
  isAnswered,
  pruneAnswers,
  resolveSubmitGate,
  validateQuestionnaire,
} from "./utils";

type Emit = <K extends keyof QuestionnaireEmits>(
  event: K,
  ...args: Parameters<QuestionnaireEmits[K]>
) => void;

export function useQuestionnaire(
  props: QuestionnaireProps,
  emit: Emit,
  isDisabled: () => boolean,
) {
  const validation = computed(() => validateQuestionnaire(props.payload));
  const questions = computed(() =>
    validation.value.valid ? props.payload.questions : [],
  );
  const innerAnswers = shallowRef<QuestionnaireAnswers>({});
  const innerStep = ref(0);
  const localStatus = ref<QuestionnaireStatus>(props.status ?? "pending");
  const snapshot = shallowRef<QuestionnaireAnswers>();
  const frozenStep = ref(0);
  const skipped = ref<string[]>([]);
  const submission = shallowRef<QuestionnaireSubmission>();
  const composing = ref(false);
  const customFocused = ref(false);
  const showValidation = ref(false);
  const focusRequest = ref(0);
  let advanceTimer: ReturnType<typeof setTimeout> | undefined;
  let expiryTimer: ReturnType<typeof setTimeout> | undefined;

  const status = computed(() => localStatus.value);
  const terminal = computed(() =>
    ["submitted", "expired", "cancelled"].includes(status.value),
  );
  const locked = computed(
    () => isDisabled() || terminal.value || status.value === "submitting",
  );
  const answers = computed(
    () =>
      snapshot.value ??
      pruneAnswers(props.payload, props.answers ?? innerAnswers.value),
  );
  const step = computed(() =>
    clampStep(
      status.value === "submitting"
        ? frozenStep.value
        : (props.step ?? innerStep.value),
      questions.value.length,
    ),
  );
  const gate = computed(() => resolveSubmitGate(props.payload, answers.value));

  function cancelAdvance() {
    clearTimeout(advanceTimer);
    advanceTimer = undefined;
  }
  function clearDraft() {
    if (props.draftKey) removeDraft(props.draftKey);
  }
  function capture() {
    snapshot.value =
      snapshot.value ??
      pruneAnswers(props.payload, props.answers ?? innerAnswers.value);
    frozenStep.value = step.value;
  }
  function transition(next: QuestionnaireStatus) {
    cancelAdvance();
    if (
      next === "submitting" ||
      ["submitted", "expired", "cancelled"].includes(next)
    )
      capture();
    else if (next !== "error") {
      if (snapshot.value) innerAnswers.value = snapshot.value;
      snapshot.value = undefined;
    }
    localStatus.value = next;
    if (["submitted", "expired", "cancelled"].includes(next)) clearDraft();
  }
  function expire() {
    clearTimeout(expiryTimer);
    if (!validation.value.valid || !props.payload.expiresAt || terminal.value)
      return;
    const remaining = Date.parse(props.payload.expiresAt) - Date.now();
    if (remaining <= 0) transition("expired");
    else expiryTimer = setTimeout(expire, Math.min(remaining, 2_147_483_647));
  }
  function goToStep(value: number) {
    cancelAdvance();
    if (locked.value) return;
    const next = clampStep(value, questions.value.length);
    innerStep.value = next;
    emit("update:step", next);
  }
  function changeAnswer(id: string, selected: string[], custom?: string) {
    if (locked.value) return;
    cancelAdvance();
    const next = pruneAnswers(props.payload, {
      ...answers.value,
      [id]: { selected, custom },
    });
    innerAnswers.value = next;
    snapshot.value = undefined;
    skipped.value = skipped.value.filter(value => value !== id);
    submission.value = undefined;
    if (status.value === "error") transition("pending");
    emit("update:answers", next);
  }
  function select(value: string) {
    if (locked.value) return;
    const q = questions.value[step.value];
    const option = q?.options?.find(o => o.value === value);
    if (!q || !option || option.disabled) return;
    const answer = answers.value[q.id] ?? { selected: [] };
    if (q.type === "single") {
      changeAnswer(q.id, [value]);
      if (
        q.autoAdvance !== false &&
        !customFocused.value &&
        !composing.value &&
        step.value < questions.value.length - 1
      ) {
        const from = step.value;
        advanceTimer = setTimeout(() => {
          if (
            !locked.value &&
            !customFocused.value &&
            !composing.value &&
            step.value === from &&
            answers.value[q.id]?.selected.includes(value)
          )
            goToStep(from + 1);
        }, 240);
      }
    } else {
      const selected = answer.selected.includes(value)
        ? answer.selected.filter(v => v !== value)
        : [...answer.selected, value];
      if (
        selected.length + (answer.custom?.trim() ? 1 : 0) >
        (q.maxSelections ?? Infinity)
      )
        return;
      changeAnswer(q.id, selected, answer.custom);
    }
  }
  function inputCustom(value: string) {
    const q = questions.value[step.value];
    if (!q?.allowCustom || locked.value) return;
    const selected =
      q.type === "single" ? [] : (answers.value[q.id]?.selected ?? []);
    if (
      q.type === "multiple" &&
      value.trim() &&
      selected.length >= (q.maxSelections ?? Infinity)
    )
      return;
    changeAnswer(q.id, selected, value);
  }
  function skipQuestion() {
    const q = questions.value[step.value];
    if (!q || q.required !== false || locked.value) return;
    changeAnswer(q.id, []);
    skipped.value = [...new Set([...skipped.value, q.id])];
    goToStep(step.value + 1);
  }
  function submit() {
    if (locked.value || composing.value) return;
    showValidation.value = true;
    if (gate.value) {
      goToStep(gate.value.questionIndex);
      focusRequest.value++;
      return;
    }
    if (status.value === "error") {
      retry();
      return;
    }
    const id = globalThis.crypto.randomUUID();
    submission.value = {
      questionSetId: props.payload.id,
      revision: props.payload.revision,
      answers: pruneAnswers(props.payload, answers.value),
      skipped: skipped.value.filter(id => !isAnswered(answers.value[id])),
      submissionId: `${props.payload.id}:${props.payload.revision}:${id}`,
      submittedAt: new Date().toISOString(),
    };
    transition("submitting");
    emit("submit", structuredClone(submission.value));
  }
  function retry() {
    if (locked.value || status.value !== "error" || composing.value) return;
    if (!submission.value) {
      transition("pending");
      submit();
      emit("retry");
      return;
    }
    snapshot.value = pruneAnswers(props.payload, submission.value.answers);
    transition("submitting");
    emit("retry");
    emit("submit", structuredClone(submission.value));
  }
  function reset() {
    if (
      isDisabled() ||
      status.value === "submitting" ||
      status.value === "expired" ||
      status.value === "cancelled" ||
      (status.value === "submitted" && !props.allowRevision)
    )
      return;
    cancelAdvance();
    clearDraft();
    transition("pending");
    innerAnswers.value = {};
    innerStep.value = 0;
    skipped.value = [];
    submission.value = undefined;
    showValidation.value = false;
    emit("update:answers", {});
    emit("update:step", 0);
    focusRequest.value++;
  }
  function revise() {
    if (!props.allowRevision || isDisabled() || status.value !== "submitted")
      return;
    innerAnswers.value = pruneAnswers(props.payload, answers.value);
    transition("pending");
    submission.value = undefined;
    goToStep(0);
    focusRequest.value++;
  }
  function skip() {
    if (locked.value || !props.payload.allowSkip || composing.value) return;
    transition("cancelled");
    emit("skip", {
      questionSetId: props.payload.id,
      revision: props.payload.revision,
    });
  }

  watch(
    () => [props.payload?.id, props.payload?.revision, props.draftKey],
    () => {
      cancelAdvance();
      clearTimeout(expiryTimer);
      snapshot.value = undefined;
      submission.value = undefined;
      showValidation.value = false;
      skipped.value = [];
      localStatus.value = props.status ?? "pending";
      const draft =
        validation.value.valid &&
        props.draftKey &&
        localStatus.value === "pending"
          ? readDraft(props.draftKey, props.payload)
          : undefined;
      innerAnswers.value = pruneAnswers(
        props.payload,
        props.defaultAnswers ?? draft?.answers ?? {},
      );
      innerStep.value = clampStep(
        props.defaultStep ?? draft?.step ?? 0,
        questions.value.length,
      );
      frozenStep.value = clampStep(
        props.step ?? innerStep.value,
        questions.value.length,
      );
      skipped.value = draft?.skipped ?? [];
      if (terminal.value || status.value === "submitting") capture();
      if (terminal.value) clearDraft();
      if (validation.value.empty)
        console.warn("[Questionnaire] questions must not be empty.");
      expire();
    },
    { immediate: true },
  );

  watch(
    () => props.status,
    next => {
      if (!next) return;
      if (status.value === "expired" || status.value === "cancelled") return;
      // A stale pending prop must not reopen an acknowledged questionnaire.
      if (
        terminal.value &&
        !["submitted", "expired", "cancelled"].includes(next)
      )
        return;
      transition(next);
      expire();
    },
  );
  watch(
    () => props.payload,
    () => {
      cancelAdvance();
      expire();
    },
    { deep: true },
  );
  watch(step, () => {
    cancelAdvance();
    customFocused.value = false;
    composing.value = false;
  });
  watch(locked, value => {
    if (value) cancelAdvance();
  });
  watch(
    () => props.answers,
    () => {
      if (!locked.value) snapshot.value = undefined;
    },
    { deep: true },
  );
  watch(
    [answers, step, skipped],
    () => {
      if (
        props.draftKey &&
        validation.value.valid &&
        !terminal.value &&
        status.value !== "submitting"
      )
        writeDraft(
          props.draftKey,
          props.payload,
          answers.value,
          step.value,
          skipped.value,
        );
    },
    { deep: true },
  );
  onBeforeUnmount(() => {
    cancelAdvance();
    clearTimeout(expiryTimer);
  });

  return {
    validation,
    questions,
    answers,
    step,
    status,
    terminal,
    locked,
    gate,
    showValidation,
    composing,
    customFocused,
    focusRequest,
    cancelAdvance,
    goToStep,
    select,
    inputCustom,
    skipQuestion,
    submit,
    retry,
    reset,
    revise,
    skip,
  };
}
