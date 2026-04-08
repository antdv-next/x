<script setup lang="ts">
import { RedoOutlined } from "@antdv-next/icons";
import { XMarkdown } from "@antdv-next/x-markdown";
import { computed, onBeforeUnmount, ref } from "vue";

const source = `
> Render as markdown content to show rich text!

Link: [Antdv Next X](https://x.antdv-next.com)
`.trim();

const index = ref(source.length);
let timer: ReturnType<typeof setInterval> | null = null;

const content = computed(() => source.slice(0, index.value));

const streaming = computed(() => ({
  hasNextChunk: index.value < source.length,
  enableAnimation: true,
}));

function rerender() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  index.value = 1;
  timer = setInterval(() => {
    index.value += 5;
    if (index.value >= source.length) {
      index.value = source.length;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
  }, 20);
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <a-space direction="vertical" style="display: flex; width: 100%" :size="10">
    <a-space>
      <a-button type="primary" @click="rerender">
        <RedoOutlined />
        rerender
      </a-button>
    </a-space>
    <a-typography>
      <ax-bubble :content="content">
        <template #contentRender="{ content: value }">
          <XMarkdown :content="value" :streaming="streaming" />
        </template>
      </ax-bubble>
    </a-typography>
  </a-space>
</template>

<docs lang="zh-CN">
配合 `x-markdown` 实现自定义渲染内容。
</docs>

<docs lang="en-US">
Cooperate with `x-markdown` to achieve customized rendering content.
</docs>
