<script setup lang="ts">
import { createStyles } from "antdv-style";
import { useRoute } from "vue-router";

import DocSearch from "@/components/doc-search/index.vue";
import { useActiveHeaderItem } from "@/composables/use-header-active";
import { headerItems } from "@/config/header";
import { resolveDocRoutePath } from "@/router/docs";
import { clsx } from "@/utils";

import type { DocHeaderSharedProps } from "./header-shared";

const props = defineProps<
  DocHeaderSharedProps & {
    className?: string;
  }
>();

const route = useRoute();

const useStyles = createStyles(({ token, css }) => ({
  nav: css`
    padding: 0 ${token.paddingLG}px;
    border-radius: 24px;
    box-sizing: border-box;
    display: flex;
    gap: ${token.paddingLG}px;
    align-items: center;

    a {
      min-width: 0;
      font-size: ${token.fontSizeLG}px;
      color: ${token.colorTextSecondary};
      text-decoration: none;
      transition:
        color ${token.motionDurationMid},
        opacity ${token.motionDurationMid};
    }

    a:hover {
      color: ${token.colorText};
    }
  `,
  pc: css`
    height: 48px;
    position: absolute;
    top: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    flex-direction: row;
  `,
  pcRtl: css`
    transform: translate(50%, -50%);

    @media only screen and (max-width: 767.99px) {
      transform: translate(0, 0);
    }
  `,
  mobile: css`
    padding: 80px 0 !important;
    flex-direction: column;
  `,
  mini: css`
    flex-direction: row;
    width: max-content;
    padding: 0 !important;
  `,
  itemActive: css`
    color: ${token.colorText} !important;
    font-weight: 500;
  `,
  itemLabel: css`
    white-space: nowrap;
  `,
  searchItem: css`
    display: flex;
    align-items: center;
  `,
}));

const styleState = useStyles();

const { activeKey } = useActiveHeaderItem();

function getItemPath(path: string) {
  return resolveDocRoutePath(path, props.isZhCN ? "zh-CN" : "en-US") ?? path;
}
</script>

<template>
  <nav
    :class="
      clsx(
        styleState.styles.nav,
        isMobile || isMini ? styleState.styles.mobile : styleState.styles.pc,
        isMini && styleState.styles.mini,
        !isMobile && !isMini && isRTL && styleState.styles.pcRtl,
        className,
      )
    "
  >
    <div v-if="!isMobile" :class="styleState.styles.searchItem">
      <DocSearch />
    </div>
    <router-link
      v-for="item in headerItems"
      :key="item.key"
      :to="{ path: getItemPath(item.path), query: route.query }"
      :class="clsx(activeKey === item.key && styleState.styles.itemActive)"
    >
      <span :class="styleState.styles.itemLabel">
        {{ item.label[isZhCN ? "zh-CN" : "en-US"] }}
      </span>
    </router-link>
  </nav>
</template>
