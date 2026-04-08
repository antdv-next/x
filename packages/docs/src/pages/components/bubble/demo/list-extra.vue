<script setup lang="ts">
import type { ActionsFeedbackProps } from "@antdv-next/x";

import { shallowRef } from "vue";

const messages = shallowRef<any[]>([
  {
    key: "welcome",
    role: "ai",
    status: "success",
    variant: "borderless",
    content: "Mock welcome content. ".repeat(8),
    extraInfo: {
      feedback: "like",
    },
  },
  {
    key: "ask",
    role: "user",
    content: "Mock user content.",
  },
  {
    key: "ai_1",
    role: "ai",
    status: "success",
    variant: "borderless",
    content: "Mock follow-up content. ".repeat(8),
    extraInfo: {
      feedback: "dislike",
    },
  },
  {
    key: "user_2",
    role: "user",
    content: "Mock user content.",
  },
  {
    key: "ai_loading",
    role: "ai",
    status: "loading",
    loading: true,
    content: "",
  },
]);

function updateFeedback(
  key: string | number,
  feedback: ActionsFeedbackProps["value"],
) {
  messages.value = messages.value.map(item => {
    if (item.key !== key) return item;

    return {
      ...item,
      extraInfo: {
        ...item.extraInfo,
        feedback,
      },
    };
  });
}

const role: any = {
  ai: {
    placement: "start",
    typing: (_: any, info: any) =>
      info.status === "updating"
        ? { effect: "typing", step: 5, interval: 20 }
        : false,
  },
  user: {
    placement: "end",
  },
};
</script>

<template>
  <ax-bubble-list style="height: 500px" :role="role" :items="messages">
    <template #loadingRender="{ item }">
      <a-flex
        v-if="item.role === 'ai' && item.loading"
        align="center"
        gap="small"
      >
        <a-spin size="small" />
        <span>Custom loading...</span>
      </a-flex>
    </template>

    <template #footer="{ content, item }">
      <ax-actions
        v-if="item.role === 'ai' && !item.loading"
        :items="[
          {
            key: 'copy',
            label: 'copy',
          },
          {
            key: 'feedback',
          },
        ]"
      >
        <template #action-render="{ item: actionItem }">
          <ax-actions-copy v-if="actionItem.key === 'copy'" :text="content" />
          <ax-actions-feedback
            v-if="actionItem.key === 'feedback'"
            :value="item.extraInfo?.feedback || 'default'"
            :styles="{ liked: { color: '#f759ab' } }"
            @change="updateFeedback(item.key, $event)"
          />
        </template>
      </ax-actions>
    </template>
  </ax-bubble-list>
</template>

<docs lang="zh-CN">
配合扩展参数实现自定义扩展能力。
</docs>

<docs lang="en-US">
Implement custom extension capabilities in conjunction with extension parameters.
</docs>
