<script setup lang="ts">
import type { ThoughtChainItemType } from "@antdv-next/x";

import {
  CodeOutlined,
  EditOutlined,
  HeartTwoTone,
  SmileTwoTone,
} from "@antdv-next/icons";

const items: ThoughtChainItemType[] = [
  {
    key: "create_task",
    title: "Create Task",
    description: "description",
    collapsible: true,
  },
  {
    key: "check_task",
    title: "Check Task Execution Steps Completion",
    collapsible: true,
    description: "Verify the overall task execution logic and feasibility",
  },
  {
    key: "used_task",
    title: "Checking Task Execution Steps",
    collapsible: true,
    description: "Verify the overall task execution logic and feasibility",
    status: "error",
  },
];
</script>

<template>
  <a-card :style="{ width: '500px' }">
    <ax-thought-chain :items="items" line="dashed">
      <template #iconRender="{ item }">
        <HeartTwoTone
          v-if="item.key === 'create_task'"
          two-tone-color="#eb2f96"
        />
        <SmileTwoTone v-else-if="item.key === 'check_task'" />
      </template>

      <template #content="{ item }">
        <a-flex v-if="item.key === 'create_task'" gap="small" vertical>
          <ax-think title="Thinking Process">
            1. Analyze task, understand task workflow
            <br />
            2. Task creation, files needed for task
            <br />
            3. Task execution, using new component
          </ax-think>
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
            Creating Chinese documentation file for new component
          </a-typography-text>
          <ax-thought-chain-item
            variant="solid"
            title="Continue creating file"
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
            title="Continue creating file"
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
            title="Folder creation completed"
            description="component"
          />
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="File creation completed"
            description="component/index.tsx"
          />
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="File creation completed"
            description="component/index.zh-CN.md"
          />
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="File creation completed"
            description="component/index.en-US.md"
          />
        </a-flex>

        <a-flex v-else-if="item.key === 'used_task'" gap="small" vertical>
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="Folder creation completed"
            description="component"
          />
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="File creation completed"
            description="component/index.tsx"
          />
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="File creation completed"
            description="component/index.zh-CN.md"
          />
          <ax-thought-chain-item
            variant="solid"
            status="success"
            title="File creation completed"
            description="component/index.en-US.md"
          />
        </a-flex>
      </template>

      <template #footer="{ item }">
        <a-button v-if="item.key === 'create_task'" block>
          Thought Chain Item Footer
        </a-button>
      </template>
    </ax-thought-chain>
  </a-card>
</template>

<docs lang="zh-CN">
`items` 属性支持灵活的客制化配置，详情参考 `ThoughtChainItemType` 定义。
</docs>

<docs lang="en-US">
The `items` property supports flexible customization. For more details, refer to the `ThoughtChainItemType` definition.
</docs>
