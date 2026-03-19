<script setup lang="ts">
import type {
  ActionsFeedbackProps,
  ActionsItemProps,
  ActionsProps,
} from "@antdv-next/x";

import { CheckOutlined, ShareAltOutlined } from "@antdv-next/icons";
import {
  Actions,
  ActionsAudio,
  ActionsCopy,
  ActionsFeedback,
  ActionsItem,
} from "@antdv-next/x";
import { message, Pagination } from "antdv-next";
import { computed, h, ref } from "vue";

const curPage = ref(1);
const feedbackStatus = ref<ActionsFeedbackProps["value"]>("default");
const audioStatus = ref<ActionsItemProps["status"]>("default");
const shareStatus = ref<ActionsItemProps["status"]>("default");

function toggleStatus(type: "share" | "audio") {
  const statusRef = type === "share" ? shareStatus : audioStatus;

  if (statusRef.value === "default") {
    statusRef.value = "loading";
    setTimeout(() => {
      statusRef.value = "running";
    }, 1500);
    return;
  }

  if (statusRef.value === "running") {
    statusRef.value = "loading";
    setTimeout(() => {
      statusRef.value = "default";
    }, 1500);
  }
}

const items = computed<ActionsProps["items"]>(() => [
  {
    key: "pagination",
    actionRender: () =>
      h(Pagination, {
        simple: true,
        current: curPage.value,
        onChange: (page: number) => {
          curPage.value = page;
        },
        total: 5,
        pageSize: 1,
      }),
  },
  {
    key: "feedback",
    actionRender: () =>
      h(ActionsFeedback, {
        value: feedbackStatus.value,
        styles: {
          liked: {
            color: "#f759ab",
          },
        },
        onChange: val => {
          feedbackStatus.value = val;
          message.success(`Change feedback value to: ${val}`);
        },
      }),
  },
  {
    key: "copy",
    label: "Copy",
    actionRender: () => h(ActionsCopy, { text: "copy value" }),
  },
  {
    key: "audio",
    label: "Audio",
    actionRender: () =>
      h(ActionsAudio, {
        onClick: () => toggleStatus("audio"),
        status: audioStatus.value,
      }),
  },
  {
    key: "share",
    label: "Share",
    actionRender: () =>
      h(ActionsItem, {
        onClick: () => toggleStatus("share"),
        label: shareStatus.value,
        status: shareStatus.value,
        defaultIcon: h(ShareAltOutlined),
        runningIcon: h(CheckOutlined),
      }),
  },
]);
</script>

<template>
  <Actions :items="items" />
</template>

<docs lang="zh-CN">
对于一些常用的功能，可以使用预设的组件来实现快速的搭建。
</docs>

<docs lang="en-US">
For some commonly used functions, preset components can be used to quickly build them.
</docs>
