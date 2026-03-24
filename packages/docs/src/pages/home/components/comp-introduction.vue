<script setup lang="ts">
import { Bubble, Conversations, Sender } from "@antdv-next/x";
import { useMediaQuery } from "@vueuse/core";
import { createStyles } from "antdv-style";
import { computed } from "vue";
import { useRouter } from "vue-router";

import { useLocale } from "@/composables/use-locale";

import { DESIGN_STAGE_COLOR, HOME_LINKS } from "../constants";
import HomeContainer from "./home-container.vue";

interface HomeCard {
  key: string;
  title: string;
  desc: string;
  tag: string;
  startColor: string;
  endColor: string;
  path: string;
  previewType:
    | "welcome"
    | "prompts"
    | "suggestion"
    | "bubble"
    | "actions"
    | "conversations";
  cover?: string;
}

const { t, locale } = useLocale();
const router = useRouter();
const isTablet = useMediaQuery("(max-width: 1180px)");
const isMobile = useMediaQuery("(max-width: 900px)");

const items = computed<HomeCard[]>(() => [
  {
    key: "welcome",
    title: t("home.components.welcomeTitle"),
    desc: t("home.components.welcomeDesc"),
    tag: t("home.components.welcomeTag"),
    startColor: DESIGN_STAGE_COLOR.AWAKE.START,
    endColor: DESIGN_STAGE_COLOR.AWAKE.END,
    path: HOME_LINKS.welcome,
    previewType: "welcome",
  },
  {
    key: "prompts",
    title: t("home.components.promptsTitle"),
    desc: t("home.components.promptsDesc"),
    tag: t("home.components.promptsTag"),
    startColor: DESIGN_STAGE_COLOR.AWAKE.START,
    endColor: DESIGN_STAGE_COLOR.AWAKE.END,
    path: HOME_LINKS.welcome,
    previewType: "prompts",
  },
  {
    key: "suggestion",
    title: t("home.components.suggestionTitle"),
    desc: t("home.components.suggestionDesc"),
    tag: t("home.components.suggestionTag"),
    startColor: DESIGN_STAGE_COLOR.EXPRESS.START,
    endColor: DESIGN_STAGE_COLOR.EXPRESS.END,
    path: HOME_LINKS.attachments,
    previewType: "suggestion",
    cover:
      locale.value === "en-US"
        ? "https://mdn.alipayobjects.com/huamei_k0vkmw/afts/img/A*SUJFTbqovJsAAAAAAAAAAAAADsR-AQ/fmt.avif"
        : "https://mdn.alipayobjects.com/huamei_k0vkmw/afts/img/A*-c6EQ7U4-4oAAAAAAAAAAAAADsR-AQ/fmt.avif",
  },
  {
    key: "bubble",
    title: t("home.components.bubbleTitle"),
    desc: t("home.components.bubbleDesc"),
    tag: t("home.components.bubbleTag"),
    startColor: DESIGN_STAGE_COLOR.CONFIRM.START,
    endColor: DESIGN_STAGE_COLOR.CONFIRM.END,
    path: HOME_LINKS.think,
    previewType: "bubble",
    cover:
      locale.value === "en-US"
        ? "https://mdn.alipayobjects.com/huamei_k0vkmw/afts/img/A*EDPdR54UBncAAAAAAAAAAAAADsR-AQ/fmt.avif"
        : "https://mdn.alipayobjects.com/huamei_k0vkmw/afts/img/A*WxlPTYGnviYAAAAAAAAAAAAADsR-AQ/fmt.avif",
  },
  {
    key: "actions",
    title: t("home.components.actionsTitle"),
    desc: t("home.components.actionsDesc"),
    tag: t("home.components.actionsTag"),
    startColor: DESIGN_STAGE_COLOR.FEEDBACK.START,
    endColor: DESIGN_STAGE_COLOR.FEEDBACK.END,
    path: HOME_LINKS.actions,
    previewType: "actions",
  },
  {
    key: "conversations",
    title: t("home.components.conversationsTitle"),
    desc: t("home.components.conversationsDesc"),
    tag: t("home.components.conversationsTag"),
    startColor: DESIGN_STAGE_COLOR.COMMON.START,
    endColor: DESIGN_STAGE_COLOR.COMMON.END,
    path: "/components/conversations",
    previewType: "conversations",
    cover:
      "https://mdn.alipayobjects.com/huamei_k0vkmw/afts/img/A*7nVeT7Qg-QoAAAAAAAAAAAAADsR-AQ/fmt.avif",
  },
]);

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    overflow: hidden;
  `,
  grid: css`
    display: grid;
    width: 100%;
    gap: ${token.padding + token.paddingSM}px;
    margin-top: ${token.marginXXL}px;
  `,
  card: css`
    background: #0c0e10cc;
    border-radius: 24px;
    padding: ${token.padding + token.paddingSM}px;
    overflow: hidden;
    position: relative;
    text-decoration: none;
    color: #fff;
    transition: transform ${token.motionDurationMid};

    &:hover {
      transform: translateY(-2px);
    }

    &:hover::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 24px;
      padding: ${token.lineWidth * 2}px;
      background: linear-gradient(180deg, #ffffff20 0%, #ffffff0d 100%);
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask-composite: exclude;
      -webkit-mask-composite: xor;
      pointer-events: none;
    }
  `,
  header: css`
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    background: linear-gradient(180deg, #1f252b 0%, #171b1f 100%);
    overflow: hidden;

    img {
      width: auto;
      max-width: 290px;
      max-height: 220px;
      object-fit: contain;
    }
  `,
  headerNarrow: css`
    img {
      max-width: 173px;
    }
  `,
  previewSender: css`
    width: min(330px, 100%);
    border-radius: 20px;
    overflow: hidden;
  `,
  previewBubble: css`
    width: min(320px, 100%);
  `,
  previewConversations: css`
    width: min(320px, 100%);
    height: 220px;
  `,
  content: css`
    display: flex;
    align-items: center;
    gap: ${token.paddingSM}px;
    margin-top: ${token.paddingSM}px;
  `,
  title: css`
    display: flex;
    align-items: center;
    gap: ${token.paddingXS}px;
    font-size: ${token.fontSizeHeading4}px;
    font-weight: 700;
    margin: 0 0 ${token.paddingXS}px;
  `,
  tag: css`
    border-radius: 4px;
    color: transparent;
    height: 24px;
    line-height: 24px;
    box-sizing: border-box;
    font-size: ${token.fontSizeSM}px;
    padding: 0 8px;
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: #ffffff;
      opacity: 0.1;
    }
  `,
  desc: css`
    margin: 0;
    text-align: start;
    font-size: ${token.fontSizeSM}px;
    line-height: 1.75;
    color: rgba(255, 255, 255, 0.65);
  `,
}));

const styleState = useStyles();

const gridColumns = computed(() => {
  if (isMobile.value) return "1fr";
  if (isTablet.value) return "repeat(2, minmax(0, 1fr))";
  return "repeat(3, minmax(0, 1fr))";
});

function goto(path: string) {
  void router.push(path);
}
</script>

<template>
  <HomeContainer
    :class="styleState.styles.container"
    :title="t('home.components.title')"
    :desc="t('home.components.desc')"
  >
    <div
      :class="styleState.styles.grid"
      :style="{ gridTemplateColumns: gridColumns }"
    >
      <div
        v-for="item in items"
        :key="item.key"
        :class="styleState.styles.card"
        role="button"
        tabindex="0"
        @click="goto(item.path)"
        @keydown.enter="goto(item.path)"
        @keydown.space.prevent="goto(item.path)"
      >
        <div
          :class="[
            styleState.styles.header,
            item.previewType === 'bubble' && styleState.styles.headerNarrow,
          ]"
        >
          <img
            v-if="item.cover"
            :src="item.cover"
            :alt="item.title"
            loading="lazy"
          />

          <Sender
            v-else-if="item.previewType === 'suggestion'"
            :class="styleState.styles.previewSender"
            :value="t('home.scenes.question1')"
            :read-only="true"
          />

          <Bubble
            v-else-if="item.previewType === 'bubble'"
            :class="styleState.styles.previewBubble"
            content="Processing your request..."
            :typing="{ effect: 'typing', step: 5, interval: 20 }"
          />

          <Conversations
            v-else-if="item.previewType === 'conversations'"
            :class="styleState.styles.previewConversations"
            :items="[
              { key: '1', label: 'UI Design' },
              { key: '2', label: 'Copilot' },
              { key: '3', label: 'Data Insight' },
            ]"
            default-active-key="1"
          />

          <Bubble
            v-else-if="item.previewType === 'actions'"
            :class="styleState.styles.previewBubble"
            content="Result actions: copy, retry, feedback"
          />

          <Bubble
            v-else
            :class="styleState.styles.previewBubble"
            :content="
              item.previewType === 'welcome'
                ? t('home.scenes.greeting')
                : t('home.scenes.helpText')
            "
          />
        </div>

        <div :class="styleState.styles.content">
          <div>
            <h3 :class="styleState.styles.title">
              {{ item.title }}
              <span
                :class="styleState.styles.tag"
                :style="{
                  background: `linear-gradient(127deg, ${item.startColor} 23%, ${item.endColor} 100%)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }"
              >
                {{ item.tag }}
              </span>
            </h3>
            <p :class="styleState.styles.desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </HomeContainer>
</template>
