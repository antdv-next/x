import type { ConfigProviderProps } from "antdv-next";

import { theme as themeConfig } from "antdv-next";

import { useResolvedDarkMode } from "@/composables/use-resolved-dark-mode";

export function useProviderTheme() {
  const { isDark } = useResolvedDarkMode();

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
