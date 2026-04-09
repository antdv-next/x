<script setup lang="ts">
import {
  EditOutlined,
  GlobalOutlined,
  SearchOutlined,
  SunOutlined,
} from "@antdv-next/icons";

function onClick() {
  console.log("Item Click");
}
</script>

<template>
  <a-flex vertical gap="middle">
    <a-flex gap="small" align="flex-start">
      <a-typography-text :style="{ whiteSpace: 'nowrap' }"
        >loading status:</a-typography-text
      >
      <a-flex wrap align="center" gap="middle">
        <ax-thought-chain-item
          variant="solid"
          status="loading"
          title="Tool Calling"
        />
        <ax-thought-chain-item
          variant="outlined"
          status="loading"
          title="Tool Calling"
        />
        <ax-thought-chain-item
          variant="text"
          status="loading"
          title="Tool Calling"
        />
      </a-flex>
    </a-flex>

    <a-flex gap="small" align="flex-start">
      <a-typography-text :style="{ whiteSpace: 'nowrap' }"
        >success status:</a-typography-text
      >
      <a-flex wrap align="center" gap="middle">
        <ax-thought-chain-item
          variant="solid"
          status="success"
          title="Tool Call Finished"
        />
        <ax-thought-chain-item
          variant="outlined"
          status="success"
          title="Tool Call Finished"
        />
        <ax-thought-chain-item
          variant="text"
          status="success"
          title="Tool Call Finished"
        />
      </a-flex>
    </a-flex>

    <a-flex gap="small" align="flex-start">
      <a-typography-text :style="{ whiteSpace: 'nowrap' }"
        >error status:</a-typography-text
      >
      <a-flex wrap align="center" gap="middle">
        <ax-thought-chain-item
          variant="solid"
          status="error"
          title="Tool Call Error"
        />
        <ax-thought-chain-item
          variant="outlined"
          status="error"
          title="Tool Call Error"
        />
        <ax-thought-chain-item
          variant="text"
          status="error"
          title="Tool Call Error"
        />
      </a-flex>
    </a-flex>

    <a-flex gap="small" align="flex-start">
      <a-typography-text :style="{ whiteSpace: 'nowrap' }"
        >abort status:</a-typography-text
      >
      <a-flex wrap align="center" gap="middle">
        <ax-thought-chain-item
          variant="solid"
          status="abort"
          title="Agent Response Aborted"
        />
        <ax-thought-chain-item
          variant="outlined"
          status="abort"
          title="Agent Response Aborted"
        />
        <ax-thought-chain-item
          variant="text"
          status="abort"
          title="Agent Response Aborted"
        />
      </a-flex>
    </a-flex>

    <a-flex gap="small" align="flex-start">
      <a-typography-text :style="{ whiteSpace: 'nowrap' }"
        >custom icon:</a-typography-text
      >
      <a-flex wrap align="center" gap="middle">
        <ax-thought-chain-item variant="solid" title="Task Completed">
          <template #iconRender>
            <SunOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item variant="outlined" title="Task Completed">
          <template #iconRender>
            <SunOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item variant="text" title="Task Completed">
          <template #iconRender>
            <SunOutlined />
          </template>
        </ax-thought-chain-item>
      </a-flex>
    </a-flex>

    <a-flex gap="small" align="flex-start">
      <a-typography-text :style="{ whiteSpace: 'nowrap' }"
        >click:</a-typography-text
      >
      <a-flex wrap align="center" gap="middle">
        <ax-thought-chain-item
          variant="solid"
          :on-click="onClick"
          title="Opening Webpage"
          description="https://x.ant.design/docs/playground/copilot"
        >
          <template #iconRender>
            <GlobalOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          variant="outlined"
          :on-click="onClick"
          title="Creating"
          description="todo.md"
        >
          <template #iconRender>
            <EditOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          variant="text"
          :on-click="onClick"
          title="Searching"
          description="Route Information"
        >
          <template #iconRender>
            <SearchOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          variant="solid"
          status="error"
          :on-click="onClick"
          title="Opening Webpage"
          description="https://x.ant.design/docs/playground/copilot"
        >
          <template #iconRender>
            <GlobalOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          :on-click="onClick"
          variant="solid"
          status="success"
          title="Tool Call Finished"
        />
        <ax-thought-chain-item
          :on-click="onClick"
          variant="outlined"
          status="success"
          title="Tool Call Finished"
        />
        <ax-thought-chain-item
          :on-click="onClick"
          variant="text"
          status="success"
          title="Tool Call Finished"
        />
      </a-flex>
    </a-flex>

    <a-flex gap="small" align="flex-start">
      <a-typography-text :style="{ whiteSpace: 'nowrap' }"
        >blink:</a-typography-text
      >
      <a-flex wrap align="center" gap="middle">
        <ax-thought-chain-item
          :blink="true"
          variant="solid"
          title="Task Completed"
        >
          <template #iconRender>
            <SunOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          :blink="true"
          variant="outlined"
          title="Task Completed"
        >
          <template #iconRender>
            <SunOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          :blink="true"
          variant="text"
          title="Task Completed"
          description="Route Information"
        >
          <template #iconRender>
            <SunOutlined />
          </template>
        </ax-thought-chain-item>
      </a-flex>
    </a-flex>

    <a-flex gap="small" align="flex-start">
      <a-typography-text :style="{ whiteSpace: 'nowrap' }"
        >disabled:</a-typography-text
      >
      <a-flex wrap align="center" gap="middle">
        <ax-thought-chain-item
          disabled
          :on-click="onClick"
          variant="solid"
          title="Task Completed"
        >
          <template #iconRender>
            <SunOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          disabled
          :on-click="onClick"
          variant="outlined"
          title="Task Completed"
        >
          <template #iconRender>
            <SunOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          disabled
          :on-click="onClick"
          variant="text"
          title="Task Completed"
          description="Route Information"
        >
          <template #iconRender>
            <SunOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          disabled
          variant="solid"
          status="error"
          :on-click="onClick"
          title="Opening Webpage"
          description="playground/copilot"
        >
          <template #iconRender>
            <GlobalOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          disabled
          variant="outlined"
          status="error"
          :on-click="onClick"
          title="Opening Webpage"
          description="playground/copilot"
        >
          <template #iconRender>
            <GlobalOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          disabled
          variant="text"
          status="error"
          :on-click="onClick"
          title="Opening Webpage"
          description="playground/copilot"
        >
          <template #iconRender>
            <GlobalOutlined />
          </template>
        </ax-thought-chain-item>
        <ax-thought-chain-item
          disabled
          :on-click="onClick"
          variant="solid"
          status="success"
          title="Tool Call Finished"
        />
        <ax-thought-chain-item
          disabled
          :on-click="onClick"
          variant="outlined"
          status="success"
          title="Tool Call Finished"
        />
        <ax-thought-chain-item
          disabled
          :on-click="onClick"
          variant="text"
          status="success"
          title="Tool Call Finished"
        />
      </a-flex>
    </a-flex>
  </a-flex>
</template>

<docs lang="zh-CN">
简洁思维链，提供不同的类型可供选择。
</docs>

<docs lang="en-US">
A concise thought chain component, providing multiple visual types for different statuses and scenarios.
</docs>
