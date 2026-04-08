<script setup lang="ts">
const text = "Hello, this is a system message";
</script>

<template>
  <a-space direction="vertical" style="display: flex; width: 100%" :size="14">
    <ax-bubble-system :content="text" />

    <ax-bubble-system variant="outlined" shape="round" :content="text">
      <template #contentRender="{ content }">
        <span> {{ content }} <a-typography-link>ok</a-typography-link> </span>
      </template>
    </ax-bubble-system>

    <ax-bubble-system variant="borderless" :content="text">
      <template #contentRender="{ content }">
        <span>
          {{ content }} <a-typography-link>cancel</a-typography-link>
        </span>
      </template>
    </ax-bubble-system>
  </a-space>
</template>

<docs lang="zh-CN">
系统信息 Bubble。
</docs>

<docs lang="en-US">
Bubble of system information.
</docs>
