<script setup lang="ts">
import { CloseOutlined, MenuOutlined } from "@antdv-next/icons";
import { useMediaQuery, useWindowScroll, useWindowSize } from "@vueuse/core";
import { createStyles } from "antdv-style";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import DocSearch from "@/components/doc-search/index.vue";
import { useAppStore } from "@/stores/app";
import { clsx } from "@/utils";

import HeaderActions from "./header-actions.vue";
import HeaderLogo from "./header-logo.vue";
import HeaderNavigation from "./header-navigation.vue";
import {
  DOC_HEADER_HEIGHT,
  DOC_HEADER_MOBILE_HEIGHT,
  DOC_HEADER_MOBILE_MAX_WIDTH,
  DOC_HEADER_RADIUS,
} from "./header-shared";

const route = useRoute();
const appStore = useAppStore();

const open = ref(false);
const scrollDirection = ref<"up" | "down">("up");
const bodyHeight = ref(1080);

const isMobile = useMediaQuery(`(max-width: ${DOC_HEADER_MOBILE_MAX_WIDTH}px)`);
const { y } = useWindowScroll();
const { height } = useWindowSize();

const isZhCN = computed(() => appStore.locale === "zh-CN");
const isRTL = computed(() => false);

function syncBodyHeight() {
  if (typeof document === "undefined") return;
  bodyHeight.value =
    document.body?.clientHeight ||
    document.documentElement?.clientHeight ||
    1080;
}

watch(
  y,
  (current, previous) => {
    if (current === previous) return;
    scrollDirection.value = current > previous ? "down" : "up";
  },
  { flush: "sync" },
);

watch(
  () => route.fullPath,
  async () => {
    open.value = false;
    await nextTick();
    syncBodyHeight();
  },
);

watch(isMobile, () => {
  open.value = false;
});

onMounted(() => {
  syncBodyHeight();
  window.addEventListener("resize", syncBodyHeight);
});

onUnmounted(() => {
  window.removeEventListener("resize", syncBodyHeight);
});

const isMini = computed(
  () =>
    y.value > Math.min(height.value * 0.5, bodyHeight.value * 0.25) &&
    !isMobile.value,
);

const isHidden = computed(
  () =>
    y.value > Math.min(height.value * 1.5, bodyHeight.value * 0.5) &&
    scrollDirection.value === "down",
);

const isActionHidden = computed(() => y.value > 200);

const useStyles = createStyles(({ token, css }) => ({
  header: css`
    height: ${DOC_HEADER_HEIGHT}px;
    width: 100%;
    box-sizing: border-box;
    position: fixed;
    top: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition:
      padding 0.2s ease-in-out,
      margin 0.2s ease-in-out,
      opacity 0.2s ease-in-out;
  `,
  mobile: css`
    height: ${DOC_HEADER_MOBILE_HEIGHT}px;
    width: calc(100% - ${token.paddingLG * 2}px);
    padding: 0 ${token.paddingLG}px;
    margin: 0 ${token.paddingLG}px;
    top: ${(DOC_HEADER_HEIGHT - token.paddingLG * 2) / 2}px;
    border-radius: ${DOC_HEADER_RADIUS}px;
  `,
  mini: css`
    width: min-content !important;
    margin: 0 !important;
    gap: ${token.paddingLG}px;
    inset-inline-end: 50%;
    transform: translateX(50%);
  `,
  hidden: css`
    opacity: 0;
  `,
  miniRtl: css`
    inset-inline-start: 50%;
  `,
  background: css`
    background: linear-gradient(117deg, #ffffff1a 17%, #ffffff0d 51%);
    backdrop-filter: blur(40px);
    pointer-events: auto;
    box-shadow: ${token.boxShadow};

    &::before,
    &::after {
      content: "";
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border-radius: inherit;
      position: absolute;
      top: 0;
      bottom: 0;
      inset-inline-start: 0;
      inset-inline-end: 0;
      pointer-events: none;
    }

    &::before {
      border: ${token.lineWidth}px solid;
      border-image: linear-gradient(100deg, #ffffff53 0%, #ffffff00 100%);
      border-image-slice: 1 0 0 1;
      filter: blur(2px);
    }

    &::after {
      padding: ${token.lineWidth}px;
      background: linear-gradient(180deg, #ffffff26 0%, #ffffff00 100%);
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask-composite: exclude;
    }
  `,
  menuButton: css`
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: ${token.colorText};
  `,
}));

const styleState = useStyles();

const cssVars = computed(() => ({
  "--ant-doc-header-height": `${isMobile.value ? DOC_HEADER_MOBILE_HEIGHT : DOC_HEADER_HEIGHT}px`,
}));
</script>

<template>
  <header
    :class="
      clsx(
        styleState.styles.header,
        (isMobile || isMini) && styleState.styles.background,
        (isMobile || isMini) && styleState.styles.mobile,
        isMini && styleState.styles.mini,
        isMini && isRTL && styleState.styles.miniRtl,
        isHidden && styleState.styles.hidden,
      )
    "
    :style="cssVars"
  >
    <HeaderLogo
      :isZhCN="isZhCN"
      :isRTL="isRTL"
      :isMobile="isMobile"
      :isMini="isMini"
    />

    <template v-if="isMobile">
      <div style="flex: 1; min-width: 0; padding: 0 8px">
        <DocSearch />
      </div>

      <a-button
        type="text"
        :class="styleState.styles.menuButton"
        @click="open = !open"
      >
        <template #icon>
          <CloseOutlined v-if="open" />
          <MenuOutlined v-else />
        </template>
      </a-button>

      <a-drawer
        v-model:open="open"
        placement="top"
        :closable="false"
        :style="{ height: '100%' }"
        :z-index="999"
      >
        <div class="px-16px py-12px">
          <DocSearch />
        </div>

        <HeaderNavigation
          :isZhCN="isZhCN"
          :isRTL="isRTL"
          :isMobile="isMobile"
          :isMini="isMini"
        />

        <template #footer>
          <HeaderActions
            :isZhCN="isZhCN"
            :isRTL="isRTL"
            :isMobile="isMobile"
            :isMini="isMini"
          />
        </template>
      </a-drawer>
    </template>

    <template v-else>
      <HeaderNavigation
        :isZhCN="isZhCN"
        :isRTL="isRTL"
        :isMobile="isMobile"
        :isMini="isMini"
        :class-name="
          !isMobile && !isMini ? styleState.styles.background : undefined
        "
      />

      <HeaderActions
        v-if="!isActionHidden"
        :isZhCN="isZhCN"
        :isRTL="isRTL"
        :isMobile="isMobile"
        :isMini="isMini"
      />
    </template>
  </header>
</template>
