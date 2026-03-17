import type { ConfigProviderProps } from 'antdv-next'
import type { ClassValue, ComputedRef, CSSProperties, StyleValue } from 'vue'
import type { ActionsProps } from '../actions'
import type { BubbleProps } from '../bubble'
import type { ConversationsProps } from '../conversations'
import { computed, inject } from 'vue'

export interface BaseComponentConfig {
  style?: StyleValue
  styles?: Record<string, CSSProperties>
  className?: ClassValue
  classes?: Record<string, string>
}

export interface XComponentConfig extends BaseComponentConfig {
  shortcutKeys?: Record<string, any>
}

export interface XComponentsConfig {
  bubble?: Pick<BubbleProps, 'style' | 'styles' | 'class' | 'classes'> & {
    className?: string
  }
  conversations?: Pick<ConversationsProps, 'style' | 'styles' | 'class' | 'classes' | 'shortcutKeys'> & {
    className?: string
  }
  actions?: Pick<ActionsProps, 'style' | 'styles' | 'class' | 'classes'> & {
    className?: string
  }
}

export interface XProviderProps extends XComponentsConfig, Omit<ConfigProviderProps, 'theme'> {
  theme?: ConfigProviderProps['theme']
}

export const XProviderContextKey: symbol = Symbol('antdv-next-x-provider-context')

export function useXProviderContextData() {
  return inject<ComputedRef<XComponentsConfig>>(
    XProviderContextKey,
    computed(() => ({})),
  )
}
