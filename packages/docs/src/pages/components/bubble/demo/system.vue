<script setup lang="ts">
import { BubbleSystem } from "@antdv-next/x";
import { Space, Typography } from "antdv-next";
import { h } from "vue";

const text = "Hello, this is a system message";
</script>

<template>
  <Space direction="vertical" style="display: flex; width: 100%" :size="14">
    <BubbleSystem :content="text" />

    <BubbleSystem
      variant="outlined"
      shape="round"
      :content="[text, ' ', h(Typography.Link, null, { default: () => 'ok' })]"
    />

    <BubbleSystem
      variant="borderless"
      :content="[
        text,
        ' ',
        h(Typography.Link, null, { default: () => 'cancel' }),
      ]"
    />
  </Space>
</template>

<docs lang="zh-CN">
系统信息 Bubble。
</docs>

<docs lang="en-US">
Bubble of system information.
</docs>
