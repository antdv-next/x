<docs lang="zh-CN">
通过 `theme` 修改主题。
</docs>

<docs lang="en-US">
Modify theme by `theme` prop.
</docs>

<script setup lang="ts">
import type {
  ActionsProps,
  ConversationsProps,
  XProviderProps,
} from "@antdv-next/x";

import { CommentOutlined, FireOutlined, ReadOutlined } from "@antdv-next/icons";
import { computed, ref } from "vue";

const colorPrimary = ref("#d10eef");

const theme = computed<XProviderProps["theme"]>(() => {
  return {
    token: {
      colorPrimary: colorPrimary.value,
    },
  };
});

const conversationItems: ConversationsProps["items"] = [
  {
    key: "1",
    label: "Conversation - 1",
  },
  {
    key: "2",
    label: "Conversation - 2",
  },
];

const actionItems: ActionsProps["items"] = [
  {
    key: "feedback",
    label: "feedback",
  },
  {
    key: "copy",
    label: "copy",
  },
  {
    key: "audio",
    label: "audio",
  },
];

function onColorChange(value: { toHexString?: () => string } | string) {
  if (typeof value === "string") {
    colorPrimary.value = value;
    return;
  }

  const nextColor = value.toHexString?.();
  if (nextColor) colorPrimary.value = nextColor;
}
</script>

<template>
  <a-flex :gap="12" style="margin-bottom: 16px" align="center">
    <a-typography-text>ColorPrimary:</a-typography-text>
    <a-color-picker :value="colorPrimary" @change="onColorChange" />
  </a-flex>

  <a-card>
    <ax-x-provider :theme="theme">
      <a-flex :gap="12" vertical>
        <ax-conversations
          :style="{ width: '220px' }"
          :creation="{ onClick: () => {} }"
          default-active-key="1"
          :items="conversationItems"
        >
          <template #iconRender="{ item }">
            <FireOutlined v-if="item.key === '1'" style="color: #ff4d4f" />
            <ReadOutlined v-else-if="item.key === '2'" style="color: #1890ff" />
          </template>
        </ax-conversations>

        <a-card size="small">
          <template #title>
            <a-space align="center">
              <CommentOutlined />
              <span>Themed Actions</span>
            </a-space>
          </template>
          <ax-actions :items="actionItems" variant="filled">
            <template #actionRender="{ item }">
              <ax-actions-feedback v-if="item.key === 'feedback'" />
              <ax-actions-copy
                v-else-if="item.key === 'copy'"
                text="Theme token demo"
              />
              <ax-actions-audio v-else-if="item.key === 'audio'" />
            </template>
          </ax-actions>
        </a-card>
      </a-flex>
    </ax-x-provider>
  </a-card>
</template>
