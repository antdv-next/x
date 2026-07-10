<script setup lang="ts">
import { GithubOutlined } from "@antdv-next/icons";
import { createStyles } from "antdv-style";
import { computed, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useActiveHeaderItem } from "@/composables/use-header-active";
import { useLocale } from "@/composables/use-locale";
import { resolveDocRoutePath } from "@/router/docs";
import { useAppStore } from "@/stores/app";
import { clsx } from "@/utils";

import type { DocHeaderSharedProps } from "./header-shared";

import SwitchBtn from "./switch-btn.vue";
import ThemeBtn from "./theme-btn.vue";

const props = defineProps<
  DocHeaderSharedProps & {
    className?: string;
  }
>();

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useLocale();

const useStyles = createStyles(({ token, css }) => ({
  actions: css`
    display: flex;
    align-items: center;
    margin: 0 ${token.margin}px;
  `,
  versionSelect: css`
    min-width: 70px;
    margin-inline-end: ${token.marginXXS}px;
  `,
  mobile: css`
    width: 100%;
    justify-content: center;
  `,
  mini: css`
    margin: 0;
  `,
}));

const styleState = useStyles();

const { activeVersion } = useActiveHeaderItem();

// 当前模块对应子包的版本切换，options 暂时只包含当前版本，为后续 versionList 铺垫
const versionOptions = computed(() =>
  activeVersion.value
    ? [{ label: activeVersion.value, value: activeVersion.value }]
    : [],
);
const currentVersion = shallowRef<string | undefined>(activeVersion.value);
watch(activeVersion, next => {
  currentVersion.value = next;
});

const localeValue = computed(() => (props.isZhCN ? 1 : 2));

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
  <div
    :class="
      clsx(
        styleState.styles.actions,
        isMini && styleState.styles.mini,
        isMobile && styleState.styles.mobile,
        className,
      )
    "
  >
    <a-select
      v-if="currentVersion"
      v-model:value="currentVersion"
      :options="versionOptions"
      size="small"
      variant="filled"
      :class="[styleState.styles.versionSelect]"
      :popup-match-select-width="false"
    />

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

    <a href="https://github.com/antdv-next/x" target="_blank" rel="noreferrer">
      <a-tooltip title="GitHub" destroy-on-hidden>
        <a-button type="text" class="text-16px">
          <template #icon>
            <GithubOutlined />
          </template>
        </a-button>
      </a-tooltip>
    </a>
  </div>
</template>
