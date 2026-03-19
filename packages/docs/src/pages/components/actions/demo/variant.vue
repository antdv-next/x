<script setup lang="ts">
import type { ActionsProps } from "@antdv-next/x";

import { RedoOutlined } from "@antdv-next/icons";
import { Actions, ActionsCopy } from "@antdv-next/x";
import { message, Pagination, Space } from "antdv-next";
import { computed, h, ref } from "vue";

const curPage = ref(1);

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
    <Actions :items="items" :on-click="onClick" variant="outlined" />
    <Actions :items="items" :on-click="onClick" variant="filled" />
    <Actions :items="items" :on-click="onClick" variant="borderless" />
  </Space>
</template>

<docs lang="zh-CN">
使用 `variant` 切换变体。
</docs>

<docs lang="en-US">
Use `variant` to switch variants.
</docs>
