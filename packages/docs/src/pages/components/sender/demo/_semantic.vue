<script setup lang="ts">
import { SmileOutlined } from "@antdv-next/icons";
import { Sender, SenderHeader } from "@antdv-next/x";
import { Button, Divider, Flex, Typography } from "antdv-next";
import { computed, h } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const senderLocales = {
  "zh-CN": {
    root: "根节点",
    prefix: "前缀",
    input: "输入框",
    suffix: "后缀",
    footer: "底部",
    switch: "开关",
    content: "内容",
  },
  "en-US": {
    root: "Root",
    prefix: "Prefix",
    input: "Input",
    suffix: "Suffix",
    footer: "Footer",
    switch: "Switch",
    content: "Content",
  },
} as const;

const headerLocales = {
  "zh-CN": {
    header: "头部",
    content: "头部-内容",
  },
  "en-US": {
    header: "Header",
    content: "Header Content",
  },
} as const;

const { locale } = useLocale();

const senderLocale = computed(() =>
  locale.value === "zh-CN" ? senderLocales["zh-CN"] : senderLocales["en-US"],
);

const headerLocale = computed(() =>
  locale.value === "zh-CN" ? headerLocales["zh-CN"] : headerLocales["en-US"],
);

const senderSemantics = computed(() => [
  { name: "root", desc: senderLocale.value.root },
  { name: "prefix", desc: senderLocale.value.prefix },
  { name: "input", desc: senderLocale.value.input },
  { name: "suffix", desc: senderLocale.value.suffix },
  { name: "footer", desc: senderLocale.value.footer },
  { name: "switch", desc: senderLocale.value.switch },
  { name: "content", desc: senderLocale.value.content },
]);

const headerSemantics = computed(() => [
  { name: "header", desc: headerLocale.value.header },
  { name: "content", desc: headerLocale.value.content },
]);

const prefixNode = h(Button, {
  type: "text",
  icon: h(SmileOutlined),
});

const footerNode = h(Flex, { gap: "small", align: "center" }, () => [
  h(Sender.Switch, null, { default: () => "Deep Search" }),
  h(
    Typography.Text,
    { type: "secondary" },
    () => "Deep thinking can understand the intent behind.",
  ),
]);

function renderHeader(classNames: Record<string, string>) {
  return h(
    SenderHeader,
    {
      open: true,
      title: "Header",
      classNames,
    },
    {
      default: () => "Content",
    },
  );
}
</script>

<template>
  <Flex vertical>
    <SemanticPreview component-name="Sender" :semantics="senderSemantics">
      <template #default="{ classes }">
        <Sender
          :class-names="classes"
          :prefix="prefixNode"
          :footer="footerNode"
        />
      </template>
    </SemanticPreview>

    <Divider :style="{ margin: 0, padding: 0 }" />

    <SemanticPreview component-name="SenderHeader" :semantics="headerSemantics">
      <template #default="{ classes }">
        <Sender :header="renderHeader(classes)" />
      </template>
    </SemanticPreview>
  </Flex>
</template>

<docs lang="zh-CN">
Sender / Sender.Header 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Sender / Sender.Header.
</docs>
