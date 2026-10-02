import type { ComputedRef, InjectionKey, Ref } from "vue";

import { computed, inject, provide, ref } from "vue";

import type { XProConfigContextProps } from "./define";

export type { XProConfigContextProps } from "./define";

const EMPTY_OBJECT = {};
const XProConfigKey: InjectionKey<Ref<XProConfigContextProps>> =
  Symbol("XProConfigContext");

export function useXProConfigProvider(config: Ref<XProConfigContextProps>) {
  provide(XProConfigKey, config);
}

export function useXProConfig() {
  return inject(XProConfigKey, ref({}) as Ref<XProConfigContextProps>);
}

export function useXProComponentConfig<T extends keyof XProConfigContextProps>(
  propName: T,
): ComputedRef<
  NonNullable<XProConfigContextProps[T]> & {
    classes: Record<string, string>;
    styles: Record<string, any>;
  }
> {
  const config = useXProConfig();
  return computed(() => {
    const value = config.value[propName] as Record<string, any> | undefined;
    return {
      classes: EMPTY_OBJECT,
      styles: EMPTY_OBJECT,
      ...value,
    } as NonNullable<XProConfigContextProps[T]> & {
      classes: Record<string, string>;
      styles: Record<string, any>;
    };
  });
}
