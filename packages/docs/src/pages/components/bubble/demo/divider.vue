<script setup lang="ts">
import { Bubble, BubbleDivider } from "@antdv-next/x";
import { Space } from "antdv-next";
</script>

<template>
  <Space direction="vertical" style="display: flex; width: 100%" :size="10">
    <Bubble content="message 1" />
    <BubbleDivider content="Solid" />
    <Bubble content="message 2" placement="end" />
    <BubbleDivider content="Dashed" :divider-props="{ variant: 'dashed' }" />
    <Bubble content="message 3" />
    <BubbleDivider content="Dotted" :divider-props="{ variant: 'dotted' }" />
    <Bubble content="message 4" placement="end" />
    <BubbleDivider content="Plain Text" :divider-props="{ plain: true }" />
    <Bubble content="message 5" />
  </Space>
</template>

<docs lang="zh-CN">
分割线 Bubble。
</docs>

<docs lang="en-US">
Bubble of divider.
</docs>
