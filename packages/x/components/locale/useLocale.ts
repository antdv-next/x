import { useConfig } from "antdv-next/config-provider/context";
import { computed } from "vue";

import type { Locale, LocaleComponentName } from "./types";

import enUS from "./en_US";
import zhCN from "./zh_CN";

function normalizeLocaleCode(locale?: string) {
  return String(locale ?? "")
    .toLowerCase()
    .replace("_", "-");
}

function getDefaultLocaleByCode(localeCode: string) {
  return localeCode.startsWith("zh") ? zhCN : enUS;
}

export default function useLocale<
  C extends LocaleComponentName = LocaleComponentName,
>(componentName: C, defaultLocale?: NonNullable<Locale[C]>) {
  const configCtx = useConfig();

  const fullLocale = computed(() => {
    return (configCtx.value.locale ?? {}) as Partial<Locale>;
  });

  const locale = computed<NonNullable<Locale[C]>>(() => {
    const localeCode = normalizeLocaleCode(fullLocale.value.locale);
    const localeFromCode =
      getDefaultLocaleByCode(localeCode)[componentName as LocaleComponentName];
    const mergedDefaultLocale =
      (localeFromCode as NonNullable<Locale[C]>) ??
      defaultLocale ??
      (enUS[componentName as LocaleComponentName] as NonNullable<Locale[C]>);

    const localeFromContext = (fullLocale.value?.[componentName] ??
      {}) as NonNullable<Locale[C]>;

    return {
      ...mergedDefaultLocale,
      ...localeFromContext,
    };
  });

  const localeCode = computed(() => {
    const code = fullLocale.value?.locale;
    return code || enUS.locale;
  });

  return [locale, localeCode] as const;
}
