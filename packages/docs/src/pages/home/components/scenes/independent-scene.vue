<script setup lang="ts">
import type { BubbleItemType } from "@antdv-next/x";

import { BubbleList, Sender } from "@antdv-next/x";
import { Avatar, Space, Tag } from "antdv-next";
import { createStyles } from "antdv-style";
import { computed, h } from "vue";

import { useLocale } from "@/composables/use-locale";

import { useMockChat } from "../../composables/use-mock-chat";

const { t } = useLocale();
const chat = useMockChat(t("home.scenes.greeting"), t("home.scenes.waiting"));

const presets = computed(() => [
  t("home.scenes.question1"),
  t("home.scenes.question2"),
  t("home.scenes.question3"),
  t("home.scenes.question4"),
]);
const chatItems = computed(() =>
  chat.items.value.filter(item => item.role !== "system"),
);
const SEND_ICON =
  "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*4e5sTY9lU3sAAAAAAAAAAAAADgCCAQ/original";

const role = computed<any>(() => ({
  ai: {
    placement: "start",
    typing: { effect: "typing", step: 5, interval: 18 },
    avatar: () => h(Avatar, { size: 28 }, () => "AI"),
  },
  user: {
    placement: "end",
    avatar: () => h(Avatar, { size: 28 }, () => "U"),
    styles: {
      content: {
        background: "#3877FF",
        color: "#fff",
      },
    },
  },
}));

const useStyles = createStyles(({ token, css }) => ({
  root: css`
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: ${token.padding}px;
    padding-block: ${token.paddingXL}px;
  `,
  placeholderBubble: css`
    overflow: hidden;
    border-radius: 16px;
    background: linear-gradient(135deg, #ffffff26 14%, #ffffff0d 59%);
    padding: 24px;
  `,
  welcomeTitle: css`
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    opacity: 0.9;
    color: #fff;
  `,
  welcomeDesc: css`
    margin: 6px 0 14px;
    font-size: 12px;
    opacity: 0.65;
    color: #fff;
  `,
  promptsWrap: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 1000px) {
      grid-template-columns: 1fr;
    }
  `,
  promptBlock: css`
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 12px;
  `,
  promptTitle: css`
    color: #fff;
    font-size: 13px;
    opacity: 0.85;
    margin-bottom: 8px;
  `,
  promptBtn: css`
    cursor: pointer;
    margin: 2px 0;
    background: linear-gradient(45deg, #ffffff33 0%, #ffffff00 100%);
    border: 1px solid #ffffff4d;
    color: #fff;
    border-radius: 4px;
  `,
  listWrap: css`
    flex: 1;
    min-height: 0;
    padding-inline: 20px;
  `,
  list: css`
    height: 100%;
  `,
  sender: css`
    margin-inline: ${token.paddingSM * 2}px;
    width: calc(100% - ${token.paddingSM * 4}px);
    background: linear-gradient(
      135deg,
      #ffffff26 14%,
      #ffffff0d 59%
    ) !important;
    border-radius: 40px !important;
    overflow: hidden;
    position: relative;
    border: none;

    .antd-sender-content {
      padding: 0 ${token.paddingSM}px;
      min-height: 44px;
      background: transparent !important;
    }

    .antd-input,
    textarea {
      background: transparent !important;
      color: rgba(255, 255, 255, 0.92) !important;
    }

    .antd-input::placeholder,
    textarea::placeholder {
      color: rgba(255, 255, 255, 0.45) !important;
    }

    .antd-btn {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      color: #fff !important;
    }

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
      pointer-events: none;
    }
  `,
}));

const styleState = useStyles();

function handleChange(value: string) {
  chat.input.value = value;
}

function senderSuffix(_: unknown, info: any) {
  const { SendButton, LoadingButton } = info.components;
  if (chat.loading.value) return h(LoadingButton, { type: "text" });
  return h(SendButton, {
    type: "text",
    icon: h("img", {
      src: SEND_ICON,
      alt: "send",
      style: "width: 20px; height: 20px;",
    }),
  });
}
</script>

<template>
  <div :class="styleState.styles.root">
    <div :class="styleState.styles.listWrap">
      <BubbleList
        :class="styleState.styles.list"
        :items="[
          {
            key: 'placeholder',
            role: 'system',
            variant: 'borderless',
            content: h('div', { class: styleState.styles.placeholderBubble }, [
              h(
                'h4',
                { class: styleState.styles.welcomeTitle },
                t('home.scenes.greeting'),
              ),
              h(
                'p',
                { class: styleState.styles.welcomeDesc },
                t('home.scenes.helpDesc'),
              ),
              h('div', { class: styleState.styles.promptsWrap }, [
                h('div', { class: styleState.styles.promptBlock }, [
                  h(
                    'div',
                    { class: styleState.styles.promptTitle },
                    t('home.scenes.helpText'),
                  ),
                  h(Space, { wrap: true, size: 6 }, () =>
                    presets.map((prompt, idx) =>
                      h(
                        Tag,
                        {
                          key: `p1_${idx}`,
                          class: styleState.styles.promptBtn,
                          onClick: () => chat.submitPreset(prompt),
                        },
                        () => `${idx + 1}`,
                      ),
                    ),
                  ),
                ]),
                h('div', { class: styleState.styles.promptBlock }, [
                  h(
                    'div',
                    { class: styleState.styles.promptTitle },
                    t('home.designGuide.title'),
                  ),
                  h(Space, { wrap: true, size: 6 }, () =>
                    presets.map((prompt, idx) =>
                      h(
                        Tag,
                        {
                          key: `p2_${idx}`,
                          class: styleState.styles.promptBtn,
                          onClick: () => chat.submitPreset(prompt),
                        },
                        () => `${idx + 1}`,
                      ),
                    ),
                  ),
                ]),
              ]),
            ]),
          },
          ...(chatItems as unknown as BubbleItemType[]),
        ]"
        :role="role"
      />
    </div>

    <Sender
      :class="styleState.styles.sender"
      :value="chat.input.value"
      :loading="chat.loading.value"
      :placeholder="t('home.scenes.question1')"
      :on-change="handleChange"
      :on-submit="chat.submit"
      :suffix="senderSuffix"
    />
  </div>
</template>
