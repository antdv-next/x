<script setup lang="ts">
import { CopyOutlined, SyncOutlined, UserOutlined } from "@antdv-next/icons";
import { Bubble } from "@antdv-next/x";
import { Avatar, Button, Space, theme } from "antdv-next";
import { computed, h } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "气泡根节点",
    body: "主体容器",
    avatar: "头像的外层容器",
    header: "头部容器",
    content: "聊天内容容器",
    footer: "底部容器",
    extra: "侧边栏容器",
  },
  "en-US": {
    root: "Bubble root",
    body: "Wrapper element of the body",
    avatar: "Wrapper element of the avatar",
    header: "Wrapper element of the header",
    content: "Wrapper element of the content",
    footer: "Wrapper element of the footer",
    extra: "Wrapper element of the extra",
  },
} as const;

const { token } = theme.useToken();
const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "body", desc: semanticLocale.value.body },
  { name: "avatar", desc: semanticLocale.value.avatar },
  { name: "header", desc: semanticLocale.value.header },
  { name: "content", desc: semanticLocale.value.content },
  { name: "footer", desc: semanticLocale.value.footer },
  { name: "extra", desc: semanticLocale.value.extra },
]);

const avatarNode = h(Avatar, { size: 32, icon: h(UserOutlined) });
const extraNode = h(
  Button,
  { type: "text", size: "small" },
  { icon: () => h(CopyOutlined) },
);

function footerNode() {
  return h(
    Space,
    { size: token.value.paddingXXS },
    {
      default: () => [
        h(
          Button,
          { type: "text", size: "small" },
          { icon: () => h(SyncOutlined) },
        ),
      ],
    },
  );
}
</script>

<template>
  <SemanticPreview component-name="Bubble" :semantics="semantics">
    <template #default="{ classes }">
      <Bubble
        content="Feel free to use Ant Design X!"
        header="Ant Design X"
        :avatar="avatarNode"
        :extra="extraNode"
        :footer="footerNode"
        :classes="classes"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Bubble 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Bubble.
</docs>
