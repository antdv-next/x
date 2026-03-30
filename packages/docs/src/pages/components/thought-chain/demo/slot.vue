<script setup lang="ts">
import type {
  ThoughtChainItemType,
  ThoughtChainItemStatus,
} from "@antdv-next/x";

import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  LoadingOutlined,
} from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { Button, Card, Flex, Tag, Typography } from "antdv-next";

const items: ThoughtChainItemType[] = [
  {
    key: "plan",
    title: "Planning execution steps",
    description: "Transform the schema into view-level slots",
    status: "loading",
    collapsible: true,
    content:
      "Split the implementation into interface changes, rendering updates, and regression tests.",
    footer: "Waiting for implementation to complete",
  },
  {
    key: "verify",
    title: "Verification",
    description: "Run checks and update examples",
    status: "success",
    collapsible: true,
    content:
      "Validate the new slot API with demos, docs, and targeted tests to keep the old items API compatible.",
    footer: "Ready for review",
  },
];

function getStatusLabel(status?: ThoughtChainItemStatus) {
  switch (status) {
    case "loading":
      return "Running";
    case "success":
      return "Done";
    case "error":
      return "Error";
    case "abort":
      return "Abort";
    default:
      return "Queued";
  }
}

function getStatusColor(status?: ThoughtChainItemStatus) {
  switch (status) {
    case "loading":
      return "processing";
    case "success":
      return "success";
    case "error":
      return "error";
    case "abort":
      return "default";
    default:
      return "blue";
  }
}
</script>

<template>
  <Card :style="{ width: '560px' }">
    <Flex vertical gap="large">
      <Flex vertical gap="small">
        <Typography.Title :level="5" :style="{ margin: 0 }">
          ThoughtChain scoped slots
        </Typography.Title>
        <ThoughtChain :items="items" :default-expanded-keys="['plan']">
          <template #iconRender="{ status, index }">
            <LoadingOutlined v-if="status === 'loading'" />
            <CheckCircleTwoTone
              v-else-if="status === 'success'"
              two-tone-color="#52c41a"
            />
            <CloseCircleTwoTone
              v-else-if="status === 'error'"
              two-tone-color="#ff4d4f"
            />
            <span v-else>{{ index + 1 }}</span>
          </template>

          <template #title="{ item }">
            <Flex align="center" gap="small">
              <span>{{ item.title }}</span>
              <Tag :color="getStatusColor(item.status)">
                {{ getStatusLabel(item.status) }}
              </Tag>
            </Flex>
          </template>

          <template #content="{ originNode, expanded }">
            <Flex
              vertical
              gap="small"
              :style="{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(5, 145, 255, 0.06)',
              }"
            >
              <Typography.Text type="secondary">
                {{ originNode }}
              </Typography.Text>
              <Typography.Text strong>
                {{ expanded ? "Expanded" : "Collapsed" }}
              </Typography.Text>
            </Flex>
          </template>

          <template #footer="{ item, expanded, collapsible, toggleExpand }">
            <Flex align="center" justify="space-between" gap="small">
              <Typography.Text type="secondary">
                {{ item.footer }}
              </Typography.Text>
              <Button
                v-if="collapsible"
                type="link"
                size="small"
                @click="toggleExpand"
              >
                {{ expanded ? "Collapse" : "Expand" }}
              </Button>
            </Flex>
          </template>
        </ThoughtChain>
      </Flex>

      <Flex vertical gap="small">
        <Typography.Title :level="5" :style="{ margin: 0 }">
          ThoughtChain.Item slots
        </Typography.Title>
        <ThoughtChain.Item variant="outlined" status="success">
          <template #iconRender>
            <CheckCircleTwoTone two-tone-color="#52c41a" />
          </template>
          <template #title>
            <Flex align="center" gap="small">
              <span>Publish slot API</span>
              <Tag color="success">Slot</Tag>
            </Flex>
          </template>
          <template #description>
            <Typography.Text type="secondary">
              packages/x/components/thought-chain
            </Typography.Text>
          </template>
        </ThoughtChain.Item>
      </Flex>
    </Flex>
  </Card>
</template>

<docs lang="zh-CN">
支持通过 `ThoughtChain` 的作用域插槽和 `ThoughtChain.Item` 的同名插槽覆盖默认的 `VNodeChild` 渲染，同时保留原有 `items` 配置方式。
</docs>

<docs lang="en-US">
Supports overriding the default `VNodeChild` rendering with scoped slots on `ThoughtChain` and named slots on `ThoughtChain.Item`, while keeping the original `items` API intact.
</docs>
