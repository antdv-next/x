<script setup lang="ts">
import { EllipsisOutlined, ShareAltOutlined } from "@antdv-next/icons";
</script>

<template>
  <ax-welcome
    variant="borderless"
    icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
    title="你好，我是 Antdv Next X"
    description="基于 Antdv Next 的 AGI 产品界面解决方案，打造更美好的智能愿景~"
  >
    <template #extra>
      <a-flex :gap="8">
        <a-button>
          <template #icon>
            <ShareAltOutlined />
          </template>
        </a-button>
        <a-button>
          <template #icon>
            <EllipsisOutlined />
          </template>
        </a-button>
      </a-flex>
    </template>
  </ax-welcome>
</template>

<docs lang="zh-CN">
支持填充态和无边框态。
</docs>

<docs lang="en-US">
Supports filled and borderless variants.
</docs>
