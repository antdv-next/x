<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { Button, Carousel } from "antdv-next";
import { createStyles } from "antdv-style";
import { computed, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

import HomeContainer from "./home-container.vue";
import AssistantScene from "./scenes/assistant-scene.vue";
import IndependentScene from "./scenes/independent-scene.vue";
import NestScene from "./scenes/nest-scene.vue";

const { t } = useLocale();
const isMobile = useMediaQuery("(max-width: 900px)");

const tabItems = computed(() => [
  {
    key: "independent",
    title: t("home.scenes.independentTitle"),
    desc: t("home.scenes.independentDesc"),
    img: "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*YVjbTqbc7ngAAAAAAAAAAAAADgCCAQ/fmt.avif",
  },
  {
    key: "assistant",
    title: t("home.scenes.assistantTitle"),
    desc: t("home.scenes.assistantDesc"),
    img: "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*kCojRo0SoAAAAAAAAAAAAAAADgCCAQ/fmt.avif",
  },
  {
    key: "nest",
    title: t("home.scenes.nestTitle"),
    desc: t("home.scenes.nestDesc"),
    img: "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*krfsT5zBSuUAAAAAAAAAAAAADgCCAQ/fmt.avif",
  },
  {
    key: "app",
    title: t("home.scenes.appTitle"),
    desc: t("home.scenes.appDesc"),
    disabled: true,
  },
]);

const mobileItems = computed(() => tabItems.value.filter(item => !!item.img));
const active = ref("independent");
const activeScene = computed(() => {
  if (active.value === "independent") return IndependentScene;
  if (active.value === "assistant") return AssistantScene;
  if (active.value === "nest") return NestScene;
  return null;
});

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    position: relative;

    @media screen and (max-width: 767.99px) {
      height: 100vh;
    }
  `,
  contentBg: css`
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(10%, -20%);
  `,
  content: css`
    display: flex;
    justify-content: space-between;
    gap: ${token.paddingXL}px;
    width: 100%;
    margin-top: 50px;
  `,
  tab: css`
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: ${token.margin}px;
  `,
  tabContent: css`
    flex: 1;
    max-width: 890px;
    height: 600px;
    box-sizing: border-box;
    background-image: url("https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*RxJMSbQRvTUAAAAAAAAAAAAADgCCAQ/fmt.avif");
    background-repeat: no-repeat;
    background-size: cover;
    z-index: 2;
    overflow: hidden;
    border-radius: 8px;
  `,
  item: css`
    position: relative;
    border-radius: 20px;
    height: 86px;
    padding: ${token.padding}px;
    box-sizing: border-box;
    display: flex;
    gap: 4px;
    flex-direction: column;
    align-items: flex-start;
    cursor: pointer;
    border: none !important;
    background: transparent !important;

    &:not(:disabled):hover {
      background: #ffffff14 !important;
    }
  `,
  itemDisabled: css`
    h3,
    p {
      color: ${token.colorTextDisabled};
    }
  `,
  itemActive: css`
    background: #ffffff1a !important;

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
      padding: ${token.lineWidth}px;
      background: linear-gradient(180deg, #ffffff26 0%, #ffffff00 100%);
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask-composite: exclude;
      -webkit-mask-composite: xor;
    }
  `,
  itemTitle: css`
    margin: 0;
    font-size: ${token.fontSizeHeading4}px;
    color: #fff;
    font-weight: 500;
  `,
  itemDesc: css`
    margin: 0;
    font-size: 14px;
    color: #fff;
    line-height: 22px;
    opacity: 0.65;
  `,
  mobileCard: css`
    margin: ${token.marginXXL}px 0;

    h3 {
      margin: 0;
      text-align: center;
      font-size: ${token.fontSizeHeading3}px;
      color: #fff;
    }

    p {
      margin: 8px 0 0;
      text-align: center;
      color: #fff;
      opacity: 0.65;
    }

    img {
      width: 100%;
      background: #0c0e10cc;
      border-radius: 12px;
      margin-top: ${token.margin}px;
    }
  `,
}));

const styleState = useStyles();
</script>

<template>
  <HomeContainer
    :class="styleState.styles.container"
    :title="t('home.scenes.title')"
    :desc="t('home.scenes.desc')"
  >
    <img
      v-if="!isMobile"
      :class="styleState.styles.contentBg"
      src="https://mdn.alipayobjects.com/huamei_k0vkmw/afts/img/A*aSLTSr53DPAAAAAAAAAAAAAADsR-AQ/original"
      alt="bg"
    />

    <Carousel
      v-if="isMobile"
      autoplay
      draggable
      :autoplay-speed="5000"
      swipe-to-slide
    >
      <div
        v-for="item in mobileItems"
        :key="item.key"
        :class="styleState.styles.mobileCard"
      >
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
        <img :src="item.img" :alt="item.title" loading="lazy" />
      </div>
    </Carousel>

    <div v-else :class="styleState.styles.content">
      <div :class="styleState.styles.tab">
        <Button
          v-for="item in tabItems"
          :key="item.key"
          type="text"
          :disabled="item.disabled"
          :class="[
            styleState.styles.item,
            active === item.key && styleState.styles.itemActive,
            item.disabled && styleState.styles.itemDisabled,
          ]"
          @click="active = item.key"
        >
          <h3 :class="styleState.styles.itemTitle">{{ item.title }}</h3>
          <p :class="styleState.styles.itemDesc">{{ item.desc }}</p>
        </Button>
      </div>
      <div v-if="active !== 'app'" :class="styleState.styles.tabContent">
        <Transition name="scene-fade" mode="out-in">
          <component :is="activeScene" :key="active" />
        </Transition>
      </div>
    </div>
  </HomeContainer>
</template>

<style scoped>
.scene-fade-enter-active,
.scene-fade-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.scene-fade-enter-from,
.scene-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
