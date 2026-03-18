<script setup lang="ts">
import { FileCard } from "@antdv-next/x";
import { Flex } from "antdv-next";
</script>

<template>
  <Flex vertical gap="middle">
    <FileCard name="pdf-file.pdf" :byte="1024" size="small" />
    <FileCard name="pdf-file.pdf" :byte="1024" size="default" />
  </Flex>
</template>

<docs lang="zh-CN">
不同大小的卡片。
</docs>

<docs lang="en-US">
Different sizes of cards.
</docs>
