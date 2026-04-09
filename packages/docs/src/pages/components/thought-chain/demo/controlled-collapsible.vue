<script setup lang="ts">
import type { ThoughtChainProps } from "@antdv-next/x";

import { CodeOutlined, EditOutlined } from "@antdv-next/icons";
import { ref } from "vue";

const expandedKeys = ref(["create_task"]);

const items: ThoughtChainProps["items"] = [
  {
    key: "create_task",
    title: "Create Task: Develop New Component",
    description: "Execute files needed for new component creation",
    collapsible: true,
    status: "success",
  },
  {
    key: "check_task",
    title: "Check Task Execution Steps Completion",
    collapsible: true,
    description: "Verify the overall task execution logic and feasibility",
    status: "success",
  },
  {
    key: "used_task",
    title: "Using the New Component",
    description: "Using the generated component to complete the task",
    collapsible: true,
    status: "loading",
  },
];
</script>

<template>
  <a-card :style="{ width: '500px' }">
    <a-button
      :style="{ marginBottom: '16px' }"
      @click="expandedKeys = ['check_task']"
    >
      Open "check_task" details
    </a-button>
    <ax-thought-chain v-model:expanded-keys="expandedKeys" :items="items">
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
        </a-flex>

        <a-flex v-else-if="item.key === 'used_task'" gap="small" vertical>
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="File created"
            description="component"
          />
        </a-flex>
      </template>
    </ax-thought-chain>
  </a-card>
</template>

<docs lang="zh-CN">
受控的思维链节点内容区域的折叠功能。
</docs>

<docs lang="en-US">
Controlled collapsible function for thought chain node content area.
</docs>
