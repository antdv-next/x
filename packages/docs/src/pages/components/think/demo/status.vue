<script setup lang="ts">
import { OpenAIOutlined, SyncOutlined } from "@antdv-next/icons";
import { Think } from "@antdv-next/x";
import { Button } from "antdv-next";
import { h, ref } from "vue";

const title = ref("Complete thinking");
const loading = ref<boolean | ReturnType<typeof h>>(false);

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
      <Button @click="handleClick"> Run </Button>
    </div>
    <br />
    <Think :title="title" blink :loading="loading">
      This is deep thinking content.
    </Think>
    <br />
    <Think
      :title="title"
      :loading="
        loading
          ? h(SyncOutlined, {
              style: { fontSize: '12px', animation: 'spin 1s linear infinite' },
            })
          : false
      "
      :icon="h(OpenAIOutlined)"
    >
      Customize status icon.
    </Think>
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
