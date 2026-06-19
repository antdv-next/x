<script setup lang="ts">
import type { MermaidProps } from "@antdv-next/x";

import {
  DislikeOutlined,
  LikeOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
} from "@antdv-next/icons";
import { App } from "antdv-next";
import { ref } from "vue";

const { message } = App.useApp();

const content = `flowchart LR
  A[Request] --> B{Cached?}
  B -->|Hit| C[Return Cache]
  B -->|Miss| D[Query DB]
  D --> E[Update Cache]
  C --> F[Response]
  E --> F`;

const starred = ref(false);

const customActions: NonNullable<MermaidProps["actions"]>["customActions"] = [
  {
    key: "star",
    label: "Star",
    onItemClick: () => {
      starred.value = !starred.value;
      message.success(starred.value ? "已收藏" : "已取消收藏");
    },
  },
  {
    key: "like",
    label: "Like",
    onItemClick: () => message.info("点赞了"),
  },
  {
    key: "share",
    label: "Share",
    onItemClick: () => message.success("链接已复制到剪贴板"),
  },
];

const actions = { customActions };
</script>

<template>
  <ax-mermaid :content="content" :actions="actions">
    <!-- header 插槽：优先级高于 header 属性 -->
    <template #header>
      <div class="custom-header">
        <span class="custom-title">缓存策略</span>
        <a-tag color="processing" :bordered="false">live</a-tag>
      </div>
    </template>

    <!-- customActionIconRender：仅替换图标，保留默认外观与点击行为 -->
    <template #customActionIconRender="{ item, index, originNode }">
      <StarFilled
        v-if="item.key === 'star' && starred"
        style="color: #faad14"
      />
      <StarOutlined v-else-if="item.key === 'star'" />
      <LikeOutlined v-else-if="item.key === 'like'" />
      <ShareAltOutlined v-else-if="item.key === 'share'" />
      <component :is="originNode" v-else :key="index" />
    </template>

    <!-- customActionRender：整体替换操作区，可用 originNode 回退到默认渲染 -->
    <template #customActionRender="{ item, originNode }">
      <template v-if="item.key === 'like'">
        <a-button type="text" size="small" @click="item.onItemClick?.(item)">
          <LikeOutlined />
          点赞
        </a-button>
      </template>
      <component :is="originNode" v-else />
    </template>
  </ax-mermaid>
</template>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--ant-color-border, #d9d9d9);
  background: var(--ant-color-fill-secondary, #fafafa);
}

.custom-title {
  font-weight: 500;
}
</style>

<docs lang="zh-CN">
通过 `header`、`customActionIconRender`、`customActionRender` 插槽自定义头部与操作区。插槽作用域提供 `item`、`index`、`originNode`：`originNode` 为默认渲染结果，可直接透传以回退到默认表现。
</docs>

<docs lang="en-US">
Customize the header and action area via the `header`, `customActionIconRender`, and `customActionRender` slots. The slot scope provides `item`, `index`, and `originNode`, where `originNode` is the default render result that you can forward to fall back to the default appearance.
</docs>
