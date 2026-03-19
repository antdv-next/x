import type { ConfigProviderProps } from "antdv-next";

import { theme as themeConfig } from "antdv-next";

import { useDarkMode } from "@/composables/use-dark-mode";

export function useProviderTheme() {
  const { isDark } = useDarkMode();

  const lightTheme: NonNullable<ConfigProviderProps["theme"]> = {
    algorithm: [themeConfig.defaultAlgorithm],
    token: {
      colorBgBase: "#ffffff",
      colorBgLayout: "#ffffff",
    },
  };

  const darkTheme: NonNullable<ConfigProviderProps["theme"]> = {
    algorithm: [themeConfig.darkAlgorithm],
    token: {
      colorBgBase: "#141414",
      colorBgLayout: "#141414",
    },
  };

  const theme = computed<NonNullable<ConfigProviderProps["theme"]>>(() =>
    isDark.value ? { ...darkTheme } : { ...lightTheme },
  );
  return {
    theme,
  };
}
