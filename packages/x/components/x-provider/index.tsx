import type { PropType } from "vue";

import { ConfigProvider } from "antdv-next";
import { computed, defineComponent, provide, useAttrs } from "vue";

import type { XProviderProps } from "./context";

import { XProviderContextKey } from "./context";
import useXProviderContext, {
  defaultPrefixCls,
} from "./hooks/use-x-provider-context";

const XProvider = defineComponent({
  name: "XProvider",
  inheritAttrs: false,
  props: {
    attachments: {
      type: Object as PropType<XProviderProps["attachments"]>,
      default: undefined,
    },
    actions: {
      type: Object as PropType<XProviderProps["actions"]>,
      default: undefined,
    },
    bubble: {
      type: Object as PropType<XProviderProps["bubble"]>,
      default: undefined,
    },
    conversations: {
      type: Object as PropType<XProviderProps["conversations"]>,
      default: undefined,
    },
    fileCard: {
      type: Object as PropType<XProviderProps["fileCard"]>,
      default: undefined,
    },
    mermaid: {
      type: Object as PropType<XProviderProps["mermaid"]>,
      default: undefined,
    },
    prompts: {
      type: Object as PropType<XProviderProps["prompts"]>,
      default: undefined,
    },
    suggestion: {
      type: Object as PropType<XProviderProps["suggestion"]>,
      default: undefined,
    },
    welcome: {
      type: Object as PropType<XProviderProps["welcome"]>,
      default: undefined,
    },
    theme: {
      type: Object as PropType<XProviderProps["theme"]>,
      default: undefined,
    },
    locale: {
      type: Object as PropType<XProviderProps["locale"]>,
      default: undefined,
    },
    iconPrefixCls: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const attrs = useAttrs();

    const xProviderConfig = computed(() => {
      return {
        attachments: props.attachments,
        actions: props.actions,
        bubble: props.bubble,
        conversations: props.conversations,
        fileCard: props.fileCard,
        mermaid: props.mermaid,
        prompts: props.prompts,
        suggestion: props.suggestion,
        welcome: props.welcome,
      };
    });

    provide(XProviderContextKey, xProviderConfig);

    return () => (
      <ConfigProvider
        {...attrs}
        theme={props.theme}
        locale={props.locale}
        iconPrefixCls={props.iconPrefixCls}
      >
        {slots.default?.()}
      </ConfigProvider>
    );
  },
});

export { defaultPrefixCls, useXProviderContext };

export type { XProviderProps };

export default XProvider;
