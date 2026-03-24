<script setup lang="ts">
import { createStyles } from "antdv-style";
import { computed } from "vue";

import { useLocale } from "@/composables/use-locale";

import { HOME_LINKS } from "../constants";
import HomeContainer from "./home-container.vue";
import LottiePlayer from "./lottie-player.vue";

const { t, locale } = useLocale();
const specUrl = computed(() =>
  locale.value === "en-US" ? HOME_LINKS.richSpecEn : HOME_LINKS.richSpecZh,
);

const useStyles = createStyles(({ css }) => ({
  link: css`
    display: block;
    text-decoration: none;
    color: inherit;
  `,
  container: css`
    height: 500px;
    overflow: hidden;
    cursor: pointer;
  `,
  lottie: css`
    width: 100%;
    height: auto;
    transform: translate(0, -20%);
  `,
}));

const styleState = useStyles();

function openSpec() {
  if (typeof window === "undefined") return;
  window.open(specUrl.value, "_blank", "noopener,noreferrer");
}
</script>

<template>
  <div
    :class="styleState.styles.link"
    role="button"
    tabindex="0"
    @click="openSpec"
    @keydown.enter="openSpec"
    @keydown.space.prevent="openSpec"
  >
    <HomeContainer
      :class="styleState.styles.container"
      :title="t('home.designBanner.title')"
      :desc="t('home.designBanner.desc')"
    >
      <div :class="styleState.styles.lottie">
        <LottiePlayer
          path="https://mdn.alipayobjects.com/huamei_lkxviz/afts/file/nLaTTqe5cMAAAAAAQiAAAAgADtFMAQFr"
          :autoplay="false"
          :on-visible-play="true"
        />
      </div>
    </HomeContainer>
  </div>
</template>
