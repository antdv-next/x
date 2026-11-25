<script setup lang="ts">
import type { ThoughtChainItemType } from "@antdv-next/x";

import { MinusOutlined, PlusOutlined } from "@antdv-next/icons";

const items: ThoughtChainItemType[] = [
  {
    key: "custom",
    title: "Custom collapse icon",
    content: "The trailing indicator can be replaced with any node.",
    collapsible: true,
  },
  {
    key: "hidden",
    title: "Hidden collapse icon",
    content: "Returning an empty node hides the indicator.",
    collapsible: true,
  },
];
</script>

<template>
  <a-card :style="{ width: '500px' }">
    <ax-thought-chain :items="items" :default-expanded-keys="['custom']">
      <template #collapseIcon="{ item, expanded }">
        <MinusOutlined v-if="item.key === 'custom' && expanded" />
        <PlusOutlined v-else-if="item.key === 'custom'" />
      </template>
    </ax-thought-chain>
  </a-card>
</template>

<docs lang="zh-CN">
通过 `collapseIcon` 插槽替换默认折叠图标，返回空内容即可隐藏；也可以使用语义化类名 `itemCollapseIcon` 调整默认图标样式。
</docs>

<docs lang="en-US">
Use the `collapseIcon` slot to replace the default indicator, or return an empty node to hide it. The `itemCollapseIcon` semantic class can be used to style the default indicator.
</docs>
