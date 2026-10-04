import type { App, SlotsType } from "vue";

import AntConfigProvider from "antdv-next/config-provider";
import { computed, defineComponent } from "vue";

import type {
  XProConfigContextProps,
  XProProviderEmits,
  XProProviderProps,
  XProProviderSlots,
} from "./define";

import { useXProConfigProvider } from "./context";
import { X_PRO_CONFIG_KEYS } from "./define";

const XProProvider = defineComponent<
  XProProviderProps,
  XProProviderEmits,
  string,
  SlotsType<XProProviderSlots>
>(
  (props, { slots }) => {
    const xProConfig = computed(
      () =>
        Object.fromEntries(
          X_PRO_CONFIG_KEYS.map(key => [key, props[key]]),
        ) as XProConfigContextProps,
    );

    useXProConfigProvider(xProConfig);

    return () => {
      const antProps = Object.fromEntries(
        Object.entries(props).filter(
          ([key]) =>
            !X_PRO_CONFIG_KEYS.includes(
              key as (typeof X_PRO_CONFIG_KEYS)[number],
            ),
        ),
      );
      return <AntConfigProvider {...antProps} v-slots={slots as any} />;
    };
  },
  {
    name: "AXProProvider",
  },
);

(XProProvider as any).install = (app: App) => {
  app.component(XProProvider.name, XProProvider);
};

export default XProProvider;
export {
  useXProComponentConfig,
  useXProConfig,
  useXProConfigProvider,
} from "./context";
export type {
  MessageScrollerConfig,
  XProConfigContextProps,
  XProProviderEmits,
  XProProviderProps,
  XProProviderSlots,
} from "./define";
