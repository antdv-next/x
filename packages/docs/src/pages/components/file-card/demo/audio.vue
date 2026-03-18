<script setup lang="ts">
import { FileCard } from "@antdv-next/x";
import { Flex } from "antdv-next";
</script>

<template>
  <Flex vertical gap="middle">
    <FileCard
      name="audio-file.mp3"
      src="https://mdn.alipayobjects.com/cto_doraemon/afts/file/HFTcTLugiIAAAAAAgCAAAAgAehe3AQBr"
    />
    <FileCard
      name="video-file.mp4"
      src="https://mdn.alipayobjects.com/doraemon_plugin/afts/file/vl7tSa-m3jEAAAAAAAAAAAAAeur1AQBr"
    />
    <FileCard name="audio-file.mp3" :byte="1024" type="file" />
    <FileCard name="video-file.mp4" :byte="1024" type="file" />
  </Flex>
</template>

<docs lang="zh-CN">
使用浏览器原生标签。
</docs>

<docs lang="en-US">
Use browser native tags.
</docs>
