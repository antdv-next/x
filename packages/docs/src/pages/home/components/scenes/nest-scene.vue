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
    display: flex;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: ${token.paddingLG}px;
  `,
  title: css`
    margin: 0;
    font-size: 42px;
    color: #ffffff3f;
    line-height: 50px;
    font-weight: 500;
    text-align: center;
  `,
  sender: css`
    width: 580px;
    max-width: calc(100% - 96px);
    margin-inline: auto;
    background: linear-gradient(
      135deg,
      #ffffff26 14%,
      #ffffff0d 59%
    ) !important;
    border-radius: 10px !important;
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    overflow: hidden;
    position: relative;

    .antd-sender-main,
    .ant-sender-main {
      min-height: 44px;
    }

    .antd-sender-content,
    .ant-sender-content {
      padding: 0 ${token.paddingSM}px;
      min-height: 44px;
      background: transparent !important;
      align-items: center;
    }

    .antd-sender-input,
    .ant-sender-input,
    .ant-input,
    .antd-input,
    textarea {
      background: transparent !important;
      color: rgba(255, 255, 255, 0.92) !important;
      font-size: 16px;
      line-height: 24px;
    }

    .antd-sender-input::placeholder,
    .ant-sender-input::placeholder,
    .ant-input::placeholder,
    .antd-input::placeholder,
    textarea::placeholder {
      color: rgba(255, 255, 255, 0.45) !important;
    }

    .antd-sender-actions-btn,
    .ant-sender-actions-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      min-width: 30px;
      width: 30px;
      height: 30px;
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
      background: linear-gradient(180deg, #ffffff24 0%, #ffffff00 72%);
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
      style: "width: 22px; height: 22px; display: block;",
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
      prefix-cls="antd-sender"
      :class="styleState.styles.sender"
      :value="t('home.scenes.question1')"
      :read-only="true"
      :suffix="senderSuffix"
    />
  </div>
</template>
