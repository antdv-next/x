<script setup lang="ts">
import type { BubbleItemType } from "@antdv-next/x";

import { BubbleList, Sender, Welcome } from "@antdv-next/x";
import { createStyles } from "antdv-style";
import { computed, h } from "vue";

import { useLocale } from "@/composables/use-locale";

import { useMockChat } from "../../composables/use-mock-chat";

const { t, locale } = useLocale();
const chat = useMockChat(t("home.scenes.greeting"), t("home.scenes.waiting"));
const SEND_ICON =
  "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*4e5sTY9lU3sAAAAAAAAAAAAADgCCAQ/original";

const presets = computed(() => [
  t("home.scenes.question1"),
  t("home.scenes.question2"),
  t("home.scenes.question3"),
  t("home.scenes.question4"),
]);

const designPresets = computed(() => [
  t("home.scenes.empathy"),
  t("home.scenes.persona"),
  t("home.scenes.conversation"),
  t("home.scenes.interface"),
]);
const welcomeTitle = computed(() =>
  locale.value === "zh-CN"
    ? "你好, 我是全新 AI 产品创造助手"
    : "Hello, I am your AI Product Design Assistant",
);
const welcomeDesc = computed(() =>
  locale.value === "zh-CN"
    ? "基于 Ant Design 的 AGI 产品智能解决方案, 创造更美好的智能视界"
    : "Powered by Ant Design's AGI solution to enhance intelligent, aesthetic visual experiences",
);
const helpText = computed(() =>
  locale.value === "zh-CN" ? "我可以帮您:" : "I can assist you with:",
);
const guideTitle = computed(() =>
  locale.value === "zh-CN" ? "Rich 设计指南" : "Rich Design Guidelines",
);

const chatItems = computed(() =>
  chat.items.value.filter(item => item.role !== "system"),
);

const role = computed<any>(() => ({
  ai: {
    placement: "start",
    typing: { effect: "typing", step: 5, interval: 20 },
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
  container: css`
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
    gap: ${token.padding}px;
    height: 100%;
    justify-content: space-between;
    padding: ${token.paddingXL}px;
  `,
  bubble_list: css`
    flex: 1;
  `,
  placeholder_bubble: css`
    .antd-welcome {
      padding: 0;
      margin-bottom: ${token.marginSM}px;
    }

    .antd-welcome-title {
      font-size: 16px !important;
      font-weight: 500 !important;
      opacity: 0.9;
    }

    .antd-welcome-description {
      font-size: 12px;
      opacity: 0.65;
    }

    .antd-welcome-icon img {
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
    margin: 0 auto;
  `,
  helperContent: css`
    display: flex;
    align-items: stretch;
    gap: 16px;
    width: 100%;
  `,
  helperCol: css`
    flex: 1;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.04);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.07),
      rgba(255, 255, 255, 0.04)
    );
    padding: 16px;
  `,
  helperColTitle: css`
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 18px;
    line-height: 26px;
    font-weight: 500;
  `,
  helperList: css`
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  helperItem: css`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 0;
    padding: 4px 0;
    width: 100%;
    border: none !important;
    background: none !important;
    box-shadow: none !important;
    appearance: none;
    color: rgba(255, 255, 255, 0.86);
    text-align: left;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  `,
  helperNo: css`
    width: 18px;
    height: 18px;
    flex: none;
    border-radius: 4px;
    border: 1px solid #ffffff4d;
    background: linear-gradient(45deg, #ffffff33 0%, #ffffff00 100%);
    color: rgba(255, 255, 255, 0.92);
    font-size: 12px;
    line-height: 16px;
    text-align: center;
  `,
  helperText: css`
    margin: 0;
    color: rgba(255, 255, 255, 0.86);
    font-size: 12px;
    line-height: 24px;
    white-space: normal;
    background: transparent !important;
  `,
  helperHeader: css`
    margin: 0 0 ${token.paddingXS}px;
    color: rgba(255, 255, 255, 0.66);
    font-size: 12px;
    line-height: 20px;
  `,
  senderWrap: css`
    width: 100%;
    padding-inline: 0;
    box-sizing: border-box;
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
    cursor: pointer;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);

    &:hover {
      opacity: 0.85;
    }

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

    .antd-sender-actions-list,
    .ant-sender-actions-list {
      display: flex;
      align-items: center;
      padding-inline-end: 0;
    }

    .antd-sender-actions-btn,
    .ant-sender-actions-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      color: rgba(255, 255, 255, 0.92) !important;
      padding: 0 !important;
      min-width: 30px;
      width: 30px;
      height: 30px;
      margin-top: 0;
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
  content: h("div", [
    h(Welcome, {
      icon: h("img", {
        src: "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp",
        alt: "Ant Design X",
      }),
      title: welcomeTitle.value,
      description: welcomeDesc.value,
      variant: "borderless",
    }),
    h("p", { class: styleState.styles.helperHeader }, helpText.value),
    h("div", { class: styleState.styles.helperContent }, [
      h("div", { class: styleState.styles.helperCol }, [
        h(
          "p",
          { class: styleState.styles.helperColTitle },
          t("home.scenes.hotQuestion"),
        ),
        h(
          "div",
          { class: styleState.styles.helperList },
          presets.value.map((prompt, index) =>
            h(
              "button",
              {
                key: `hot-${index}`,
                type: "button",
                class: styleState.styles.helperItem,
                onClick: () => chat.submitPreset(prompt),
              },
              [
                h(
                  "span",
                  { class: styleState.styles.helperNo },
                  `${index + 1}`,
                ),
                h("span", { class: styleState.styles.helperText }, prompt),
              ],
            ),
          ),
        ),
      ]),
      h("div", { class: styleState.styles.helperCol }, [
        h("p", { class: styleState.styles.helperColTitle }, guideTitle.value),
        h(
          "div",
          { class: styleState.styles.helperList },
          designPresets.value.map((prompt, index) =>
            h(
              "button",
              {
                key: `guide-${index}`,
                type: "button",
                class: styleState.styles.helperItem,
                onClick: () => chat.submitPreset(prompt),
              },
              [
                h(
                  "span",
                  { class: styleState.styles.helperNo },
                  `${index + 1}`,
                ),
                h("span", { class: styleState.styles.helperText }, prompt),
              ],
            ),
          ),
        ),
      ]),
    ]),
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
  <div :class="styleState.styles.container">
    <BubbleList
      :class="styleState.styles.bubble_list"
      :role="role"
      :items="bubbleItems"
      :styles="{
        root: { height: 'calc(100% - 108px)' },
        scroll: { paddingInline: 20 },
      }"
    />

    <div :class="styleState.styles.senderWrap">
      <Sender
        prefix-cls="antd-sender"
        :class="styleState.styles.sender"
        :value="chat.input.value"
        :loading="chat.loading.value"
        :placeholder="t('home.scenes.question1')"
        :on-change="handleChange"
        :on-submit="chat.submit"
        :suffix="senderSuffix"
      />
    </div>
  </div>
</template>
