import type { XComponentConfig, XComponentsConfig } from '../context'
import { computed } from 'vue'
import { useXProviderContextData } from '../context'

export default function useXComponentConfig(component: keyof XComponentsConfig) {
  const xProviderContext = useXProviderContextData()

  return computed<XComponentConfig>(() => {
    const componentConfig = xProviderContext.value?.[component] ?? {}
    const typedConfig = componentConfig as XComponentConfig

    return {
      style: (typedConfig as any).style,
      styles: typedConfig.styles ?? {},
      className: typedConfig.className ?? (typedConfig as any).class,
      classes: typedConfig.classes ?? {},
      shortcutKeys: typedConfig.shortcutKeys ?? {},
    }
  })
}
