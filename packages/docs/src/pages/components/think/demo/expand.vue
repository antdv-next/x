<script setup lang="ts">
import { Think } from "@antdv-next/x";
import { Button, Space } from "antdv-next";
import { ref } from "vue";

const expanded = ref(true);
</script>

<template>
  <Space direction="vertical" style="display: flex; width: 100%">
    <Think v-model:expanded="expanded" title="受控展开">
      <p>这段内容可以通过按钮或点击标题栏控制展开/折叠。</p>
    </Think>
    <Button @click="expanded = !expanded">
      {{ expanded ? "折叠" : "展开" }}
    </Button>
  </Space>
</template>

<docs lang="zh-CN">
通过 `v-model:expanded` 实现受控展开。
</docs>

<docs lang="en-US">
Controlled expand via `v-model:expanded`.
</docs>
