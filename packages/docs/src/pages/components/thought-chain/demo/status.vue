<script setup lang="ts">
import type { ThoughtChainItemType } from "@antdv-next/x";

import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from "@antdv-next/icons";
import { ref } from "vue";

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

const items = ref<ThoughtChainItemType[]>([...mockData]);
const loading = ref(false);

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

async function onClick() {
  loading.value = true;

  mockData.push({
    title: `Thought Chain Item - ${mockData.length + 1}`,
    status: "loading",
    description: "status: loading",
  });
  items.value = [...mockData];

  const last = mockData[mockData.length - 1]!;

  await delay(800);
  last.status = "error";
  last.description = "status: error";
  items.value = [...mockData];

  await delay(800);
  last.status = "loading";
  last.description = "status: loading";
  items.value = [...mockData];

  await delay(800);
  last.status = "success";
  last.description = "status: success";
  items.value = [...mockData];

  loading.value = false;
}
</script>

<template>
  <a-card :style="{ width: '500px' }">
    <a-button
      :style="{ marginBottom: '16px' }"
      :loading="loading"
      @click="onClick"
    >
      {{ loading ? "Running" : "Run Next" }}
    </a-button>
    <ax-thought-chain :items="items">
      <template #iconRender="{ status }">
        <CheckCircleOutlined v-if="status === 'success'" />
        <InfoCircleOutlined v-else-if="status === 'error'" />
        <LoadingOutlined v-else-if="status === 'loading'" />
      </template>
    </ax-thought-chain>
  </a-card>
</template>

<docs lang="zh-CN">
思维链节点支持配置 `status` 属性来明显的表明当前节点的执行状态。
</docs>

<docs lang="en-US">
The thought chain nodes support configuring the `status` property to clearly indicate the current execution status of the node.
</docs>
