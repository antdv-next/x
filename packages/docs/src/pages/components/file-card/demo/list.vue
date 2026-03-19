<script setup lang="ts">
import type { FileCardProps } from "@antdv-next/x";

import { FileCardList } from "@antdv-next/x";
import { Flex } from "antdv-next";

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

const images: FileCardProps[] = Array.from({ length: 6 }).map(() => ({
  name: "image-file.png",
  src: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
}));

const largeImages: FileCardProps[] = Array.from({ length: 3 }).map(() => ({
  name: "image-file.png",
  src: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
}));
</script>

<template>
  <Flex vertical gap="middle" style="width: 900px">
    <FileCardList :items="files" removable />
    <FileCardList :items="files" removable size="small" />
    <FileCardList :items="images" />
    <FileCardList
      :styles="{ file: { width: '230px', height: '230px' } }"
      :items="largeImages"
    />
  </Flex>
</template>

<docs lang="zh-CN">
使用列表展示多个文件卡片。
</docs>

<docs lang="en-US">
Use list to show multiple file cards.
</docs>
