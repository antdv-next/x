<script setup lang="ts">
import type { Component } from "vue";

import { defineAsyncComponent } from "vue";

/**
 * 独立 demo 页( /~demos/:id )包装:
 * 与文档页一致包一层 `ant-doc vp-doc`,让原生元素(如 button)吃到
 * markdown 主题的 UA 重置样式(否则会残留浏览器默认样式)。
 */
const props = defineProps<{
  component: () => Promise<{ default: Component }>;
}>();

const demo = defineAsyncComponent(props.component);
</script>

<template>
  <div class="ant-doc vp-doc">
    <component :is="demo" />
  </div>
</template>
