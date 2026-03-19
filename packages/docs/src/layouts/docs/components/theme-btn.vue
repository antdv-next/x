<script setup lang="ts">
import type { MenuProps } from "antdv-next";

import { MoonOutlined, SunOutlined, SyncOutlined } from "@antdv-next/icons";
import { computed, h } from "vue";

import type { DarkMode } from "@/composables/use-dark-mode";

import ThemeIcon from "@/components/icons/theme.vue";
import { useDarkMode } from "@/composables/use-dark-mode";
import { useLocale } from "@/composables/use-locale";

defineOptions({
  name: "ThemeBtn",
});

const { darkMode, setDarkMode } = useDarkMode();
const { t } = useLocale();

const blueDot = h("span", {
  style: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#1677ff",
  },
});

function isActive(key: "system" | "light" | "dark") {
  if (key === "system") return darkMode.value === "auto";
  return darkMode.value === key;
}

const themeMenuItems = computed<MenuProps["items"]>(() => [
  {
    key: "system",
    label: t("ui.themeBtn.system"),
    icon: h(SyncOutlined),
    extra: isActive("system") ? blueDot : undefined,
  },
  {
    key: "light",
    label: t("ui.themeBtn.light"),
    icon: h(SunOutlined),
    extra: isActive("light") ? blueDot : undefined,
  },
  {
    key: "dark",
    label: t("ui.themeBtn.dark"),
    icon: h(MoonOutlined),
    extra: isActive("dark") ? blueDot : undefined,
  },
]);

function handleMenuClick(info: {
  key: string;
  domEvent: MouseEvent | KeyboardEvent;
}) {
  const key = info.key;
  const event = info.domEvent instanceof MouseEvent ? info.domEvent : undefined;
  if (key === "system") {
    setDarkMode("auto", event);
    return;
  }
  if (key === "light" || key === "dark") setDarkMode(key as DarkMode, event);
}
</script>

<template>
  <a-dropdown
    :menu="{ items: themeMenuItems }"
    :trigger="['hover']"
    placement="bottomRight"
    @menu-click="handleMenuClick"
  >
    <a-button type="text" class="text-16px">
      <template #icon>
        <ThemeIcon />
      </template>
    </a-button>
  </a-dropdown>
</template>
