import type { ConfigProviderProps } from "antdv-next";

import { theme as themeConfig } from "antdv-next";

import { useDarkMode } from "@/composables/use-dark-mode";

export function useProviderTheme() {
  const { isDark } = useDarkMode();

  const lightTheme: NonNullable<ConfigProviderProps["theme"]> = {
    algorithm: [themeConfig.defaultAlgorithm],
  };

  const darkTheme: NonNullable<ConfigProviderProps["theme"]> = {
    algorithm: [themeConfig.darkAlgorithm],
  };

  const theme = computed<NonNullable<ConfigProviderProps["theme"]>>(() =>
    isDark.value ? { ...darkTheme } : { ...lightTheme },
  );
  return {
    theme,
  };
}
