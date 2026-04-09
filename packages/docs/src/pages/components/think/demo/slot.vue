<script setup lang="ts">
import { BulbOutlined } from "@antdv-next/icons";
</script>

<template>
  <ax-think title="prop title" :icon="BulbOutlined">
    <template #icon>
      <a-tag color="gold">AI</a-tag>
    </template>

    <template #title>
      <a-flex align="center" gap="small">
        <a-typography-text strong>Reasoning Trace</a-typography-text>
        <a-tag color="processing">streaming</a-tag>
      </a-flex>
    </template>

    <div>
      <p>
        The model is comparing options, checking constraints, and narrowing the
        final answer.
      </p>
      <a-button type="link" size="small">Inspect details</a-button>
    </div>
  </ax-think>
</template>

<docs lang="zh-CN">
通过 `title`、`icon` 和默认插槽，自定义 Think 的状态栏与思考内容区域。
</docs>

<docs lang="en-US">
Customize Think with `title`, `icon`, and default slots for the status bar and thinking content.
</docs>
