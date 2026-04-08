<script setup lang="ts">
import { ref } from "vue";

const loading = ref(true);
</script>

<template>
  <a-space direction="vertical" style="display: flex; width: 100%">
    <ax-bubble :loading="loading" content="hello world !" />
    <a-space>
      <span>Loading state:</span>
      <a-switch v-model:checked="loading" />
    </a-space>
  </a-space>
</template>

<docs lang="zh-CN">
通过 `loading` 属性控制加载状态。
</docs>

<docs lang="en-US">
Control the loading state by `loading` prop.
</docs>
