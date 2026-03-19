<script setup lang="ts">
import { createStyles } from "antdv-style";

import { useLocale } from "@/composables/use-locale";

import GroupMaskLayer from "./group-mask-layer.vue";
import LuminousBg from "./luminous-bg.vue";

const { t } = useLocale();

const useStyles = createStyles(({ token }) => ({
  root: {
    height: "100vh",
    minHeight: 600,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    perspective: 800,
    transform: "translateZ(1000px)",
    fontFamily:
      'AlibabaPuHuiTi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    ".antdv-home-preview-banner-typography": {
      textAlign: "center",
      position: "relative",
      zIndex: 1,
      paddingInline: token.paddingXL,
      textShadow: `0 0 4px ${token.colorBgContainer}, 0 0 4px ${token.colorBgContainer}, 0 0 4px ${token.colorBgContainer}, 0 0 4px ${token.colorBgContainer}, 0 0 4px ${token.colorBgContainer}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    ".antdv-home-preview-banner-title": {
      fontWeight: "900 !important",
      fontSize: "80px !important",
      lineHeight: "1.3 !important",
      marginBottom: "0 !important",
    },
    ".antdv-home-preview-banner-desc": {
      fontSize: "16px !important",
      fontWeight: "400 !important",
      marginBottom: "48px !important",
      color: token.colorText,
      opacity: 0.65,
      maxWidth: 500,
    },
    ".antdv-home-preview-banner-buttons": {
      position: "relative",
      zIndex: 1,
      marginBottom: token.marginXL,
    },
    ".antdv-home-banner-btn": {
      height: 56,
      border: "none",
      borderRadius: 40,
      padding: "0 40px",
      fontSize: 18,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
    },
    ".start-btn": {
      background: token.colorPrimary,
      color: "#fff",
    },
    ".start-btn:hover": {
      opacity: 0.9,
      color: "#fff",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
    },
    ".design-btn": {
      background: "transparent",
      border: `1px solid ${token.colorPrimary}`,
      color: token.colorPrimary,
    },
    ".design-btn:hover": {
      background: token.colorPrimaryBg,
      color: token.colorPrimary,
      borderColor: token.colorPrimary,
      transform: "translateY(-2px)",
    },
    ".antdv-home-preview-banner-child": {
      position: "relative",
      width: "100%",
      maxWidth: 1200,
      margin: "0 auto",
      zIndex: 1,
    },
    "@media only screen and (max-width: 768px)": {
      ".antdv-home-preview-banner-title": {
        fontSize: "54px !important",
      },
      ".antdv-home-banner-btn": {
        padding: "0 24px",
      },
    },
  },
}));

const styleState = useStyles();
</script>

<template>
  <GroupMaskLayer>
    <div
      class="antdv-home-preview-banner-holder"
      :class="styleState.styles.root"
    >
      <LuminousBg />

      <a-typography
        component="article"
        class="antdv-home-preview-banner-typography"
      >
        <h1 class="antdv-home-preview-banner-title">Antd Next X</h1>
        <p class="antdv-home-preview-banner-desc">
          {{ t("home.desc") }}
        </p>
      </a-typography>

      <a-flex gap="large" class="antdv-home-preview-banner-buttons">
        <a-button class="antdv-home-banner-btn start-btn" href="/components">
          {{ t("home.start") }}
        </a-button>
        <a-button
          class="antdv-home-banner-btn design-btn"
          href="https://x.ant.design/docs/spec/introduce-cn"
          target="_blank"
        >
          {{ t("home.design") }}
        </a-button>
      </a-flex>

      <div class="antdv-home-preview-banner-child" />
    </div>
  </GroupMaskLayer>
</template>
