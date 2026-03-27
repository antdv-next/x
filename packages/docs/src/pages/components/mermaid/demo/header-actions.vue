<script setup lang="ts">
import type { MermaidProps } from "@antdv-next/x";

import { EditOutlined, ShareAltOutlined } from "@antdv-next/icons";
import { Mermaid } from "@antdv-next/x";
import { Checkbox, Flex, Space, message } from "antdv-next";
import { computed, h, ref } from "vue";

const enableZoom = ref(true);
const enableDownload = ref(true);
const enableCopy = ref(true);
const showCustom = ref(false);

const content = `flowchart TD
  A[Start] --> B{Decision Point}
  B -->|Yes| C[Process Data]
  B -->|No| D[Skip Processing]
  C --> E[Generate Report]
  D --> E
  E --> F[End]`;

const customActions: NonNullable<MermaidProps["actions"]>["customActions"] = [
  {
    key: "edit",
    icon: h(EditOutlined),
    label: "Edit",
    onItemClick: () => {
      message.info("Edit button clicked");
    },
  },
  {
    key: "share",
    icon: h(ShareAltOutlined),
    label: "Share",
    onItemClick: () => {
      message.success("Chart link copied to clipboard");
    },
  },
];

const actions = computed<MermaidProps["actions"]>(() => ({
  enableZoom: enableZoom.value,
  enableDownload: enableDownload.value,
  enableCopy: enableCopy.value,
  customActions: showCustom.value ? customActions : undefined,
}));
</script>

<template>
  <Flex vertical :gap="16">
    <Space wrap>
      <Checkbox v-model:checked="enableZoom">Enable Zoom</Checkbox>
      <Checkbox v-model:checked="enableDownload">Enable Download</Checkbox>
      <Checkbox v-model:checked="enableCopy">Enable Copy</Checkbox>
      <Checkbox v-model:checked="showCustom">Show Custom Actions</Checkbox>
    </Space>

    <Mermaid :content="content" :actions="actions" />
  </Flex>
</template>

<docs lang="zh-CN">
配置默认头部操作项及自定义操作。
</docs>

<docs lang="en-US">
Configure built-in header actions and custom actions.
</docs>
