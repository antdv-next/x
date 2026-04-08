<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import { FrownOutlined, SmileOutlined, SyncOutlined } from "@antdv-next/icons";

const role: BubbleListProps["role"] = {
  ai: {
    placement: "start",
    typing: { effect: "typing", step: 5, interval: 20 },
  },
  user: {
    placement: "end",
  },
};

const items = [
  {
    key: "welcome",
    role: "ai",
    content: "Mock welcome content. ".repeat(10),
  },
  {
    key: "ask",
    role: "user",
    content: "Mock user content.",
  },
  {
    key: "ai-loading",
    role: "ai",
    loading: true,
    content: "",
  },
];
</script>

<template>
  <ax-bubble-list style="height: 500px" :role="role" :items="items">
    <template #loadingRender="{ item }">
      <a-space
        v-if="item.role === 'ai' && item.loading"
        align="center"
        :size="6"
      >
        <a-spin size="small" />
        <span>Custom loading...</span>
      </a-space>
    </template>

    <template #footer="{ item }">
      <a-space v-if="item.role === 'ai' && !item.loading" :size="4">
        <a-button size="small" type="text">
          <SyncOutlined />
          Retry
        </a-button>
        <a-button size="small" type="text">
          <SmileOutlined />
          Like
        </a-button>
        <a-button size="small" type="text">
          <FrownOutlined />
          Dislike
        </a-button>
      </a-space>
    </template>
  </ax-bubble-list>
</template>

<docs lang="zh-CN">
示例通过语义化以及加载定制，来调整气泡效果。
</docs>

<docs lang="en-US">
Sample for adjusting the bubble effect through semantic and loading customization.
</docs>
