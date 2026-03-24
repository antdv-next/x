<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { createStyles } from "antdv-style";
import { h } from "vue";

import { useLocale } from "@/composables/use-locale";

const { t } = useLocale();
const SEND_ICON =
  "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*4e5sTY9lU3sAAAAAAAAAAAAADgCCAQ/original";

const useStyles = createStyles(({ token, css }) => ({
  root: css`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: ${token.marginXL}px;
    padding: 0 ${token.paddingXL}px;
  `,
  title: css`
    margin: 0;
    text-align: center;
    font-size: 60px;
    line-height: 1.15;
    font-weight: 500;
    color: #ffffff3f;

    @media (max-width: 900px) {
      font-size: 36px;
    }
  `,
  sender: css`
    width: calc(100% - 96px);
    margin-inline: auto;
    background: linear-gradient(
      135deg,
      #ffffff26 14%,
      #ffffff0d 59%
    ) !important;
    border-radius: 32px !important;
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

function senderSuffix(_: unknown, info: any) {
  const { SendButton } = info.components;
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
    <h3 :class="styleState.styles.title">
      {{ t("home.scenes.greetingShort") }}
    </h3>
    <Sender
      :class="styleState.styles.sender"
      :value="t('home.scenes.question1')"
      :read-only="true"
      :suffix="senderSuffix"
    />
  </div>
</template>
