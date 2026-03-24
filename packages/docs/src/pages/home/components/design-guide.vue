<script setup lang="ts">
import { Button } from "antdv-next";
import { createStyles } from "antdv-style";
import { computed } from "vue";
import { useRouter } from "vue-router";

import { useLocale } from "@/composables/use-locale";

import { DESIGN_STAGE_COLOR, HOME_LINKS } from "../constants";
import HomeContainer from "./home-container.vue";

const { t } = useLocale();
const router = useRouter();
const COMMA = "\u00A0,\u00A0\u00A0\u00A0";

const items = computed(() => [
  {
    key: "awaken",
    icon: "https://mdn.alipayobjects.com/huamei_lkxviz/afts/img/f14LTKOFxRsAAAAAQbAAAAgADtFMAQFr/original",
    label: t("home.designGuide.awaken"),
    title: t("home.designGuide.awakenTitle")
      .replace(", ", COMMA)
      .replace("，", COMMA),
    titleParts: t("home.designGuide.awakenTitle")
      .replace(", ", COMMA)
      .replace("，", COMMA)
      .split(t("home.designGuide.awaken")),
    desc: t("home.designGuide.awakenDesc"),
    action: t("home.designGuide.awakenAction"),
    startColor: DESIGN_STAGE_COLOR.AWAKE.START,
    endColor: DESIGN_STAGE_COLOR.AWAKE.END,
    path: HOME_LINKS.welcome,
  },
  {
    key: "express",
    icon: "https://mdn.alipayobjects.com/huamei_lkxviz/afts/img/dGfqSaM9ZxoAAAAAQaAAAAgADtFMAQFr/original",
    label: t("home.designGuide.express"),
    title: t("home.designGuide.expressTitle")
      .replace(", ", COMMA)
      .replace("，", COMMA),
    titleParts: t("home.designGuide.expressTitle")
      .replace(", ", COMMA)
      .replace("，", COMMA)
      .split(t("home.designGuide.express")),
    desc: t("home.designGuide.expressDesc"),
    action: t("home.designGuide.expressAction"),
    startColor: DESIGN_STAGE_COLOR.EXPRESS.START,
    endColor: DESIGN_STAGE_COLOR.EXPRESS.END,
    path: HOME_LINKS.attachments,
  },
  {
    key: "confirm",
    icon: "https://mdn.alipayobjects.com/huamei_lkxviz/afts/img/BQaCTIUU-CkAAAAAQZAAAAgADtFMAQFr/original",
    label: t("home.designGuide.confirm"),
    title: t("home.designGuide.confirmTitle")
      .replace(", ", COMMA)
      .replace("，", COMMA),
    titleParts: t("home.designGuide.confirmTitle")
      .replace(", ", COMMA)
      .replace("，", COMMA)
      .split(t("home.designGuide.confirm")),
    desc: t("home.designGuide.confirmDesc"),
    action: t("home.designGuide.confirmAction"),
    startColor: DESIGN_STAGE_COLOR.CONFIRM.START,
    endColor: DESIGN_STAGE_COLOR.CONFIRM.END,
    path: HOME_LINKS.think,
  },
  {
    key: "feedback",
    icon: "https://mdn.alipayobjects.com/huamei_lkxviz/afts/img/r-DuSZG-9NIAAAAAQdAAAAgADtFMAQFr/original",
    label: t("home.designGuide.feedback"),
    title: t("home.designGuide.feedbackTitle")
      .replace(", ", COMMA)
      .replace("，", COMMA),
    titleParts: t("home.designGuide.feedbackTitle")
      .replace(", ", COMMA)
      .replace("，", COMMA)
      .split(t("home.designGuide.feedback")),
    desc: t("home.designGuide.feedbackDesc"),
    action: t("home.designGuide.feedbackAction"),
    startColor: DESIGN_STAGE_COLOR.FEEDBACK.START,
    endColor: DESIGN_STAGE_COLOR.FEEDBACK.END,
    path: HOME_LINKS.actions,
  },
]);

const useStyles = createStyles(({ token, css }) => ({
  container: css``,
  content: css`
    display: flex;
    justify-content: space-between;
    padding-top: 100px;
  `,
  chain: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 540px;
  `,
  chainItem: css`
    display: flex;
    gap: ${token.paddingLG}px;
    color: #fff;
  `,
  chainItemContent: css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: ${token.paddingLG}px;
    overflow: hidden;
  `,
  chainItemLine: css`
    height: 300px;
    width: 4px;
    margin: 0 auto;
  `,
  chainItemLabel: css`
    font-size: ${token.fontSizeHeading4}px;
    font-weight: 700;
    line-height: 40px;
  `,
  chainItemTitle: css`
    font-size: ${token.fontSizeHeading1 + 10}px;
    line-height: 56px;
    font-weight: 700;

    @media only screen and (max-width: 767.99px) {
      font-size: ${token.fontSizeHeading2}px;
    }
  `,
  chainItemDesc: css`
    font-size: ${token.fontSizeHeading5}px;
    line-height: 32px;
    opacity: 0.65;
  `,
  chainItemAction: css`
    background: #ffffff1a;
    position: relative;
    border-radius: 40px;
    width: min-content;
    padding: ${token.paddingLG}px;
    overflow: hidden;
    font-size: ${token.fontSizeHeading5}px;
    font-weight: 700;
    opacity: 0.9;
    border: none !important;
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
  `,
  chainItemIcon: css`
    width: 40px;
    height: 40px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: auto;
      height: 40px;
      position: absolute;
    }
  `,
}));

const styleState = useStyles();
</script>

<template>
  <HomeContainer
    :class="styleState.styles.container"
    :title="t('home.designGuide.title')"
    :desc="t('home.designGuide.desc')"
  >
    <div :class="styleState.styles.content">
      <div :class="styleState.styles.chain">
        <article
          v-for="(item, index) in items"
          :key="item.key"
          :class="styleState.styles.chainItem"
        >
          <div>
            <div :class="styleState.styles.chainItemIcon">
              <img :src="item.icon" alt="icon" loading="lazy" />
              <img
                :src="item.icon"
                alt="icon"
                loading="lazy"
                style="filter: blur(18px)"
              />
            </div>
            <div
              :class="styleState.styles.chainItemLine"
              :style="
                index === items.length - 1
                  ? {}
                  : {
                      backgroundImage: `linear-gradient(180deg, ${item.startColor}00 0%, ${item.startColor} 25%, ${item.endColor} 75%, ${item.endColor}00 100%)`,
                    }
              "
            />
          </div>
          <div :class="styleState.styles.chainItemContent">
            <div :class="styleState.styles.chainItemLabel">
              <span style="padding-inline-end: 10px">{{ index + 1 }}.</span>
              {{ item.label }}
            </div>
            <div :class="styleState.styles.chainItemTitle">
              <span>{{ item.titleParts[0] }}</span>
              <span
                :style="{
                  background: `linear-gradient(127deg, ${item.startColor} 23%, ${item.endColor} 100%)`,
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }"
              >
                {{ item.label }}
              </span>
              <span style="max-width: 100%; display: inline-block">
                {{ item.titleParts[1] || "" }}
              </span>
            </div>
            <div :class="styleState.styles.chainItemDesc">{{ item.desc }}</div>
            <Button
              type="text"
              size="large"
              :class="styleState.styles.chainItemAction"
              @click="() => router.push(item.path)"
            >
              {{ item.action }}
            </Button>
          </div>
        </article>
      </div>
    </div>
  </HomeContainer>
</template>
