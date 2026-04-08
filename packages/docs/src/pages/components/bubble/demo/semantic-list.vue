<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import {
  AntDesignOutlined,
  CopyOutlined,
  SyncOutlined,
} from "@antdv-next/icons";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "对话列表根节点",
    scroll: "对话列表滚动容器",
    bubble: "对话气泡容器",
    body: "对话气泡主体容器",
    avatar: "对话气泡头像容器",
    header: "对话气泡头部容器",
    content: "对话气泡内容容器",
    footer: "对话气泡底部容器",
    extra: "对话气泡侧边栏容器",
    system: "系统气泡容器",
    divider: "分割线气泡容器",
  },
  "en-US": {
    root: "Bubble list root node",
    scroll: "Bubble list scroll container",
    bubble: "Bubble root",
    body: "Bubble main body container",
    avatar: "Bubble avatar outer container",
    header: "Bubble header container",
    content: "Bubble chat content container",
    footer: "Bubble footer container",
    extra: "Bubble sidebar container",
    system: "BubbleSystem root",
    divider: "BubbleDivider root",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "scroll", desc: semanticLocale.value.scroll },
  { name: "bubble", desc: semanticLocale.value.bubble },
  { name: "body", desc: semanticLocale.value.body },
  { name: "avatar", desc: semanticLocale.value.avatar },
  { name: "header", desc: semanticLocale.value.header },
  { name: "content", desc: semanticLocale.value.content },
  { name: "footer", desc: semanticLocale.value.footer },
  { name: "extra", desc: semanticLocale.value.extra },
  { name: "system", desc: semanticLocale.value.system },
  { name: "divider", desc: semanticLocale.value.divider },
]);

const role = computed<BubbleListProps["role"]>(() => ({
  ai: {
    typing: true,
    header: "AI",
  },
  user: () => ({
    placement: "end",
  }),
}));

const items: BubbleListProps["items"] = [
  { key: "system", role: "system", content: "Welcome to Antd Next X" },
  { key: "divider", role: "divider", content: "divider" },
  { key: "user", role: "user", content: "hello, Antd Next X" },
  { key: "ai", role: "ai", content: "hello, how can I help you?" },
  {
    key: "user2",
    role: "user",
    content: "show me the code of BubbleList demo with semantic styles",
  },
  { key: "ai2", role: "ai", content: "ok, here is the code:" },
];
</script>

<template>
  <SemanticPreview component-name="BubbleList" :semantics="semantics">
    <template #default="{ classes }">
      <ax-bubble-list
        style="height: 630px"
        :role="role"
        :items="items"
        :classes="classes"
      >
        <template #avatar="{ item }">
          <a-avatar v-if="item.role === 'ai'">
            <template #icon>
              <AntDesignOutlined />
            </template>
          </a-avatar>
        </template>

        <template #footer="{ item }">
          <a-space v-if="item.role === 'ai'" :size="4">
            <a-button type="text" size="small">
              <template #icon>
                <SyncOutlined />
              </template>
            </a-button>
          </a-space>
        </template>

        <template #extra="{ item }">
          <a-button v-if="item.role === 'ai'" type="text" size="small">
            <template #icon>
              <CopyOutlined />
            </template>
          </a-button>
        </template>
      </ax-bubble-list>
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
BubbleList 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for BubbleList.
</docs>
