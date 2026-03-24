<script setup lang="ts">
import type { BubbleItemType } from "@antdv-next/x";

import { BubbleList, Sender } from "@antdv-next/x";
import { Avatar, Skeleton } from "antdv-next";
import { createStyles } from "antdv-style";
import { computed, h } from "vue";

import { useLocale } from "@/composables/use-locale";

import { useMockChat } from "../../composables/use-mock-chat";

const { t } = useLocale();
const chat = useMockChat(
  t("home.scenes.assistantGreeting"),
  t("home.scenes.waiting"),
);
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
    style: { maxWidth: "90%" },
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
    height: 100%;
    display: flex;
    justify-content: space-between;
  `,
  left: css`
    padding: 32px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  right: css`
    width: 350px;
    background: #0000001a;
    padding: 24px 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
  `,
  listWrap: css`
    flex: 1;
    min-height: 0;
    padding-inline: 20px;
  `,
  list: css`
    height: 100%;
  `,
  skeleton: css`
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 12px;
  `,
  placeholder: css`
    overflow: hidden;
    background: linear-gradient(135deg, #ffffff26 14%, #ffffff0d 59%);
    border-radius: 16px;
    padding: 20px;
  `,
  placeholderTitle: css`
    margin: 0;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    opacity: 0.9;
  `,
  placeholderDesc: css`
    margin: 6px 0 0;
    color: #fff;
    font-size: 12px;
    opacity: 0.65;
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
    <div :class="styleState.styles.left">
      <div :class="styleState.styles.skeleton">
        <Skeleton active :title="{ width: '70%' }" :paragraph="{ rows: 3 }" />
      </div>
      <div :class="styleState.styles.skeleton">
        <Skeleton active :title="{ width: '60%' }" :paragraph="{ rows: 2 }" />
      </div>
      <div :class="styleState.styles.skeleton">
        <Skeleton active :title="{ width: '80%' }" :paragraph="{ rows: 4 }" />
      </div>
    </div>

    <div :class="styleState.styles.right">
      <div :class="styleState.styles.listWrap">
        <BubbleList
          :class="styleState.styles.list"
          :items="[
            {
              key: 'placeholder',
              role: 'system',
              variant: 'borderless',
              content: h('div', { class: styleState.styles.placeholder }, [
                h(
                  'h4',
                  { class: styleState.styles.placeholderTitle },
                  t('home.scenes.greeting'),
                ),
                h(
                  'p',
                  { class: styleState.styles.placeholderDesc },
                  t('home.scenes.helpDesc'),
                ),
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
        :placeholder="t('home.scenes.sendPlaceholder')"
        :on-change="handleChange"
        :on-submit="chat.submit"
        :suffix="senderSuffix"
      />
    </div>
  </div>
</template>
