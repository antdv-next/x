<script setup lang="ts">
import type { ThoughtChainProps } from "@antdv-next/x";

import { CodeOutlined, EditOutlined } from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { Card, Flex, Typography } from "antdv-next";
import { h } from "vue";

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
  },
];
</script>

<template>
  <Card :style="{ width: '500px' }">
    <ThoughtChain
      :styles="{ itemContent: contentStyles }"
      :default-expanded-keys="['create_task']"
      :items="items"
    />
  </Card>
</template>

<docs lang="zh-CN">
单行折叠。
</docs>

<docs lang="en-US">
Single row collapsible.
</docs>
