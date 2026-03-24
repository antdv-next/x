<script setup lang="ts">
import type { ThoughtChainProps } from "@antdv-next/x";

import { CodeOutlined, EditOutlined } from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { Button, Card, Flex, Typography } from "antdv-next";
import { h, ref } from "vue";

const expandedKeys = ref(["create_task"]);

const items: ThoughtChainProps["items"] = [
  {
    key: "create_task",
    title: "Create Task: Develop New Component",
    description: "Execute files needed for new component creation",
    collapsible: true,
    content: h(Flex, { gap: "small", vertical: true }, () => [
      h(
        Typography.Text,
        { type: "secondary" },
        () => "Creating folder for new component",
      ),
      h(ThoughtChain.Item, {
        variant: "solid",
        icon: h(CodeOutlined),
        title: "Executing command",
        description: "mkdir -p component",
      }),
      h(
        Typography.Text,
        { type: "secondary" },
        () => "Creating files needed for new component",
      ),
      h(ThoughtChain.Item, {
        variant: "solid",
        icon: h(EditOutlined),
        title: "Creating file",
        description: "component/index.tsx",
      }),
    ]),
    status: "success",
  },
  {
    key: "check_task",
    title: "Check Task Execution Steps Completion",
    collapsible: true,
    description: "Verify the overall task execution logic and feasibility",
    content: h(Flex, { gap: "small", vertical: true }, () => [
      h(ThoughtChain.Item, {
        variant: "solid",
        status: "success",
        title: "Folder created",
        description: "component",
      }),
      h(ThoughtChain.Item, {
        variant: "solid",
        status: "success",
        title: "File created",
        description: "component/index.tsx",
      }),
    ]),
    status: "success",
  },
  {
    key: "used_task",
    title: "Using the New Component",
    description: "Using the generated component to complete the task",
    content: h(Flex, { gap: "small", vertical: true }, () => [
      h(ThoughtChain.Item, {
        variant: "solid",
        status: "success",
        title: "File created",
        description: "component",
      }),
    ]),
    status: "loading",
  },
];
</script>

<template>
  <Card :style="{ width: '500px' }">
    <Button
      :style="{ marginBottom: '16px' }"
      @click="expandedKeys = ['check_task']"
    >
      Open "check_task" details
    </Button>
    <ThoughtChain v-model:expanded-keys="expandedKeys" :items="items" />
  </Card>
</template>

<docs lang="zh-CN">
受控的思维链节点内容区域的折叠功能。
</docs>

<docs lang="en-US">
Controlled collapsible function for thought chain node content area.
</docs>
