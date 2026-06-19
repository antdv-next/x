<script setup lang="ts">
import type { MermaidProps } from "@antdv-next/x";

import { EditOutlined, ShareAltOutlined } from "@antdv-next/icons";
import { App } from "antdv-next";
import { computed, h, ref } from "vue";
const { message } = App.useApp();

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
  <div class="demo-wrapper">
    <div class="config-panel">
      <h2 class="config-title">Header Actions Configuration</h2>
      <a-space :size="24" wrap>
        <a-checkbox v-model:checked="enableZoom">Enable Zoom</a-checkbox>
        <a-checkbox v-model:checked="enableDownload">
          Enable Download
        </a-checkbox>
        <a-checkbox v-model:checked="enableCopy">Enable Copy</a-checkbox>
        <a-checkbox v-model:checked="showCustom">
          Show Custom Actions
        </a-checkbox>
      </a-space>
    </div>

    <div class="mermaid-wrapper">
      <ax-mermaid :content="content" :actions="actions" />
    </div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.config-panel {
  margin-bottom: 24px;
}

.config-title {
  margin-bottom: 16px;
  color: var(--ant-color-text, #1a1a1a);
}

.mermaid-wrapper {
  overflow: hidden;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  border-radius: 8px;
}
</style>

<docs lang="zh-CN">
配置头部操作项。
</docs>

<docs lang="en-US">
Configure header actions.
</docs>
