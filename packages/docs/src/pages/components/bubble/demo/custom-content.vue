<script setup lang="ts">
import { ref } from "vue";

interface CustomContent {
  imageUrl: string;
  text: string;
  actionLabel: string;
}

const content = ref<CustomContent>({
  imageUrl: "https://x.antdv-next.com/x.svg",
  text: "Antdv Next X",
  actionLabel: "Click Me",
});

function updateAction() {
  content.value = {
    ...content.value,
    actionLabel: "Happy Antdv Next X!",
  };
}
</script>

<template>
  <ax-bubble :content="content">
    <template #contentRender="{ content: value }">
      <a-space align="center" :size="10">
        <a-image :width="50" :src="value.imageUrl" :preview="false" />
        <a-typography-text strong>
          {{ value.text }}
        </a-typography-text>
      </a-space>
    </template>
    <template #footer>
      <a-button type="text" size="small" @click="updateAction">
        {{ content.actionLabel }}
      </a-button>
    </template>
  </ax-bubble>
</template>

<docs lang="zh-CN">
自定义渲染内容。
</docs>

<docs lang="en-US">
Custom rendering content.
</docs>
