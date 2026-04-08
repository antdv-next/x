<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import { computed, ref } from "vue";

const items = ref<BubbleListProps["items"]>([
  {
    key: "ai-1",
    role: "ai",
    status: "success",
    content: "This content is rendered by BubbleList #contentRender slot.",
    extraInfo: {
      source: "knowledge-base",
      tokens: 128,
    },
  },
  {
    key: "user-1",
    role: "user",
    content: "Show me BubbleList slot compatibility with Bubble.",
  },
  {
    key: "ai-loading",
    role: "ai",
    status: "loading",
    loading: true,
    content: "Generating answer",
  },
]);

const role = computed<BubbleListProps["role"]>(() => ({
  user: {
    placement: "end",
  },
}));
</script>

<template>
  <ax-bubble-list style="height: 420px" :items="items" :role="role">
    <template #avatar="{ role: itemRole }">
      <a-avatar size="small">
        {{ itemRole === "user" ? "U" : "AI" }}
      </a-avatar>
    </template>

    <template #header="{ role: itemRole, index, info }">
      <a-space size="small">
        <a-typography-text type="secondary">
          {{ itemRole.toUpperCase() }}
        </a-typography-text>
        <a-typography-text type="secondary">#{{ index + 1 }}</a-typography-text>
        <a-tag color="blue">{{ info.key }}</a-tag>
      </a-space>
    </template>

    <template #contentRender="{ content, item }">
      <a-flex vertical gap="small">
        <span>{{ content }}</span>
        <a-tag v-if="item.extraInfo?.source" color="processing">
          source: {{ item.extraInfo.source }}
        </a-tag>
      </a-flex>
    </template>

    <template #footer="{ item }">
      <a-typography-text type="secondary">
        tokens: {{ item.extraInfo?.tokens || 0 }}
      </a-typography-text>
    </template>

    <template #extra="{ role: itemRole }">
      <a-tag v-if="itemRole === 'ai'" color="geekblue">assistant</a-tag>
    </template>

    <template #loadingRender="{ content, info }">
      <a-space align="center" size="small">
        <span>Custom loading:</span>
        <a-tag color="processing">{{ info.status }}</a-tag>
        <span>{{ content }}...</span>
      </a-space>
    </template>
  </ax-bubble-list>
</template>

<docs lang="zh-CN">
`BubbleList` 暴露与 `Bubble` 同名插槽（`contentRender`、`loadingRender`、`avatar`、`header`、`footer`、`extra`），并额外提供 `item/index/role`，方便在列表层统一定制渲染。
</docs>

<docs lang="en-US">
`BubbleList` exposes Bubble-compatible slot names (`contentRender`, `loadingRender`, `avatar`, `header`, `footer`, `extra`) and provides `item/index/role` for list-level customization.
</docs>
