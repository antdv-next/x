<script setup lang="ts">
import { Welcome } from "@antdv-next/x";
import { Card, ConfigProvider, Flex, theme } from "antdv-next";

const items = [
  {
    algorithm: theme.defaultAlgorithm,
    background: "linear-gradient(97deg, #f2f9fe 0%, #f7f3ff 100%)",
    cardStyle: {
      borderRadius: 0,
    },
  },
  {
    algorithm: theme.darkAlgorithm,
    background:
      "linear-gradient(97deg, rgba(90,196,255,0.12) 0%, rgba(174,136,255,0.12) 100%)",
    cardStyle: {
      borderRadius: 0,
      background: "#141414",
      borderColor: "#141414",
    },
  },
] as const;
</script>

<template>
  <Flex vertical>
    <ConfigProvider
      v-for="(item, index) in items"
      :key="index"
      :theme="{ algorithm: item.algorithm }"
    >
      <Card :style="item.cardStyle">
        <Welcome
          :style="{
            backgroundImage: item.background,
            borderStartStartRadius: '4px',
          }"
          icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
          title="你好，我是 Ant Design X"
          description="基于蚂蚁设计，AGI产品界面解决方案，打造更美好的智能愿景~"
        />
      </Card>
    </ConfigProvider>
  </Flex>
</template>

<docs lang="zh-CN">
自定义部分样式。
</docs>

<docs lang="en-US">
Customize the background of the welcome area.
</docs>
