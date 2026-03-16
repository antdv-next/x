import type { ConfigProviderProps } from 'antdv-next'
import { theme as themeConfig } from 'antdv-next'
import { useDarkMode } from '@/composables/use-dark-mode'

export function useProviderTheme() {
  const { isDark } = useDarkMode()

  const lightTheme: NonNullable<ConfigProviderProps['theme']> = {
    token: {
      colorBgBase: '#ffffff',
      colorBgLayout: '#ffffff',
    },
    zeroRuntime: true,
  }

  const darkTheme: NonNullable<ConfigProviderProps['theme']> = {
    algorithm: [themeConfig.darkAlgorithm],
    token: {
      colorBgBase: '#141414',
      colorBgLayout: '#141414',
    },
    zeroRuntime: true,
  }

  const theme = shallowRef<NonNullable<ConfigProviderProps['theme']>>({
    ...lightTheme,
  })
  watch(
    isDark,
    () => {
      if (isDark.value) {
        theme.value = darkTheme
      }
      else {
        theme.value = lightTheme
      }
    },
    {
      immediate: true,
    },
  )
  return {
    theme,
  }
}
