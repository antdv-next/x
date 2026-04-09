<script setup lang="ts">
import type { ThoughtChainProps } from "@antdv-next/x";

import { CodeOutlined, EditOutlined } from "@antdv-next/icons";

const items: ThoughtChainProps["items"] = [
  {
    key: "create_task",
    title: "Create Task: Write New Component",
    description: "Execute files needed for creating new component",
    collapsible: true,
    status: "success",
  },
  {
    key: "check_task",
    title: "Checking Task Execution Steps",
    description: "Verify overall task execution logic and feasibility",
    collapsible: true,
    status: "loading",
  },
];
</script>

<template>
  <a-card :style="{ width: '500px' }">
    <ax-thought-chain :default-expanded-keys="['create_task']" :items="items">
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

        <a-flex v-else-if="item.key === 'check_task'" gap="small" vertical>
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="Folder created"
            description="component"
          />
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="File created"
            description="component/index.tsx"
          />
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="File created"
            description="component/index.zh-CN.md"
          />
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="File created"
            description="component/index.en-US.md"
          />
        </a-flex>
      </template>
    </ax-thought-chain>
  </a-card>
</template>

<docs lang="zh-CN">
配置 `collapsible` 可开启对思维链节点内容区域的折叠功能。
</docs>

<docs lang="en-US">
Configure `collapsible` to enable the expand for the content area of thought chain nodes.
</docs>
