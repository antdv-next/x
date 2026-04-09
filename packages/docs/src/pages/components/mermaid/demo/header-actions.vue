<script setup lang="ts">
import type { MermaidProps } from "@antdv-next/x";

import { EditOutlined, ShareAltOutlined } from "@antdv-next/icons";
import { message } from "antdv-next";
import { computed, ref } from "vue";

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
    label: "Edit",
    onItemClick: () => {
      message.info("Edit button clicked");
    },
  },
  {
    key: "share",
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
  <a-flex vertical :gap="16">
    <a-space wrap>
      <a-checkbox v-model:checked="enableZoom">Enable Zoom</a-checkbox>
      <a-checkbox v-model:checked="enableDownload">Enable Download</a-checkbox>
      <a-checkbox v-model:checked="enableCopy">Enable Copy</a-checkbox>
      <a-checkbox v-model:checked="showCustom">Show Custom Actions</a-checkbox>
    </a-space>

    <ax-mermaid :content="content" :actions="actions">
      <template #customActionIconRender="{ item }">
        <EditOutlined v-if="item.key === 'edit'" />
        <ShareAltOutlined v-else-if="item.key === 'share'" />
      </template>

      <template #customActionRender="{ item }">
        <a-button
          v-if="item.key === 'share'"
          type="text"
          size="small"
          @click="item.onItemClick?.(item)"
        >
          Share Link
        </a-button>
      </template>
    </ax-mermaid>
  </a-flex>
</template>

<docs lang="zh-CN">
配置默认头部操作项及自定义操作。
</docs>

<docs lang="en-US">
Configure built-in header actions and custom actions.
</docs>
