import type { ComputedRef, InjectionKey } from "vue";

import { computed, inject, provide } from "vue";

import type { SenderProps } from "./interface";

export interface SenderContextValue extends SenderProps {
  triggerSend?: () => void;
  setSubmitDisabled?: (disabled: boolean) => void;
}

export const SenderContextKey: InjectionKey<ComputedRef<SenderContextValue>> =
  Symbol("sender-context");

export function useSenderContext() {
  return inject(
    SenderContextKey,
    computed(() => ({}) as SenderContextValue),
  );
}

export function provideSenderContext(value: ComputedRef<SenderContextValue>) {
  provide(SenderContextKey, value);
}
