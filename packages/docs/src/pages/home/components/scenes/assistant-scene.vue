<script setup lang="ts">
import type { BubbleItemType } from "@antdv-next/x";

import { BubbleList, Sender, Welcome } from "@antdv-next/x";
import { Skeleton } from "antdv-next";
import { createStyles } from "antdv-style";
import { computed, h } from "vue";

import { useLocale } from "@/composables/use-locale";

import { useMockChat } from "../../composables/use-mock-chat";

const { t, locale } = useLocale();
const chat = useMockChat(
  t("home.scenes.assistantGreeting"),
  t("home.scenes.waiting"),
);

const SEND_ICON =
  "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*4e5sTY9lU3sAAAAAAAAAAAAADgCCAQ/original";

const presets = computed(() => [
  t("home.scenes.question1"),
  t("home.scenes.question2"),
  t("home.scenes.question3"),
  t("home.scenes.question4"),
]);
const helpLabel = computed(() =>
  locale.value === "zh-CN" ? "我可以帮您:" : "I can assist you with:",
);

const chatItems = computed(() =>
  chat.items.value.filter(item => item.role !== "system"),
);

const role = computed<any>(() => ({
  ai: {
    placement: "start",
    typing: { effect: "typing", step: 5, interval: 20 },
    style: { maxWidth: "600px" },
    styles: {
      content: {
        borderRadius: 16,
      },
    },
  },
  user: {
    placement: "end",
    styles: {
      content: {
        borderRadius: 16,
        background: "#3877FF",
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
    padding: ${token.paddingXL}px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${token.padding}px;
  `,
  right: css`
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    gap: ${token.paddingSM}px;
    height: 100%;
    width: 350px;
    background: #0000001a;
    padding: ${token.paddingXL}px 12px;
    min-height: 0;
  `,
  bubble_list: css`
    flex: 1;
  `,
  placeholder_bubble: css`
    .antd-welcome,
    .ant-welcome {
      padding: 0;
    }

    .antd-welcome-title,
    .ant-welcome-title {
      font-size: 16px !important;
      font-weight: 500 !important;
      opacity: 0.9;
    }

    .antd-welcome-description,
    .ant-welcome-description {
      font-size: 12px;
      opacity: 0.65;
    }

    .antd-welcome-icon img,
    .ant-welcome-icon img {
      transform: scale(1.2);
      margin-inline-end: 10px;
    }
  `,
  placeholder_content: css`
    overflow: hidden;
    background: linear-gradient(
      135deg,
      #ffffff26 14%,
      #ffffff0d 59%
    ) !important;
    border-radius: 16px;
    padding: 24px;
  `,
  promptWrap: css`
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  promptTitle: css`
    margin: 0;
    color: rgba(255, 255, 255, 0.66);
    font-size: 12px;
    line-height: 20px;
  `,
  promptItem: css`
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    box-sizing: border-box;
    padding: 8px 16px;
    font-size: 12px;
    line-height: 20px;
    border: none !important;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    text-align: left;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  `,
  sender: css`
    margin-inline: auto;
    width: calc(100% - 48px);
    background: linear-gradient(
      135deg,
      #ffffff26 14%,
      #ffffff0d 59%
    ) !important;
    border-radius: 10px !important;
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    cursor: pointer;
    overflow: hidden;
    position: relative;

    .antd-sender-main,
    .ant-sender-main {
      min-height: 44px;
    }

    .antd-sender-content,
    .ant-sender-content {
      min-height: 44px;
      padding: 0 ${token.paddingSM}px;
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

const placeholderMessage = computed<BubbleItemType>(() => ({
  role: "system",
  key: "placeholder",
  variant: "borderless",
  class: styleState.styles.placeholder_bubble,
  classes: {
    root: styleState.styles.placeholder_bubble,
    content: styleState.styles.placeholder_content,
  },
  content: h(Welcome, {
    icon: h("img", {
      src: "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp",
      alt: "Ant Design X",
    }),
    variant: "borderless",
    title: t("home.scenes.greetingShort"),
    description: t("home.scenes.helpDesc"),
  }),
  footer: h("div", { class: styleState.styles.promptWrap }, [
    h("p", { class: styleState.styles.promptTitle }, helpLabel.value),
    ...presets.value.map((prompt, index) =>
      h(
        "button",
        {
          key: `assistant_prompt_${index}`,
          type: "button",
          class: styleState.styles.promptItem,
          onClick: () => chat.submitPreset(prompt),
        },
        prompt,
      ),
    ),
  ]),
}));

const bubbleItems = computed<BubbleItemType[]>(() => [
  placeholderMessage.value,
  ...(chatItems.value as unknown as BubbleItemType[]),
]);

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
      style: "width: 22px; height: 22px; display: block;",
    }),
  });
}
</script>

<template>
  <div :class="styleState.styles.root">
    <div :class="styleState.styles.left">
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
    </div>

    <div :class="styleState.styles.right">
      <BubbleList
        :class="styleState.styles.bubble_list"
        :role="role"
        :items="bubbleItems"
        :styles="{
          root: { height: 'calc(100% - 56px)' },
          scroll: { paddingInline: 20 },
        }"
      />

      <Sender
        prefix-cls="antd-sender"
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
