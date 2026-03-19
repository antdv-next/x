<script setup lang="ts">
import { FileCard } from "@antdv-next/x";
import { Flex } from "antdv-next";
</script>

<template>
  <Flex vertical gap="middle">
    <FileCard
      name="image-file.png"
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
    />
    <FileCard
      :styles="{
        file: {
          width: 100,
          height: 100,
        },
      }"
      name="image-file.png"
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
    />
    <FileCard
      type="file"
      name="image-file.png"
      :byte="1024"
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
    />
  </Flex>
</template>

<docs lang="zh-CN">
图片\文件卡片。
</docs>

<docs lang="en-US">
Image\File card.
</docs>
