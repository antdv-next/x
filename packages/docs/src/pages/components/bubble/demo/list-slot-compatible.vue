<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import { BubbleList } from "@antdv-next/x";
import { Avatar, Flex, Space, Tag, Typography } from "antdv-next";
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
  <BubbleList style="height: 420px" :items="items" :role="role">
    <template #avatar="{ role: itemRole }">
      <Avatar size="small">
        {{ itemRole === "user" ? "U" : "AI" }}
      </Avatar>
    </template>

    <template #header="{ role: itemRole, index, info }">
      <Space size="small">
        <Typography.Text type="secondary">
          {{ itemRole.toUpperCase() }}
        </Typography.Text>
        <Typography.Text type="secondary">#{{ index + 1 }}</Typography.Text>
        <Tag color="blue">{{ info.key }}</Tag>
      </Space>
    </template>

    <template #contentRender="{ content, item }">
      <Flex vertical gap="small">
        <span>{{ content }}</span>
        <Tag v-if="item.extraInfo?.source" color="processing">
          source: {{ item.extraInfo.source }}
        </Tag>
      </Flex>
    </template>

    <template #footer="{ item }">
      <Typography.Text type="secondary">
        tokens: {{ item.extraInfo?.tokens || 0 }}
      </Typography.Text>
    </template>

    <template #extra="{ role: itemRole }">
      <Tag v-if="itemRole === 'ai'" color="geekblue">assistant</Tag>
    </template>

    <template #loadingRender="{ content, info }">
      <Space align="center" size="small">
        <span>Custom loading:</span>
        <Tag color="processing">{{ info.status }}</Tag>
        <span>{{ content }}...</span>
      </Space>
    </template>
  </BubbleList>
</template>

<docs lang="zh-CN">
`BubbleList` 暴露与 `Bubble` 同名插槽（`contentRender`、`loadingRender`、`avatar`、`header`、`footer`、`extra`），并额外提供 `item/index/role`，方便在列表层统一定制渲染。
</docs>

<docs lang="en-US">
`BubbleList` exposes Bubble-compatible slot names (`contentRender`, `loadingRender`, `avatar`, `header`, `footer`, `extra`) and provides `item/index/role` for list-level customization.
</docs>
