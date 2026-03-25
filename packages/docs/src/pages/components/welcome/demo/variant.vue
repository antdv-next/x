<script setup lang="ts">
import { EllipsisOutlined, ShareAltOutlined } from "@antdv-next/icons";
import { Welcome } from "@antdv-next/x";
import { Button, Flex } from "antdv-next";
import { h } from "vue";
</script>

<template>
  <Welcome
    variant="borderless"
    icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
    title="你好，我是 Ant Design X"
    description="基于蚂蚁设计，AGI产品界面解决方案，打造更美好的智能愿景~"
    :extra="
      h(Flex, { gap: 8 }, () => [
        h(Button, { icon: h(ShareAltOutlined) }),
        h(Button, { icon: h(EllipsisOutlined) }),
      ])
    "
  />
</template>

<docs lang="zh-CN">
支持填充态和无边框态。
</docs>

<docs lang="en-US">
Supports filled and borderless variants.
</docs>
