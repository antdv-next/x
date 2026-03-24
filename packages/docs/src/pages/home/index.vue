<script setup lang="ts">
import { createStyles } from "antdv-style";

import DocHeader from "@/layouts/docs/components/doc-header.vue";

import CompIntroduction from "./components/comp-introduction.vue";
import DesignBanner from "./components/design-banner.vue";
import DesignGuide from "./components/design-guide.vue";
import MainBanner from "./components/main-banner.vue";
import SceneIntroduction from "./components/scene-introduction.vue";

const useStyles = createStyles(({ css }) => ({
  section: css`
    background: linear-gradient(
      180deg,
      #1e2226e6 0%,
      #1c2024 38%,
      #16191c 100%
    );
    border-radius: 40px 40px 0 0;
    backdrop-filter: blur(40px);
    display: flex;
    flex-direction: column;
    gap: 100px;
    padding: 100px 0;
  `,
  container: css`
    margin-top: -40px;
  `,
}));

const styleState = useStyles();
</script>

<template>
  <main class="antdv-home-page min-h-100vh">
    <DocHeader class="fixed!" />
    <MainBanner />
    <section :class="styleState.styles.section">
      <DesignBanner />
    </section>
    <section :class="[styleState.styles.section, styleState.styles.container]">
      <DesignGuide />
    </section>
    <section :class="[styleState.styles.section, styleState.styles.container]">
      <SceneIntroduction />
      <CompIntroduction />
    </section>
  </main>
</template>

<style>
.antdv-home-page {
  overflow-x: hidden;
}
</style>
