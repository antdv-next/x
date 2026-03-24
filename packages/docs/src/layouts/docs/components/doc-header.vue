<script setup lang="ts">
import type { MenuEmits } from "antdv-next";

import { GithubOutlined } from "@antdv-next/icons";
import { createStyles } from "antdv-style";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import logoUrl from "@/assets/x.png";
import { useLocale } from "@/composables/use-locale";
import { headerItems, headerLocales } from "@/config/header";
import { resolveDocRoutePath } from "@/router/docs";
import { useAppStore } from "@/stores/app";

import SwitchBtn from "./switch-btn.vue";
import ThemeBtn from "./theme-btn.vue";
import "antdv-next/dist/antd.css";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { locale, t } = useLocale();

const itemKeys = headerItems.map(item => item.key).filter(Boolean) as string[];
const headerPrefixes = [...itemKeys].sort((a, b) => b.length - a.length);

function normalizeHeaderMatchPath(path: string) {
  if (path.endsWith("-en")) return path.slice(0, -3) || "/";
  if (path.endsWith("-cn")) return path.slice(0, -3) || "/";
  return path;
}

const selectedKeys = computed(() => {
  const normalizedPath = normalizeHeaderMatchPath(route.path);
  const matchedHeaderPrefix = headerPrefixes.find(
    prefix =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
  return matchedHeaderPrefix ? [matchedHeaderPrefix] : [];
});

const handleHeaderChange: MenuEmits["click"] = info => {
  router.push(String(info.key));
};

const localeValue = computed(() => (appStore.locale === "zh-CN" ? 1 : 2));

const useStyles = createStyles(({ token }) => ({
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    height: 64,
    width: "100%",
    background: "linear-gradient(117deg, #ffffff1a 17%, #ffffff0d 51%)",
    backdropFilter: "blur(40px)",
    boxShadow: token.boxShadow,
  },
  inner: {
    height: 64,
    padding: "0 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    "@media (max-width: 768px)": {
      padding: "0 16px",
    },
  },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    color: token.colorText,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 18,
    whiteSpace: "nowrap",
  },
  logoImg: {
    width: 32,
    height: 32,
    display: "inline-block",
  },
  logoText: {
    "@media (max-width: 768px)": {
      display: "none",
    },
  },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
    flexShrink: 0,
    "@media (max-width: 1024px)": {
      gap: 10,
    },
    "@media (max-width: 768px)": {
      gap: 8,
    },
  },
  menu: {
    flex: 1,
    minWidth: 0,
    justifyContent: "flex-end",
    background: "transparent !important",
    borderBottom: "none !important",
    flexShrink: 0,
    ".ant-menu-item": {
      height: 64,
      lineHeight: "64px",
    },
    "@media (max-width: 1024px)": {
      ".ant-menu-item": {
        paddingInline: 12,
      },
    },
    "@media (max-width: 768px)": {
      ".ant-menu-item": {
        paddingInline: 8,
      },
    },
  },
  iconBtn: {
    fontSize: 16,
  },
}));

const styleState = useStyles();

function changeLocale(value: 1 | 2) {
  const nextLocale = value === 1 ? "zh-CN" : "en-US";
  if (appStore.locale === nextLocale) return;

  appStore.setLocale(nextLocale);

  const localizedPath = resolveDocRoutePath(route.path, nextLocale);
  if (!localizedPath || localizedPath === route.path) return;

  router.replace({
    path: localizedPath,
    query: route.query,
    hash: route.hash,
  });
}
</script>

<template>
  <header :class="styleState.styles.header">
    <div :class="styleState.styles.inner">
      <router-link :class="styleState.styles.logo" to="/">
        <img
          :class="styleState.styles.logoImg"
          :src="logoUrl"
          draggable="false"
          alt="logo"
        />
        <span :class="styleState.styles.logoText">Antd Next X</span>
      </router-link>

      <div :class="styleState.styles.right">
        <a-menu
          :class="styleState.styles.menu"
          mode="horizontal"
          :items="headerItems"
          :selected-keys="selectedKeys"
          :disabled-overflow="true"
          @click="handleHeaderChange"
        >
          <template #labelRender="{ key, label }">
            {{ headerLocales?.[key]?.[locale as "zh-CN" | "en-US"] ?? label }}
          </template>
        </a-menu>

        <SwitchBtn
          :value="localeValue"
          :tooltip1="t('ui.localeBtn.tooltip1')"
          :tooltip2="t('ui.localeBtn.tooltip2')"
          @click="changeLocale"
        >
          <template #label1> 中 </template>
          <template #label2> En </template>
        </SwitchBtn>

        <ThemeBtn />

        <a
          href="https://github.com/antdv-next/x"
          target="_blank"
          rel="noreferrer"
        >
          <a-tooltip title="GitHub" destroy-on-hidden>
            <a-button type="text" :class="styleState.styles.iconBtn">
              <template #icon>
                <GithubOutlined />
              </template>
            </a-button>
          </a-tooltip>
        </a>
      </div>
    </div>
  </header>
</template>
