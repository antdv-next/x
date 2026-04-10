<script setup lang="ts">
import type { Locale } from "antdv-next/locale/index";

import { ThemeProvider } from "antdv-style";
import dayjs from "dayjs";

import { useCodeCopy } from "@/composables/use-code-copy";
import { useProviderTheme } from "@/composables/use-provider-theme";
import { useResolvedDarkMode } from "@/composables/use-resolved-dark-mode";

import AppContextRegister from "./app-context-register.vue";
import "dayjs/locale/zh";
import "dayjs/locale/en";

defineOptions({
  name: "AppProvider",
});
useCodeCopy();
const { theme } = useProviderTheme();
const { themeMode } = useResolvedDarkMode();
const { locale, messages } = useI18n();
const antdLocale = computed(() => {
  return (messages.value?.[locale.value]?.antd || undefined) as
    | Locale
    | undefined;
});

watch(
  locale,
  () => {
    // 切换dayjs的中英文
    document.documentElement.lang = locale.value;
    if (locale.value === "zh-CN") {
      dayjs.locale("zh");
    } else {
      dayjs.locale("en");
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <a-style-provider layer>
    <a-config-provider :locale="antdLocale" :theme="theme">
      <ThemeProvider :theme-mode="themeMode">
        <a-app>
          <AppContextRegister>
            <slot />
          </AppContextRegister>
        </a-app>
      </ThemeProvider>
    </a-config-provider>
  </a-style-provider>
</template>
