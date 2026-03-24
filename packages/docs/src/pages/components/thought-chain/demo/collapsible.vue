<script setup lang="ts">
import type { ThoughtChainProps } from "@antdv-next/x";

import { CodeOutlined, EditOutlined } from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { Card, Flex, Typography } from "antdv-next";
import { h } from "vue";

const items: ThoughtChainProps["items"] = [
  {
    key: "create_task",
    title: "Create Task: Write New Component",
    description: "Execute files needed for creating new component",
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
      h(
        Typography.Text,
        { type: "secondary" },
        () => "Creating Chinese description file for new component",
      ),
      h(ThoughtChain.Item, {
        variant: "solid",
        icon: h(EditOutlined),
        title: "Creating file",
        description: "component/index.zh-CN.md",
      }),
      h(
        Typography.Text,
        { type: "secondary" },
        () => "Creating English description file for new component",
      ),
      h(ThoughtChain.Item, {
        variant: "solid",
        icon: h(EditOutlined),
        title: "Creating file",
        description: "component/index.en-US.md",
      }),
    ]),
    status: "success",
  },
  {
    key: "check_task",
    title: "Checking Task Execution Steps",
    description: "Verify overall task execution logic and feasibility",
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
      h(ThoughtChain.Item, {
        variant: "solid",
        status: "success",
        title: "File created",
        description: "component/index.zh-CN.md",
      }),
      h(ThoughtChain.Item, {
        variant: "solid",
        status: "success",
        title: "File created",
        description: "component/index.en-US.md",
      }),
    ]),
    status: "loading",
  },
];
</script>

<template>
  <Card :style="{ width: '500px' }">
    <ThoughtChain :default-expanded-keys="['create_task']" :items="items" />
  </Card>
</template>

<docs lang="zh-CN">
配置 `collapsible` 可开启对思维链节点内容区域的折叠功能。
</docs>

<docs lang="en-US">
Configure `collapsible` to enable the expand for the content area of thought chain nodes.
</docs>
