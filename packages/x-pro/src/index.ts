// @antdv-next/x-pro — community agent components for Antdv X.
// This package is a community extension: it is not ported from, affiliated
// with, or synced to the Ant Design X upstream.
import type { ComponentToken as MessageScrollerComponentToken } from "./message-scroller/style";

declare module "antdv-next/theme/interface/components" {
  interface ComponentTokenMap {
    MessageScroller?: MessageScrollerComponentToken;
  }
}

export { MessageScroller } from "./message-scroller";
export type {
  MessageScrollerClassNamesType,
  MessageScrollerEmits,
  MessageScrollerItem,
  MessageScrollerNavigation,
  MessageScrollerProps,
  MessageScrollerRef,
  MessageScrollerSemanticClassNames,
  MessageScrollerSemanticStyles,
  MessageScrollerSlots,
  MessageScrollerStylesType,
} from "./message-scroller";

export { default as XProProvider } from "./config-provider";
export {
  useXProComponentConfig,
  useXProConfig,
  useXProConfigProvider,
} from "./config-provider";
export type {
  MessageScrollerConfig,
  XProConfigContextProps,
  XProProviderEmits,
  XProProviderProps,
  XProProviderSlots,
} from "./config-provider";

export { default as enUS } from "./locale/en_US";
export { default as zhCN } from "./locale/zh_CN";
export type { MessageScrollerLocale, XProLocale } from "./locale/types";
