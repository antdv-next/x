<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { Flex, Input, Switch, Typography } from "antdv-next";
import { computed, ref } from "vue";

const { TextArea } = Input;

const source = ref(
  `# XMarkdown Playground\n\nType Markdown and preview immediately.`,
);
const enableAnimation = ref(true);
const tail = ref(true);

const streaming = computed(() => ({
  hasNextChunk: false,
  enableAnimation: enableAnimation.value,
  tail: tail.value,
}));
</script>

<template>
  <Flex vertical :gap="10">
    <Flex :gap="12" align="center">
      <span>Animation</span>
      <Switch v-model:checked="enableAnimation" />
      <span>Tail</span>
      <Switch v-model:checked="tail" />
    </Flex>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
      <TextArea v-model:value="source" :rows="14" />
      <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 12px">
        <XMarkdown :content="source" :streaming="streaming" />
      </div>
    </div>
  </Flex>
</template>

<docs lang="zh-CN">
XMarkdown 在线体验：实时输入并预览渲染结果。
</docs>

<docs lang="en-US">
XMarkdown playground: edit and preview rendering in real time.
</docs>
