<script setup lang="ts">
import type { ThoughtChainProps } from "@antdv-next/x";

import { CodeOutlined, EditOutlined } from "@antdv-next/icons";

const contentStyles = {
  backgroundColor: "rgba(0,0,0,.01)",
  borderRadius: "8px",
  padding: "10px",
  marginBlockStart: "10px",
  border: "1px solid rgba(0,0,0,.04)",
};

const items: ThoughtChainProps["items"] = [
  {
    key: "create_task",
    title: "Create Task: Write New Component",
    icon: false,
    collapsible: true,
  },
];
</script>

<template>
  <a-card :style="{ width: '500px' }">
    <ax-thought-chain
      :styles="{ itemContent: contentStyles }"
      :default-expanded-keys="['create_task']"
      :items="items"
    >
      <template #content="{ item }">
        <a-flex v-if="item.key === 'create_task'" gap="small" vertical>
          <a-typography-text type="secondary">
            Creating folder for new component
          </a-typography-text>
          <ax-thought-chain-item
            variant="solid"
            title="Executing command"
            description="mkdir -p component"
          >
            <template #iconRender>
              <CodeOutlined />
            </template>
          </ax-thought-chain-item>
          <a-typography-text type="secondary">
            Creating files needed for new component
          </a-typography-text>
          <ax-thought-chain-item
            variant="solid"
            title="Creating file"
            description="component/index.tsx"
          >
            <template #iconRender>
              <EditOutlined />
            </template>
          </ax-thought-chain-item>
          <a-typography-text type="secondary">
            Creating Chinese description file for new component
          </a-typography-text>
          <ax-thought-chain-item
            variant="solid"
            title="Creating file"
            description="component/index.zh-CN.md"
          >
            <template #iconRender>
              <EditOutlined />
            </template>
          </ax-thought-chain-item>
          <a-typography-text type="secondary">
            Creating English description file for new component
          </a-typography-text>
          <ax-thought-chain-item
            variant="solid"
            title="Creating file"
            description="component/index.en-US.md"
          >
            <template #iconRender>
              <EditOutlined />
            </template>
          </ax-thought-chain-item>
        </a-flex>
      </template>
    </ax-thought-chain>
  </a-card>
</template>

<docs lang="zh-CN">
单行折叠。
</docs>

<docs lang="en-US">
Single row collapsible.
</docs>
