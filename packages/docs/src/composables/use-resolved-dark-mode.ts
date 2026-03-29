import { useRoute } from "vue-router";

import type { DarkMode } from "@/composables/use-dark-mode";

import { useDarkMode } from "@/composables/use-dark-mode";

export function useResolvedDarkMode() {
  const route = useRoute();
  const { darkMode, isDark: storedIsDark } = useDarkMode();

  const forceDark = computed(() => route.meta.forceDark === true);

  const themeMode = computed<DarkMode>(() =>
    forceDark.value ? "dark" : darkMode.value,
  );

  const isDark = computed(() => forceDark.value || storedIsDark.value);

  watchEffect(() => {
    if (typeof document === "undefined") return;
    void darkMode.value;

    document.documentElement.classList.toggle("dark", isDark.value);
    document.documentElement.style.colorScheme = isDark.value
      ? "dark"
      : "light";
  });

  return {
    darkMode,
    forceDark,
    themeMode,
    isDark,
  };
}
