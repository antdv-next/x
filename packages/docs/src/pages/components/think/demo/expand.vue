<script setup lang="ts">
import { Think } from "@antdv-next/x";
import { Button } from "antdv-next";
import { ref } from "vue";

const expanded = ref(true);
</script>

<template>
  <div>
    <div>
      <Button @click="expanded = !expanded"> Change expand </Button>
    </div>
    <br />
    <Think v-model:expanded="expanded" title="deep thinking">
      This is deep thinking content.
    </Think>
  </div>
</template>

<docs lang="zh-CN">
控制展开折叠状态。
</docs>

<docs lang="en-US">
Control expand and collapse state.
</docs>
