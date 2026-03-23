<script setup lang="ts">
import { ThoughtChain } from "@antdv-next/x";
import { Radio } from "antdv-next";
import { ref } from "vue";

type LineType = "solid" | "dashed" | "dotted" | false;
const lineStyle = ref<LineType>("solid");

const items = [
  { key: "1", title: "步骤一", status: "success" as const },
  { key: "2", title: "步骤二", status: "success" as const },
  { key: "3", title: "步骤三", status: "loading" as const },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <Radio.Group v-model:value="lineStyle">
      <Radio.Button value="solid">Solid</Radio.Button>
      <Radio.Button value="dashed">Dashed</Radio.Button>
      <Radio.Button value="dotted">Dotted</Radio.Button>
      <Radio.Button :value="false">None</Radio.Button>
    </Radio.Group>
    <ThoughtChain :items="items" :line="lineStyle" />
  </div>
</template>

<docs lang="zh-CN">
通过 `line` 属性切换连接线样式。
</docs>

<docs lang="en-US">
Switch connector line style via `line` prop.
</docs>
