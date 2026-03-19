<script setup lang="ts">
import { AndroidOutlined } from "@antdv-next/icons";
import { FileCard } from "@antdv-next/x";
import { Flex } from "antdv-next";
import { h } from "vue";
</script>

<template>
  <Flex vertical gap="middle">
    <FileCard icon="pdf" name="txt-file.txt" :byte="1024" />
    <FileCard
      :icon="
        h(AndroidOutlined, { style: { fontSize: '36px', color: '#22b35e' } })
      "
      name="android-file.apk"
      :byte="1024"
    />
  </Flex>
</template>

<docs lang="zh-CN">
可使用内置图标或自定义。
</docs>

<docs lang="en-US">
you can use built-in icons or custom.
</docs>
