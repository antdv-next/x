import type { PropType } from 'vue'
import type { XProviderProps } from './context'
import { ConfigProvider } from 'antdv-next'
import {
  computed,
  defineComponent,
  provide,
  useAttrs,
} from 'vue'
import { XProviderContextKey } from './context'
import useXProviderContext, { defaultPrefixCls } from './hooks/use-x-provider-context'

const XProvider = defineComponent({
  name: 'XProvider',
  inheritAttrs: false,
  props: {
    actions: {
      type: Object as PropType<XProviderProps['actions']>,
      default: undefined,
    },
    bubble: {
      type: Object as PropType<XProviderProps['bubble']>,
      default: undefined,
    },
    conversations: {
      type: Object as PropType<XProviderProps['conversations']>,
      default: undefined,
    },
    theme: {
      type: Object as PropType<XProviderProps['theme']>,
      default: undefined,
    },
    locale: {
      type: Object as PropType<XProviderProps['locale']>,
      default: undefined,
    },
    iconPrefixCls: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    const xProviderConfig = computed(() => {
      return {
        actions: props.actions,
        bubble: props.bubble,
        conversations: props.conversations,
      }
    })

    provide(XProviderContextKey, xProviderConfig)

    return () => (
      <ConfigProvider
        {...attrs}
        theme={props.theme}
        locale={props.locale}
        iconPrefixCls={props.iconPrefixCls}
      >
        {slots.default?.()}
      </ConfigProvider>
    )
  },
})

export { defaultPrefixCls, useXProviderContext }

export type { XProviderProps }

export default XProvider
