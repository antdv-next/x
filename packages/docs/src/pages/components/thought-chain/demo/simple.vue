<script setup lang="ts">
import {
  EditOutlined,
  GlobalOutlined,
  SearchOutlined,
  SunOutlined,
} from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { Flex, Typography } from "antdv-next";
import { h } from "vue";

function onClick() {
  console.log("Item Click");
}
</script>

<template>
  <Flex vertical gap="middle">
    <Flex gap="small" align="flex-start">
      <Typography.Text :style="{ whiteSpace: 'nowrap' }"
        >loading status:</Typography.Text
      >
      <Flex wrap align="center" gap="middle">
        <ThoughtChain.Item
          variant="solid"
          status="loading"
          title="Tool Calling"
        />
        <ThoughtChain.Item
          variant="outlined"
          status="loading"
          title="Tool Calling"
        />
        <ThoughtChain.Item
          variant="text"
          status="loading"
          title="Tool Calling"
        />
      </Flex>
    </Flex>

    <Flex gap="small" align="flex-start">
      <Typography.Text :style="{ whiteSpace: 'nowrap' }"
        >success status:</Typography.Text
      >
      <Flex wrap align="center" gap="middle">
        <ThoughtChain.Item
          variant="solid"
          status="success"
          title="Tool Call Finished"
        />
        <ThoughtChain.Item
          variant="outlined"
          status="success"
          title="Tool Call Finished"
        />
        <ThoughtChain.Item
          variant="text"
          status="success"
          title="Tool Call Finished"
        />
      </Flex>
    </Flex>

    <Flex gap="small" align="flex-start">
      <Typography.Text :style="{ whiteSpace: 'nowrap' }"
        >error status:</Typography.Text
      >
      <Flex wrap align="center" gap="middle">
        <ThoughtChain.Item
          variant="solid"
          status="error"
          title="Tool Call Error"
        />
        <ThoughtChain.Item
          variant="outlined"
          status="error"
          title="Tool Call Error"
        />
        <ThoughtChain.Item
          variant="text"
          status="error"
          title="Tool Call Error"
        />
      </Flex>
    </Flex>

    <Flex gap="small" align="flex-start">
      <Typography.Text :style="{ whiteSpace: 'nowrap' }"
        >abort status:</Typography.Text
      >
      <Flex wrap align="center" gap="middle">
        <ThoughtChain.Item
          variant="solid"
          status="abort"
          title="Agent Response Aborted"
        />
        <ThoughtChain.Item
          variant="outlined"
          status="abort"
          title="Agent Response Aborted"
        />
        <ThoughtChain.Item
          variant="text"
          status="abort"
          title="Agent Response Aborted"
        />
      </Flex>
    </Flex>

    <Flex gap="small" align="flex-start">
      <Typography.Text :style="{ whiteSpace: 'nowrap' }"
        >custom icon:</Typography.Text
      >
      <Flex wrap align="center" gap="middle">
        <ThoughtChain.Item
          variant="solid"
          :icon="h(SunOutlined)"
          title="Task Completed"
        />
        <ThoughtChain.Item
          variant="outlined"
          :icon="h(SunOutlined)"
          title="Task Completed"
        />
        <ThoughtChain.Item
          variant="text"
          :icon="h(SunOutlined)"
          title="Task Completed"
        />
      </Flex>
    </Flex>

    <Flex gap="small" align="flex-start">
      <Typography.Text :style="{ whiteSpace: 'nowrap' }"
        >click:</Typography.Text
      >
      <Flex wrap align="center" gap="middle">
        <ThoughtChain.Item
          variant="solid"
          :on-click="onClick"
          :icon="h(GlobalOutlined)"
          title="Opening Webpage"
          description="https://x.ant.design/docs/playground/copilot"
        />
        <ThoughtChain.Item
          variant="outlined"
          :on-click="onClick"
          :icon="h(EditOutlined)"
          title="Creating"
          description="todo.md"
        />
        <ThoughtChain.Item
          variant="text"
          :on-click="onClick"
          :icon="h(SearchOutlined)"
          title="Searching"
          description="Route Information"
        />
        <ThoughtChain.Item
          variant="solid"
          status="error"
          :on-click="onClick"
          :icon="h(GlobalOutlined)"
          title="Opening Webpage"
          description="https://x.ant.design/docs/playground/copilot"
        />
        <ThoughtChain.Item
          :on-click="onClick"
          variant="solid"
          status="success"
          title="Tool Call Finished"
        />
        <ThoughtChain.Item
          :on-click="onClick"
          variant="outlined"
          status="success"
          title="Tool Call Finished"
        />
        <ThoughtChain.Item
          :on-click="onClick"
          variant="text"
          status="success"
          title="Tool Call Finished"
        />
      </Flex>
    </Flex>

    <Flex gap="small" align="flex-start">
      <Typography.Text :style="{ whiteSpace: 'nowrap' }"
        >blink:</Typography.Text
      >
      <Flex wrap align="center" gap="middle">
        <ThoughtChain.Item
          :blink="true"
          variant="solid"
          :icon="h(SunOutlined)"
          title="Task Completed"
        />
        <ThoughtChain.Item
          :blink="true"
          variant="outlined"
          :icon="h(SunOutlined)"
          title="Task Completed"
        />
        <ThoughtChain.Item
          :blink="true"
          variant="text"
          :icon="h(SunOutlined)"
          title="Task Completed"
          description="Route Information"
        />
      </Flex>
    </Flex>

    <Flex gap="small" align="flex-start">
      <Typography.Text :style="{ whiteSpace: 'nowrap' }"
        >disabled:</Typography.Text
      >
      <Flex wrap align="center" gap="middle">
        <ThoughtChain.Item
          disabled
          :on-click="onClick"
          variant="solid"
          :icon="h(SunOutlined)"
          title="Task Completed"
        />
        <ThoughtChain.Item
          disabled
          :on-click="onClick"
          variant="outlined"
          :icon="h(SunOutlined)"
          title="Task Completed"
        />
        <ThoughtChain.Item
          disabled
          :on-click="onClick"
          variant="text"
          :icon="h(SunOutlined)"
          title="Task Completed"
          description="Route Information"
        />
        <ThoughtChain.Item
          disabled
          variant="solid"
          status="error"
          :on-click="onClick"
          :icon="h(GlobalOutlined)"
          title="Opening Webpage"
          description="playground/copilot"
        />
        <ThoughtChain.Item
          disabled
          variant="outlined"
          status="error"
          :on-click="onClick"
          :icon="h(GlobalOutlined)"
          title="Opening Webpage"
          description="playground/copilot"
        />
        <ThoughtChain.Item
          disabled
          variant="text"
          status="error"
          :on-click="onClick"
          :icon="h(GlobalOutlined)"
          title="Opening Webpage"
          description="playground/copilot"
        />
        <ThoughtChain.Item
          disabled
          :on-click="onClick"
          variant="solid"
          status="success"
          title="Tool Call Finished"
        />
        <ThoughtChain.Item
          disabled
          :on-click="onClick"
          variant="outlined"
          status="success"
          title="Tool Call Finished"
        />
        <ThoughtChain.Item
          disabled
          :on-click="onClick"
          variant="text"
          status="success"
          title="Tool Call Finished"
        />
      </Flex>
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
简洁思维链，提供不同的类型可供选择。
</docs>

<docs lang="en-US">
A concise thought chain component, providing multiple visual types for different statuses and scenarios.
</docs>
