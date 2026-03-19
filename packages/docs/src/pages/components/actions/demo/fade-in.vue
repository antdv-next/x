<script setup lang="ts">
import type { ActionsProps } from "@antdv-next/x";

import { RedoOutlined } from "@antdv-next/icons";
import { Actions, ActionsCopy } from "@antdv-next/x";
import { Button, message, Pagination, Space, Switch } from "antdv-next";
import { computed, h, ref } from "vue";

const curPage = ref(1);
const renderKey = ref(0);
const fadeInLeft = ref(true);

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
    key: "retry",
    icon: h(RedoOutlined),
    label: "Retry",
  },
  {
    key: "copy",
    label: "Copy",
    actionRender: () => h(ActionsCopy, { text: "copy value" }),
  },
]);

const onClick: ActionsProps["onClick"] = ({ keyPath }) => {
  message.success(`you clicked ${keyPath.join(",")}`);
};
</script>

<template>
  <Space direction="vertical" style="display: flex; width: 100%" :size="12">
    <Space wrap>
      <Switch
        v-model:checked="fadeInLeft"
        checked-children="fadeInLeft"
        un-checked-children="fadeIn"
      />
      <Button @click="renderKey += 1"> Re-Render </Button>
    </Space>

    <Actions
      :key="renderKey"
      :fade-in="!fadeInLeft"
      :fade-in-left="fadeInLeft"
      :items="items"
      :on-click="onClick"
      variant="borderless"
    />
  </Space>
</template>

<docs lang="zh-CN">
渐进效果。
</docs>

<docs lang="en-US">
FadeIn.
</docs>
