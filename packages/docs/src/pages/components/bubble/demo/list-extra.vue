<script setup lang="ts">
import type { ActionsFeedbackProps } from "@antdv-next/x";

import { Actions, BubbleList } from "@antdv-next/x";
import { Flex, Spin } from "antdv-next";
import { h, ref } from "vue";

const messages = ref<any[]>([
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
    loadingRender: () =>
      h(
        Flex,
        { align: "center", gap: "small" },
        {
          default: () => [
            h(Spin, { size: "small" }),
            h("span", "Custom loading..."),
          ],
        },
      ),
    footer: (content: string, info: any) => {
      const feedback =
        (info.extraInfo?.feedback as ActionsFeedbackProps["value"]) ||
        "default";
      return h(Actions, {
        items: [
          {
            key: "copy",
            label: "copy",
            actionRender: () => h(Actions.Copy, { text: content }),
          },
          {
            key: "feedback",
            actionRender: () =>
              h(Actions.Feedback, {
                value: feedback,
                styles: {
                  liked: {
                    color: "#f759ab",
                  },
                },
                onChange: val => updateFeedback(info.key!, val),
              }),
          },
        ],
      });
    },
  },
  user: {
    placement: "end",
  },
};
</script>

<template>
  <BubbleList style="height: 500px" :role="role" :items="messages" />
</template>

<docs lang="zh-CN">
配合扩展参数实现自定义扩展能力。
</docs>

<docs lang="en-US">
Implement custom extension capabilities in conjunction with extension parameters.
</docs>
