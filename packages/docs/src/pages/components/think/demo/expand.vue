<script setup lang="ts">
import { ref } from "vue";

const expanded = ref(true);
</script>

<template>
  <div>
    <div>
      <a-button @click="expanded = !expanded"> Change expand </a-button>
    </div>
    <br />
    <ax-think v-model:expanded="expanded" title="deep thinking">
      This is deep thinking content.
    </ax-think>
  </div>
</template>

<docs lang="zh-CN">
控制展开折叠状态。
</docs>

<docs lang="en-US">
Control expand and collapse state.
</docs>
