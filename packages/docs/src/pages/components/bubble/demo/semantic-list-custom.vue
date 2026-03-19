<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import { FrownOutlined, SmileOutlined, SyncOutlined } from "@antdv-next/icons";
import { BubbleList } from "@antdv-next/x";
import { Button, Space, Spin } from "antdv-next";
import { h } from "vue";

const role: BubbleListProps["role"] = {
  ai: {
    placement: "start",
    typing: { effect: "typing", step: 5, interval: 20 },
    loadingRender: () =>
      h(
        Space,
        { align: "center", size: 6 },
        {
          default: () => [
            h(Spin, { size: "small" }),
            h("span", "Custom loading..."),
          ],
        },
      ),
  },
  user: {
    placement: "end",
  },
};

function footer() {
  return h(
    Space,
    { size: 4 },
    {
      default: () => [
        h(
          Button,
          { size: "small", type: "text" },
          {
            default: () => [h(SyncOutlined), "Retry"],
          },
        ),
        h(
          Button,
          { size: "small", type: "text" },
          {
            default: () => [h(SmileOutlined), "Like"],
          },
        ),
        h(
          Button,
          { size: "small", type: "text" },
          {
            default: () => [h(FrownOutlined), "Dislike"],
          },
        ),
      ],
    },
  );
}

const items = [
  {
    key: "welcome",
    role: "ai",
    content: "Mock welcome content. ".repeat(10),
    footer,
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
  <BubbleList style="height: 500px" :role="role" :items="items" />
</template>

<docs lang="zh-CN">
示例通过语义化以及加载定制，来调整气泡效果。
</docs>

<docs lang="en-US">
Sample for adjusting the bubble effect through semantic and loading customization.
</docs>
