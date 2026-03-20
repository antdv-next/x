<script setup lang="ts">
import { CloudUploadOutlined } from "@antdv-next/icons";
import { Attachments } from "@antdv-next/x";
import { computed, h } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const placeholderLocales = {
  "zh-CN": { placeholder: "占位符" },
  "en-US": { placeholder: "Placeholder" },
};

const withItemLocales = {
  "zh-CN": {
    root: "根节点",
    list: "列表容器",
    card: "文件卡片",
    file: "文件",
    upload: "上传按钮",
    icon: "文件图标",
    name: "文件名称",
    description: "文件描述",
  },
  "en-US": {
    root: "Root",
    list: "List container",
    card: "File Card",
    upload: "Upload Btn",
    file: "File",
    icon: "File Icon",
    name: "File Name",
    description: "File Description",
  },
};

const items = Array.from({ length: 3 }).map((_, index) => ({
  uid: String(index),
  name: `file-${index}.jpg`,
  status: "done" as const,
  thumbUrl:
    "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
  url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
}));
items.push({
  uid: "xlsx",
  name: "excel-file.xlsx",
  status: "done",
  size: 31231,
});

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN"
    ? withItemLocales["zh-CN"]
    : withItemLocales["en-US"],
);

const placeholderLocale = computed(() =>
  locale.value === "zh-CN"
    ? placeholderLocales["zh-CN"]
    : placeholderLocales["en-US"],
);

const withItemSemantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "list", desc: semanticLocale.value.list },
  { name: "card", desc: semanticLocale.value.card },
  { name: "file", desc: semanticLocale.value.file },
  { name: "icon", desc: semanticLocale.value.icon },
  { name: "name", desc: semanticLocale.value.name },
  { name: "description", desc: semanticLocale.value.description },
  { name: "upload", desc: semanticLocale.value.upload },
]);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <SemanticPreview
      component-name="Attachments"
      :semantics="[
        { name: 'root', desc: semanticLocale.root },
        { name: 'placeholder', desc: placeholderLocale.placeholder },
      ]"
    >
      <template #default="{ classes }">
        <Attachments
          :classes="classes"
          :placeholder="{
            icon: h(CloudUploadOutlined),
            title: 'Upload File',
            description: 'Drag or click to upload file.',
          }"
        />
      </template>
    </SemanticPreview>

    <SemanticPreview
      component-name="Attachments"
      :semantics="withItemSemantics"
    >
      <template #default="{ classes }">
        <Attachments :items="items" :classes="classes" />
      </template>
    </SemanticPreview>
  </div>
</template>

<docs lang="zh-CN">
Attachments 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Attachments.
</docs>
