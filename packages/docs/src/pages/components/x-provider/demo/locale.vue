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
import enUS from "antdv-next/dist/locale/en_US";
import zhCN from "antdv-next/dist/locale/zh_CN";
import { computed, ref, watch } from "vue";

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
    },
    {
      key: "coding",
      label: t.coding,
    },
    {
      key: "createImage",
      label: t.createImage,
    },
    {
      key: "deepSearch",
      label: t.deepSearch,
    },
  ];
});

const actionItems: ActionsProps["items"] = [
  {
    key: "feedback",
    label: "feedback",
  },
  {
    key: "copy",
    label: "copy",
  },
  {
    key: "audio",
    label: "audio",
  },
];
</script>

<template>
  <a-flex :gap="12" style="margin-bottom: 16px" align="center">
    <a-typography-text>Change locale of components:</a-typography-text>
    <a-radio-group v-model:value="localeType">
      <a-radio-button value="en"> English </a-radio-button>
      <a-radio-button value="zh"> 中文 </a-radio-button>
    </a-radio-group>
  </a-flex>

  <ax-x-provider :locale="locale">
    <a-flex :gap="12" vertical>
      <a-card>
        <ax-conversations
          :style="{ width: '220px' }"
          default-active-key="write"
          :creation="{ onClick: () => {} }"
          :items="conversationItems"
        >
          <template #iconRender="{ item }">
            <SignatureOutlined v-if="item.key === 'write'" />
            <CodeOutlined v-else-if="item.key === 'coding'" />
            <FileImageOutlined v-else-if="item.key === 'createImage'" />
            <FileSearchOutlined v-else-if="item.key === 'deepSearch'" />
          </template>
        </ax-conversations>
      </a-card>

      <a-card>
        <ax-actions :items="actionItems">
          <template #actionRender="{ item }">
            <ax-actions-feedback v-if="item.key === 'feedback'" />
            <ax-actions-copy
              v-else-if="item.key === 'copy'"
              text="copy value"
            />
            <ax-actions-audio v-else-if="item.key === 'audio'" />
          </template>
        </ax-actions>
      </a-card>
    </a-flex>
  </ax-x-provider>
</template>
