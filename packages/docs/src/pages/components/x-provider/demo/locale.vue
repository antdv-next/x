<docs lang="zh-CN">
此处列出 Antdv Next X 中需要国际化支持的组件，你可以在演示里切换语言。
</docs>

<docs lang="en-US">
Components which need localization support are listed here, you can toggle the language in the demo.
</docs>

<script setup lang="ts">
import type {
  ActionsProps,
  ConversationsProps,
  XProviderProps,
} from "@antdv-next/x";

import {
  CodeOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  SignatureOutlined,
} from "@antdv-next/icons";
import { Actions, Conversations, XProvider } from "@antdv-next/x";
import {
  Card,
  Flex,
  Radio,
  RadioButton,
  RadioGroup,
  Typography,
} from "antdv-next";
import enUS from "antdv-next/dist/locale/en_US";
import zhCN from "antdv-next/dist/locale/zh_CN";
import { computed, h, ref, watch } from "vue";

import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

type DemoLocaleType = "zh" | "en";

function resolveDemoLocaleType(locale?: string): DemoLocaleType {
  return String(locale).toLowerCase().startsWith("en") ? "en" : "zh";
}

const localeType = ref<DemoLocaleType>(resolveDemoLocaleType(appStore.locale));

watch(
  () => appStore.locale,
  nextLocale => {
    localeType.value = resolveDemoLocaleType(nextLocale);
  },
  { immediate: true },
);

const itemsLocale = {
  en: {
    write: "Help Me Write",
    coding: "AI Coding",
    createImage: "Create Image",
    deepSearch: "Deep Search",
  },
  zh: {
    write: "帮我写作",
    coding: "AI编码",
    createImage: "图片生成",
    deepSearch: "深度搜索",
  },
};

const locale = computed<XProviderProps["locale"]>(() => {
  return localeType.value === "zh" ? zhCN : enUS;
});

const conversationItems = computed<ConversationsProps["items"]>(() => {
  const t = itemsLocale[localeType.value];

  return [
    {
      key: "write",
      label: t.write,
      icon: h(SignatureOutlined),
    },
    {
      key: "coding",
      label: t.coding,
      icon: h(CodeOutlined),
    },
    {
      key: "createImage",
      label: t.createImage,
      icon: h(FileImageOutlined),
    },
    {
      key: "deepSearch",
      label: t.deepSearch,
      icon: h(FileSearchOutlined),
    },
  ];
});

const actionItems: ActionsProps["items"] = [
  {
    key: "feedback",
    actionRender: () => h(Actions.Feedback),
  },
  {
    key: "copy",
    label: "copy",
    actionRender: () => h(Actions.Copy, { text: "copy value" }),
  },
  {
    key: "audio",
    label: "audio",
    actionRender: () => h(Actions.Audio),
  },
];
</script>

<template>
  <Flex :gap="12" style="margin-bottom: 16px" align="center">
    <Typography.Text>Change locale of components:</Typography.Text>
    <RadioGroup v-model:value="localeType">
      <RadioButton value="en"> English </RadioButton>
      <RadioButton value="zh"> 中文 </RadioButton>
    </RadioGroup>
  </Flex>

  <XProvider :locale="locale">
    <Flex :gap="12" vertical>
      <Card>
        <Conversations
          :style="{ width: '220px' }"
          default-active-key="write"
          :creation="{ onClick: () => {} }"
          :items="conversationItems"
        />
      </Card>

      <Card>
        <Actions :items="actionItems" />
      </Card>
    </Flex>
  </XProvider>
</template>
