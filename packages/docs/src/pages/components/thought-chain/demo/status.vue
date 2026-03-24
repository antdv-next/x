<script setup lang="ts">
import type { ThoughtChainItemType } from "@antdv-next/x";

import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { Button, Card } from "antdv-next";
import { h, ref } from "vue";

function getStatusIcon(status: ThoughtChainItemType["status"]) {
  switch (status) {
    case "success":
      return h(CheckCircleOutlined);
    case "error":
      return h(InfoCircleOutlined);
    case "loading":
      return h(LoadingOutlined);
    default:
      return undefined;
  }
}

function snapshot(data: ThoughtChainItemType[]) {
  return data.map(item => ({ ...item, icon: getStatusIcon(item.status) }));
}

const mockData: ThoughtChainItemType[] = [
  {
    title: "Thought Chain Item - 1",
    status: "success",
    description: "status: success",
  },
  {
    title: "Thought Chain Item - 2",
    status: "error",
    description: "status: error",
  },
];

const items = ref<ThoughtChainItemType[]>(snapshot(mockData));
const loading = ref(false);

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

async function onClick() {
  loading.value = true;

  mockData.push({
    title: `Thought Chain Item - ${mockData.length + 1}`,
    status: "loading",
    description: "status: loading",
  });
  items.value = snapshot(mockData);

  const last = mockData[mockData.length - 1]!;

  await delay(800);
  last.status = "error";
  last.description = "status: error";
  items.value = snapshot(mockData);

  await delay(800);
  last.status = "loading";
  last.description = "status: loading";
  items.value = snapshot(mockData);

  await delay(800);
  last.status = "success";
  last.description = "status: success";
  items.value = snapshot(mockData);

  loading.value = false;
}
</script>

<template>
  <Card :style="{ width: '500px' }">
    <Button
      :style="{ marginBottom: '16px' }"
      :loading="loading"
      @click="onClick"
    >
      {{ loading ? "Running" : "Run Next" }}
    </Button>
    <ThoughtChain :items="items" />
  </Card>
</template>

<docs lang="zh-CN">
思维链节点支持配置 `status` 属性来明显的表明当前节点的执行状态。
</docs>

<docs lang="en-US">
The thought chain nodes support configuring the `status` property to clearly indicate the current execution status of the node.
</docs>
