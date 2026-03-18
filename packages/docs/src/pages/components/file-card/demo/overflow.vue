<script setup lang="ts">
import type { FileCardListProps, FileCardProps } from "@antdv-next/x";

import { FileCard } from "@antdv-next/x";
import { Flex, Segmented } from "antdv-next";
import { ref } from "vue";

const images: FileCardProps[] = Array.from({ length: 50 }).map((_, index) => ({
  name: `image-file-${index}.png`,
  src: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
  byte: 1024,
}));

const files: FileCardProps[] = [
  {
    name: "excel-file.xlsx",
    byte: 1024,
  },
  {
    name: "word-file.docx",
    byte: 1024,
  },
  {
    name: "pdf-file.pdf",
    byte: 1024,
  },
  {
    name: "ppt-file.pptx",
    byte: 1024,
  },
  {
    name: "zip-file.zip",
    byte: 1024,
  },
  {
    name: "txt-file.txt",
    byte: 1024,
  },
];

const overflow = ref<FileCardListProps["overflow"]>("wrap");
</script>

<template>
  <Flex vertical gap="middle">
    <Segmented
      :options="[
        { value: 'wrap', label: 'Wrap' },
        { value: 'scrollX', label: 'Scroll X' },
        { value: 'scrollY', label: 'Scroll Y' },
      ]"
      :value="overflow"
      style="margin-inline-end: auto"
      @change="value => (overflow = value as FileCardListProps['overflow'])"
    />
    <FileCard.List
      :items="[...images, ...files]"
      removable
      :overflow="overflow"
    />
  </Flex>
</template>

<docs lang="zh-CN">
控制附件超出区域长度时的展示方式。
</docs>

<docs lang="en-US">
Controls the layout of attachments when they exceed the area.
</docs>
