<script setup lang="ts">
import { Think } from "@antdv-next/x";
import { Space, Switch } from "antdv-next";
import { ref } from "vue";

const loading = ref(true);
const blink = ref(true);
</script>

<template>
  <Space direction="vertical" style="display: flex; width: 100%">
    <Think title="深度思考中" :loading="loading" :blink="blink">
      <p>正在分析问题并生成回答...</p>
    </Think>
    <Space>
      <span>Loading:</span>
      <Switch v-model:checked="loading" />
      <span>Blink:</span>
      <Switch v-model:checked="blink" />
    </Space>
  </Space>
</template>

<docs lang="zh-CN">
通过 `loading` 和 `blink` 属性控制状态。
</docs>

<docs lang="en-US">
Control loading and blink states.
</docs>
