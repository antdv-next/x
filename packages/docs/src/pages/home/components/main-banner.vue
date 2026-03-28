<script setup lang="ts">
import { createStyles } from "antdv-style";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useLocale } from "@/composables/use-locale";

import {
  getHomeRichSpecLink,
  HOME_BREAKPOINTS,
  HOME_LAYOUT,
  HOME_LINKS,
} from "../constants";
import LottiePlayer from "./lottie-player.vue";

const { t, locale } = useLocale();
const router = useRouter();
const animationDirection = ref<1 | -1>(1);

const designUrl = computed(() => getHomeRichSpecLink(locale.value));

const useStyles = createStyles(({ token, css }) => ({
  root: css`
    width: 100vw;
    height: calc(100vh - 160px);
    min-height: 600px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
    overflow: hidden;

    @media only screen and (max-width: ${HOME_BREAKPOINTS.MOBILE}px) {
      height: calc(100vh - ${token.paddingLG}px);
    }
  `,
  background: css`
    width: 100%;
    height: 100vh;
    position: absolute;
    filter: blur(50px);
    background: linear-gradient(135deg, #ffffff26 14%, #ffffff0d 59%);
    pointer-events: none;
    z-index: 0;
  `,
  container: css`
    width: 100%;
    margin: 0 auto;
    max-width: ${HOME_LAYOUT.MAX_WIDTH - HOME_LAYOUT.CONTAINER_MARGIN * 2}px;
    height: 100%;
    max-height: calc(100vh - ${HOME_LAYOUT.HEADER_HEIGHT * 2}px);
    position: relative;
    z-index: 1;

    @media only screen and (max-width: ${HOME_LAYOUT.MAX_WIDTH}px) {
      max-width: calc(100vw - ${HOME_LAYOUT.CONTAINER_MARGIN * 2}px);
    }

    @media only screen and (max-width: ${HOME_BREAKPOINTS.MOBILE}px) {
      max-width: calc(100vw - ${token.marginLG * 2}px);
    }
  `,
  titleWrap: css`
    max-width: ${HOME_BREAKPOINTS.MOBILE - token.padding * 2}px;
    position: absolute;
    top: 50%;
    inset-inline-start: 0;
    transform: translateY(-50%);
    z-index: 1;

    @media only screen and (max-width: ${HOME_BREAKPOINTS.MOBILE}px) {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: ${token.paddingXS}px;
    }
  `,
  logo: css`
    margin: 0;
    font-size: 80px !important;
    line-height: 1.3;
    font-weight: 700;
    color: #fff;

    @media only screen and (max-width: ${HOME_BREAKPOINTS.MOBILE}px) {
      font-size: 54px !important;
    }
  `,
  title: css`
    margin: 0;
    font-size: 80px !important;
    line-height: 1.3;
    font-weight: 700;
    color: #fff;

    @media only screen and (max-width: ${HOME_BREAKPOINTS.MOBILE}px) {
      font-size: 54px !important;
    }
  `,
  iWrap: css`
    font-size: 60px;
    display: inline-block;
    position: relative;

    @media only screen and (max-width: ${HOME_BREAKPOINTS.MOBILE}px) {
      transform: scale(0.7);
      top: 6px;
    }
  `,
  iStar: css`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 22px;
    height: 22px;
    background: no-repeat center/cover
      url("https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*RMOpRLHgA9wAAAAAAAAAAAAADgCCAQ/original");

    &::before {
      content: "";
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border-radius: inherit;
      position: absolute;
      background: radial-gradient(circle, #fe8aff 0%, #fe8aff00 100%);
      filter: blur(12px);
    }
  `,
  desc: css`
    margin: ${token.marginLG}px 0 ${token.marginLG * 2}px 0;
    max-width: 500px;
    font-size: ${token.fontSizeHeading5}px;
    line-height: 1.6;
    color: ${token.colorText};
    opacity: 0.65;
  `,
  content: css`
    display: flex;
    gap: ${token.paddingLG}px;
    flex-wrap: wrap;

    @media only screen and (max-width: ${HOME_BREAKPOINTS.MOBILE}px) {
      justify-content: center;
    }
  `,
  cta: css`
    height: 56px;
    border: none;
    border-radius: 40px;
    padding: 0 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    font-weight: 600;
    box-shadow: ${token.boxShadow};
    position: relative;
    text-decoration: none;
    user-select: none;
    transition: all 0.2s;

    @media only screen and (max-width: ${HOME_BREAKPOINTS.MOBILE}px) {
      padding: 0 ${token.paddingLG}px;
    }
  `,
  ctaPrimary: css`
    background: linear-gradient(90deg, #c7deff 0%, #ffffffd9 76%);
    color: #14204c;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      border-radius: 40px;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.5);
      opacity: 0;
      z-index: 0;
      transition: opacity 0.2s;
    }

    > span {
      position: relative;
      z-index: 1;
    }

    &:hover,
    &:focus-visible {
      color: #14204c;
    }

    &:hover::after {
      opacity: 1;
    }
  `,
  ctaGhost: css`
    background: #ffffff1a;
    backdrop-filter: blur(40px);
    border: ${token.lineWidth}px solid transparent;
    color: #fff;

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

    &:hover,
    &:focus-visible {
      color: #fff;
      background: #ffffff21;
    }
  `,
  lottie: css`
    position: absolute;
    top: 50%;
    inset-inline-end: 0;
    transform: translate(${HOME_LAYOUT.CONTAINER_MARGIN}px, -40%);
    z-index: 0;

    @media only screen and (max-width: ${HOME_BREAKPOINTS.MOBILE}px) {
      display: none;
    }
  `,
  descMobileAlign: css`
    @media only screen and (max-width: ${HOME_BREAKPOINTS.MOBILE}px) {
      margin-inline: auto;
    }
  `,
}));

const styleState = useStyles();

function gotoComponents() {
  void router.push(HOME_LINKS.components);
}

function gotoDesign() {
  if (typeof window === "undefined") return;
  window.open(designUrl.value, "_blank", "noopener,noreferrer");
}

function onMainLottieLoad(animation: {
  addEventListener: (name: string, cb: () => void) => void;
  setSpeed: (speed: number) => void;
  playSegments?: (segments: [number, number], forceFlag?: boolean) => void;
  loop?: boolean;
}) {
  animation.addEventListener("complete", () => {
    if (typeof animation.loop !== "undefined") animation.loop = true;
    animation.setSpeed(0.7);
    animation.playSegments?.([100, 150], false);
  });
}

function onBackgroundLottieLoad(animation: {
  addEventListener: (name: string, cb: () => void) => void;
  setSpeed: (speed: number) => void;
  setDirection?: (direction: 1 | -1) => void;
  play: () => void;
}) {
  animation.addEventListener("complete", () => {
    animationDirection.value = animationDirection.value === -1 ? 1 : -1;
    animation.setDirection?.(animationDirection.value);
    animation.setSpeed(0.6);
    animation.play();
  });
}
</script>

<template>
  <section :class="styleState.styles.root">
    <LottiePlayer
      :class="styleState.styles.background"
      fill
      path="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/file/A*3QcuQpaOguQAAAAAAAAAAAAADgCCAQ"
      :on-load="onBackgroundLottieLoad"
    />

    <div :class="styleState.styles.container">
      <div :class="styleState.styles.titleWrap">
        <h1 :class="styleState.styles.logo">Antdv Next X</h1>
        <h1 :class="styleState.styles.title">
          {{ t("home.mainBanner.slogan") }}
        </h1>
        <p :class="[styleState.styles.desc, styleState.styles.descMobileAlign]">
          {{ t("home.mainBanner.desc") }}
        </p>
        <div :class="styleState.styles.content">
          <button
            type="button"
            :class="[styleState.styles.cta, styleState.styles.ctaPrimary]"
            @click="gotoComponents"
          >
            <span>{{ t("home.mainBanner.start") }}</span>
          </button>
          <div
            :class="[styleState.styles.cta, styleState.styles.ctaGhost]"
            role="button"
            tabindex="0"
            @click="gotoDesign"
            @keydown.enter="gotoDesign"
            @keydown.space.prevent="gotoDesign"
          >
            {{ t("home.mainBanner.design") }}
          </div>
        </div>
      </div>

      <div :class="styleState.styles.lottie">
        <LottiePlayer
          :on-load="onMainLottieLoad"
          path="https://mdn.alipayobjects.com/huamei_lkxviz/afts/file/n25_R7prS_0AAAAAQPAAAAgADtFMAQFr"
        />
      </div>
    </div>
  </section>
</template>
