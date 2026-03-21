import type { ComputedRef } from "vue";

import { computed } from "vue";

import type {
  XComponentConfig,
  XComponentsConfig,
} from "../../x-provider/context";

import { useXProviderContextData } from "../../x-provider/context";

const defaultXComponentStyleConfig: XComponentConfig = {
  classes: {},
  styles: {},
  style: {},
  shortcutKeys: {},
};

type MergeXComponentsConfig = XComponentsConfig;

export default function useXComponentConfig<
  C extends keyof MergeXComponentsConfig,
>(
  component: C,
): ComputedRef<Required<MergeXComponentsConfig>[C] & XComponentConfig> {
  const xProviderContext = useXProviderContextData();

  return computed(() => {
    const componentConfig = xProviderContext.value?.[component] ?? {};

    return {
      ...defaultXComponentStyleConfig,
      ...componentConfig,
    } as Required<MergeXComponentsConfig>[C] & XComponentConfig;
  });
}
