<script setup lang="ts">
import { OpenAIOutlined, SyncOutlined } from "@antdv-next/icons";
import { ref } from "vue";

const title = ref("Complete thinking");
const loading = ref<boolean>(false);

function handleClick() {
  loading.value = true;
  title.value = "deep thinking";

  setTimeout(() => {
    loading.value = false;
    title.value = "Complete thinking";
  }, 2000);
}
</script>

<template>
  <div>
    <div>
      <a-button @click="handleClick"> Run </a-button>
    </div>
    <br />
    <ax-think :title="title" blink :loading="loading">
      This is deep thinking content.
    </ax-think>
    <br />
    <ax-think :title="title">
      <template #icon>
        <SyncOutlined
          v-if="loading"
          style="font-size: 12px; animation: spin 1s linear infinite"
        />
        <OpenAIOutlined v-else />
      </template>
      Customize status icon.
    </ax-think>
  </div>
</template>

<style>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<docs lang="zh-CN">
可自定义状态文本和图标。
</docs>

<docs lang="en-US">
Customize status text and status icon.
</docs>
