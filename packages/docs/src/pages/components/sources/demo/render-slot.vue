<script setup lang="ts">
import type { SourcesProps } from "@antdv-next/x";

import { LinkOutlined } from "@antdv-next/icons";

const items: SourcesProps["items"] = [
  {
    key: "1",
    title: "Antdv Next X",
    description: "Component documentation",
    url: "https://x.antdv-next.com/components",
  },
  {
    key: "2",
    title: "Mermaid",
    description: "Diagram rendering reference",
    url: "https://mermaid.js.org/",
  },
];
</script>

<template>
  <ax-sources title="Used 2 sources" :items="items">
    <template #title="{ originNode }">
      <span>{{ originNode }} by slots</span>
    </template>

    <template #iconRender="{ index }">
      <a-tag color="processing">#{{ index + 1 }}</a-tag>
    </template>

    <template #titleRender="{ item }">
      <span>
        <LinkOutlined />
        {{ item.title }}
      </span>
    </template>

    <template #description="{ item }">
      <span style="color: rgba(0, 0, 0, 0.45)">{{ item.description }}</span>
    </template>
  </ax-sources>
</template>

<docs lang="zh-CN">
通过插槽自定义 Sources 标题以及每个来源项的图标、标题、描述。
</docs>

<docs lang="en-US">
Customize the Sources title and each source item's icon, title, and description with slots.
</docs>
