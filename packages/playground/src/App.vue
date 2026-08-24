<script setup lang="ts">
import type { BubbleItemType } from "@antdv-next/x";

import { BubbleList, Sender, Welcome, XProvider } from "@antdv-next/x";
import { ref } from "vue";

const items = ref<BubbleItemType[]>([
  {
    key: "welcome",
    content: "Hello! How can I help you today?",
    placement: "start",
    role: "assistant",
  },
]);

const loading = ref(false);

async function handleSubmit(value: string) {
  if (!value.trim()) return;

  items.value.push({
    key: `user-${Date.now()}`,
    content: value,
    placement: "end",
    role: "user",
  });

  // Simulate assistant response
  loading.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));
  items.value.push({
    key: `assistant-${Date.now()}`,
    content: `You said: "${value}"`,
    placement: "start",
    role: "assistant",
  });
  loading.value = false;
}
</script>

<template>
  <XProvider>
    <div style="max-width: 800px; margin: 0 auto; padding: 24px">
      <Welcome
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="你好，我是 Antdv Next X"
        description="基于 Antdv Next 的 AGI 产品界面解决方案，打造更美好的智能愿景~"
      />

      <BubbleList :items="items" :auto-scroll="true" style="margin-top: 24px" />

      <Sender
        :loading="loading"
        style="margin-top: 24px"
        @submit="handleSubmit"
      />
    </div>
  </XProvider>
</template>
