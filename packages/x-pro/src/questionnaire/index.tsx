import type { App, SlotsType } from "vue";

import { clsx } from "@v-c/util";
import { useBaseConfig } from "antdv-next/config-provider/context";
import useCSSVarCls from "antdv-next/config-provider/hooks/useCSSVarCls";
import { useLocaleContext } from "antdv-next/locale/index";
import { computed, defineComponent, shallowRef, useId, watch } from "vue";

import type { QuestionnaireLocale, XProLocale } from "../locale/types";
import type {
  QuestionnaireEmits,
  QuestionnaireProps,
  QuestionnaireRef,
  QuestionnaireSemanticName,
  QuestionnaireSlots,
} from "./types";

import {
  omitClassAndStyle,
  resolveAttrClass,
  resolveAttrStyle,
} from "../_util/attrs";
import { useMergeSemantic } from "../_util/semantic";
import { formatTemplate } from "../_util/template";
import { useXProComponentConfig } from "../config-provider";
import enUS from "../locale/en_US";
import QuestionnaireDisclosure from "./components/QuestionnaireDisclosure";
import QuestionnaireOption from "./components/QuestionnaireOption";
import useStyle from "./style";
import { useQuestionnaire } from "./useQuestionnaire";

const Questionnaire = defineComponent<
  QuestionnaireProps,
  { [K in keyof QuestionnaireEmits]: QuestionnaireEmits[K] },
  string,
  SlotsType<QuestionnaireSlots>
>(
  (props, { attrs, emit, expose, slots }) => {
    const { prefixCls, direction } = useBaseConfig("questionnaire", props);
    const config = useXProComponentConfig("questionnaire");
    const localeContext = useLocaleContext();
    const locale = computed<QuestionnaireLocale>(() => ({
      ...enUS.Questionnaire,
      ...(localeContext.locale.value as XProLocale | undefined)?.Questionnaire,
    }));
    const disabled = computed(
      () => props.disabled ?? config.value.disabled ?? false,
    );
    const allowRevision = computed(
      () => props.allowRevision ?? config.value.allowRevision ?? false,
    );
    const mergedProps = new Proxy(props, {
      get(target, key: keyof QuestionnaireProps) {
        return key === "allowRevision" ? allowRevision.value : target[key];
      },
    });
    const state = useQuestionnaire(mergedProps, emit, () => disabled.value);
    const root = shallowRef<HTMLElement>();
    const titleRef = shallowRef<HTMLElement>();
    const errorRef = shallowRef<HTMLElement>();
    const receiptRef = shallowRef<HTMLElement>();
    const id = useId();
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);
    const [classes, styles] = useMergeSemantic(
      computed(() => [config.value.classes, props.classes]),
      computed(() => [config.value.styles, props.styles]),
      computed(() => ({
        props: {
          ...props,
          disabled: disabled.value,
          allowRevision: allowRevision.value,
        },
      })),
    );
    function semantic(name: QuestionnaireSemanticName) {
      return {
        class: clsx(`${prefixCls.value}-${name}`, classes.value[name]),
        style: styles.value[name],
      };
    }
    const question = computed(() => state.questions.value[state.step.value]);
    const answer = computed(
      () => state.answers.value[question.value?.id ?? ""] ?? { selected: [] },
    );
    const progress = computed(() =>
      formatTemplate(locale.value.progress, {
        index: state.step.value + 1,
        total: state.questions.value.length,
      }),
    );
    const currentGate = computed(() =>
      state.gate.value?.questionIndex === state.step.value
        ? state.gate.value
        : undefined,
    );
    const gateText = computed(() => {
      const gate = currentGate.value;
      if (!gate) return "";
      return formatTemplate(
        locale.value[
          gate.reason === "required" ? "requiredError" : gate.reason
        ],
        {
          min: question.value?.minSelections ?? 0,
          max: question.value?.maxSelections ?? 0,
        },
      );
    });
    const errorText = computed(() =>
      state.status.value === "error"
        ? (props.error ?? locale.value.error)
        : state.showValidation.value
          ? gateText.value
          : "",
    );
    watch(
      [state.step, state.focusRequest],
      () => {
        ((state.showValidation.value || state.status.value === "error") &&
        errorText.value
          ? errorRef.value
          : titleRef.value
        )?.focus();
      },
      { flush: "post" },
    );
    watch(
      () => state.status.value,
      status => {
        if (status === "error") errorRef.value?.focus();
        else if (state.terminal.value) receiptRef.value?.focus();
      },
      { flush: "post" },
    );

    expose({
      get nativeElement() {
        return root.value ?? null;
      },
      submit: state.submit,
      goToStep: state.goToStep,
      reset: state.reset,
    } satisfies QuestionnaireRef);

    function renderQuestion() {
      const q = question.value;
      if (
        !q ||
        state.validation.value.invalidQuestions.includes(state.step.value)
      )
        return (
          <p role="alert" {...semantic("error")}>
            {locale.value.invalidConfig}
          </p>
        );
      const max = q.customMaxLength ?? 500;
      const custom = answer.value.custom ?? "";
      const count = answer.value.selected.length + (custom.trim() ? 1 : 0);
      const atMax =
        q.type === "multiple" && count >= (q.maxSelections ?? Infinity);
      const slotInfo = {
        answers: state.answers.value,
        step: state.step.value,
        status: state.status.value,
      };
      return (
        <div key={q.id} {...semantic("question")}>
          <div class={`${prefixCls.value}-question-heading`}>
            <h3 ref={titleRef} id={`${id}-question`} tabindex={-1}>
              {q.title}
            </h3>
            <span class={`${prefixCls.value}-requirement`}>
              {q.required === false
                ? locale.value.optional
                : locale.value.required}
            </span>
          </div>
          {q.description && (
            <p id={`${id}-description`} {...semantic("description")}>
              {q.description}
            </p>
          )}
          {q.type === "multiple" && (
            <p id={`${id}-constraints`} {...semantic("description")}>
              {(q.minSelections ?? 0) > 0 &&
                formatTemplate(locale.value.minSelections, {
                  min: q.minSelections!,
                })}{" "}
              {q.maxSelections !== undefined &&
                formatTemplate(locale.value.maxSelections, {
                  max: q.maxSelections,
                })}
            </p>
          )}
          <div
            {...semantic("options")}
            role={q.type === "single" ? "radiogroup" : "group"}
            aria-labelledby={`${id}-question`}
            aria-describedby={
              [
                q.description ? `${id}-description` : "",
                q.type === "multiple" ? `${id}-constraints` : "",
                errorText.value ? `${id}-error` : "",
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            aria-required={q.required !== false}
          >
            {q.options?.map((option, index) => (
              <QuestionnaireOption
                key={option.value}
                option={option}
                type={q.type}
                id={`${id}-option-${index}`}
                name={`${id}-${q.id}`}
                checked={answer.value.selected.includes(option.value)}
                disabled={
                  state.locked.value ||
                  option.disabled ||
                  (atMax && !answer.value.selected.includes(option.value))
                }
                prefixCls={prefixCls.value}
                class={classes.value.option}
                style={styles.value.option}
                showMore={locale.value.showMore}
                showLess={locale.value.showLess}
                onSelect={() => state.select(option.value)}
              />
            ))}
          </div>
          {q.allowCustom && (
            <div {...semantic("custom")} data-standalone={!q.options?.length}>
              <label for={`${id}-custom`}>
                {q.customLabel ?? locale.value.other}
              </label>
              <textarea
                id={`${id}-custom`}
                rows={q.options?.length ? 1 : 3}
                value={custom}
                maxlength={max}
                placeholder={
                  q.customPlaceholder ?? locale.value.customPlaceholder
                }
                disabled={state.locked.value || (atMax && !custom.trim())}
                aria-required={q.required !== false && !q.options?.length}
                aria-describedby={`${id}-question ${id}-counter${errorText.value ? ` ${id}-error` : ""}`}
                onFocus={() => {
                  state.customFocused.value = true;
                  state.cancelAdvance();
                }}
                onBlur={() => {
                  state.customFocused.value = false;
                }}
                onCompositionstart={() => {
                  state.composing.value = true;
                  state.cancelAdvance();
                }}
                onCompositionend={event => {
                  state.composing.value = false;
                  state.inputCustom(
                    (event.target as HTMLTextAreaElement).value,
                  );
                }}
                onInput={event => {
                  if (!state.composing.value)
                    state.inputCustom(
                      (event.target as HTMLTextAreaElement).value,
                    );
                }}
              />
              <span
                id={`${id}-counter`}
                class={`${prefixCls.value}-counter`}
                aria-live="polite"
              >
                {custom.length >= max * 0.8 ? `${custom.length} / ${max}` : ""}
                {custom.length >= max ? ` ${locale.value.limitReached}` : ""}
              </span>
            </div>
          )}
          {slots.questionExtra?.({ ...slotInfo, question: q })}
        </div>
      );
    }
    function renderReceipt() {
      const info = {
        answers: state.answers.value,
        step: state.step.value,
        status: state.status.value,
      };
      return (
        <section
          {...semantic("receipt")}
          role="status"
          aria-labelledby={`${id}-receipt`}
        >
          <div class={`${prefixCls.value}-receipt-heading`}>
            <span class={`${prefixCls.value}-receipt-icon`} aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                {state.status.value === "submitted" ? (
                  <path
                    d="m5.5 10 3 3 6-6"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                ) : state.status.value === "cancelled" ? (
                  <path
                    d="m7 7 6 6m0-6-6 6"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                  />
                ) : (
                  <>
                    <circle
                      cx="10"
                      cy="10"
                      r="6"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="M10 6.5v4l2.5 1.5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </>
                )}
              </svg>
            </span>
            <h3 ref={receiptRef} id={`${id}-receipt`} tabindex={-1}>
              {locale.value[state.status.value]}
            </h3>
          </div>
          {props.result && <p>{props.result}</p>}
          {slots.receipt ? (
            slots.receipt(info)
          ) : (
            <dl>
              {state.questions.value.map((q, index) => {
                if (state.validation.value.invalidQuestions.includes(index))
                  return (
                    <div key={index}>
                      <dd>{locale.value.invalidConfig}</dd>
                    </div>
                  );
                const a = state.answers.value[q.id];
                return (
                  <div key={q.id}>
                    <dt>{q.title}</dt>
                    <dd>
                      {a?.selected.map(value => (
                        <span key={value} {...semantic("chip")}>
                          {q.options?.find(o => o.value === value)?.label}
                        </span>
                      ))}
                      {a?.custom?.trim() && (
                        <span {...semantic("chip")}>{`"${a.custom}"`}</span>
                      )}
                      {!a?.selected.length && !a?.custom?.trim() && (
                        <span>
                          {q.required !== false
                            ? locale.value.unanswered
                            : locale.value.skipped}
                        </span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
          {state.status.value === "submitted" && allowRevision.value && (
            <button
              type="button"
              disabled={disabled.value}
              onClick={state.revise}
            >
              {locale.value.revise}
            </button>
          )}
        </section>
      );
    }
    return () => {
      if (state.validation.value.empty) return null;
      const info = {
        answers: state.answers.value,
        step: state.step.value,
        status: state.status.value,
      };
      const total = state.questions.value.length;
      const dotStart = Math.max(0, Math.min(state.step.value - 3, total - 7));
      return (
        <section
          {...omitClassAndStyle(attrs as Record<string, unknown>)}
          ref={root}
          class={clsx(
            prefixCls.value,
            hashId.value,
            cssVarCls.value,
            rootCls.value,
            { [`${prefixCls.value}-rtl`]: direction.value === "rtl" },
            config.value.class,
            classes.value.root,
            props.rootClass,
            resolveAttrClass(attrs.class),
          )}
          style={[
            config.value.style,
            styles.value.root,
            resolveAttrStyle(attrs.style),
          ]}
          data-status={state.status.value}
        >
          <header {...semantic("header")}>
            <span class={`${prefixCls.value}-header-icon`} aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <path
                  d="M5.5 3.5h9a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4.5 3v-3a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linejoin="round"
                />
                <path
                  d="M7.8 7.4a2.2 2.2 0 0 1 4.3.6c0 1.5-2.1 1.6-2.1 2.9m0 1.3v.1"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <h2 {...semantic("title")}>
              {state.validation.value.valid
                ? (props.payload.title ?? locale.value.title)
                : locale.value.title}
            </h2>
            {state.validation.value.valid && !state.terminal.value && (
              <div {...semantic("progress")}>
                <span aria-hidden="true" class={`${prefixCls.value}-dots`}>
                  {Array.from({ length: Math.min(7, total) }, (_, i) => (
                    <i
                      key={dotStart + i}
                      data-current={dotStart + i === state.step.value}
                      data-completed={dotStart + i < state.step.value}
                    />
                  ))}
                </span>
                <span
                  aria-hidden="true"
                  class={`${prefixCls.value}-step-counter`}
                >
                  {state.step.value + 1}/{total}
                </span>
                <span class={`${prefixCls.value}-sr-only`} aria-live="polite">
                  {progress.value}
                </span>
              </div>
            )}
            {(props.dismissible ?? config.value.dismissible) && (
              <button
                type="button"
                class={`${prefixCls.value}-dismiss`}
                aria-label={locale.value.dismiss}
                disabled={state.locked.value}
                onClick={() => {
                  if (!state.locked.value) emit("dismiss");
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m4 4 8 8m0-8-8 8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            )}
          </header>
          {!state.validation.value.valid ? (
            <p role="alert" {...semantic("error")}>
              {locale.value.invalidConfig}
            </p>
          ) : (
            <>
              {props.payload.description && (
                <p
                  {...semantic("description")}
                  class={clsx(
                    `${prefixCls.value}-intro`,
                    classes.value.description,
                  )}
                >
                  {props.payload.description}
                </p>
              )}
              <QuestionnaireDisclosure
                prefixCls={prefixCls.value}
                open={!state.terminal.value}
              >
                <div
                  {...semantic("content")}
                  inert={state.terminal.value ? true : undefined}
                  aria-hidden={state.terminal.value || undefined}
                  aria-busy={state.status.value === "submitting"}
                >
                  {renderQuestion()}
                  {errorText.value && (
                    <p
                      ref={errorRef}
                      id={`${id}-error`}
                      tabindex={-1}
                      role="alert"
                      {...semantic("error")}
                    >
                      {errorText.value}
                    </p>
                  )}
                  <footer {...semantic("footer")}>
                    {slots.footer ? (
                      slots.footer({
                        ...info,
                        submit: state.submit,
                        goToStep: state.goToStep,
                      })
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={
                            state.locked.value || state.step.value === 0
                          }
                          onClick={() => state.goToStep(state.step.value - 1)}
                        >
                          <span
                            class={`${prefixCls.value}-arrow`}
                            aria-hidden="true"
                          >
                            <svg viewBox="0 0 16 16" fill="none">
                              <path
                                d="m9.5 4-4 4 4 4M5.5 8H13"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </span>{" "}
                          {locale.value.previous}
                        </button>
                        {question.value?.required === false && (
                          <button
                            type="button"
                            disabled={state.locked.value}
                            onClick={state.skipQuestion}
                          >
                            {locale.value.skipQuestion}
                          </button>
                        )}
                        {props.payload.allowSkip && (
                          <button
                            type="button"
                            disabled={state.locked.value}
                            onClick={state.skip}
                          >
                            {locale.value.skip}
                          </button>
                        )}
                        {state.status.value === "error" ? (
                          <button
                            type="button"
                            class={`${prefixCls.value}-primary`}
                            disabled={state.locked.value}
                            onClick={state.retry}
                          >
                            {locale.value.retry}
                          </button>
                        ) : state.step.value < total - 1 ? (
                          <button
                            type="button"
                            class={`${prefixCls.value}-primary`}
                            disabled={state.locked.value}
                            onClick={() => state.goToStep(state.step.value + 1)}
                          >
                            {locale.value.next}{" "}
                            <span
                              class={`${prefixCls.value}-arrow`}
                              aria-hidden="true"
                            >
                              <svg viewBox="0 0 16 16" fill="none">
                                <path
                                  d="m6.5 4 4 4-4 4M10.5 8H3"
                                  stroke="currentColor"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            class={`${prefixCls.value}-primary`}
                            disabled={state.locked.value}
                            onClick={state.submit}
                          >
                            {state.status.value === "submitting"
                              ? locale.value.submitting
                              : (props.payload.submitLabel ??
                                locale.value.submit)}
                          </button>
                        )}
                      </>
                    )}
                  </footer>
                </div>
              </QuestionnaireDisclosure>
              {state.terminal.value && renderReceipt()}
            </>
          )}
        </section>
      );
    };
  },
  { name: "AXQuestionnaire", inheritAttrs: false },
);

(Questionnaire as any).install = (app: App) => {
  app.component(Questionnaire.name, Questionnaire);
};
export { Questionnaire };
export default Questionnaire;
export type * from "./types";
