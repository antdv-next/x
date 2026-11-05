import type { CSSProperties } from "vue";

import { clsx } from "@v-c/util";
import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";

import type { QuestionnaireOption } from "../types";

export default defineComponent(
  (props: {
    option: QuestionnaireOption;
    type: "single" | "multiple";
    id: string;
    name: string;
    checked: boolean;
    disabled?: boolean;
    prefixCls: string;
    class?: string;
    style?: CSSProperties;
    showMore: string;
    showLess: string;
    onSelect: () => void;
  }) => {
    const expanded = ref(false);
    const description = shallowRef<HTMLElement>();
    const overflowing = ref(false);
    let observer: ResizeObserver | undefined;
    function measure() {
      if (description.value && !expanded.value)
        overflowing.value =
          description.value.scrollHeight > description.value.clientHeight;
    }
    onMounted(() => {
      measure();
      if (typeof ResizeObserver !== "undefined" && description.value) {
        observer = new ResizeObserver(measure);
        observer.observe(description.value);
      }
    });
    watch(
      () => props.option.description,
      async () => {
        expanded.value = false;
        await nextTick();
        measure();
      },
    );
    onBeforeUnmount(() => observer?.disconnect());
    return () => (
      <div
        class={clsx(`${props.prefixCls}-option`, props.class)}
        style={props.style}
        data-checked={props.checked}
        data-disabled={props.disabled}
      >
        <label for={props.id}>
          <span class={`${props.prefixCls}-option-control`}>
            <input
              id={props.id}
              name={props.name}
              type={props.type === "single" ? "radio" : "checkbox"}
              checked={props.checked}
              disabled={props.disabled}
              aria-labelledby={`${props.id}-label`}
              aria-describedby={
                props.option.description ? `${props.id}-description` : undefined
              }
              onChange={props.onSelect}
              onFocus={event =>
                (event.target as HTMLElement).scrollIntoView?.({
                  block: "nearest",
                })
              }
            />
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {props.type === "single" ? (
                <circle cx="8" cy="8" r="3" fill="currentColor" />
              ) : (
                <path
                  d="m4 8 2.5 2.5L12 5"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              )}
            </svg>
          </span>
          <span class={`${props.prefixCls}-option-body`}>
            <span
              id={`${props.id}-label`}
              class={`${props.prefixCls}-option-label`}
            >
              {props.option.label}
            </span>
            {props.option.description && (
              <span
                ref={description}
                id={`${props.id}-description`}
                class={`${props.prefixCls}-option-description`}
                data-expanded={expanded.value}
              >
                {props.option.description}
              </span>
            )}
          </span>
        </label>
        {props.option.description && (overflowing.value || expanded.value) && (
          <button
            type="button"
            class={`${props.prefixCls}-description-toggle`}
            aria-expanded={expanded.value}
            aria-controls={`${props.id}-description`}
            disabled={props.disabled}
            onClick={() => {
              expanded.value = !expanded.value;
            }}
          >
            {expanded.value ? props.showLess : props.showMore}
          </button>
        )}
      </div>
    );
  },
  { name: "AXQuestionnaireOption", inheritAttrs: false },
);
