<script setup lang="ts">
import { XProvider } from "@antdv-next/x";
import { ref } from "vue";

import ChatDemo from "./ChatDemo.vue";
import FolderComparison from "./FolderComparison.vue";

const demo = ref("folder");
</script>

<template>
  <XProvider>
    <nav class="demo-nav" aria-label="Playground 示例">
      <button :aria-pressed="demo === 'folder'" @click="demo = 'folder'">
        Folder 对比 · #240
      </button>
      <button :aria-pressed="demo === 'chat'" @click="demo = 'chat'">
        聊天演示
      </button>
    </nav>
    <FolderComparison v-if="demo === 'folder'" />
    <ChatDemo v-else />
  </XProvider>
</template>

<style scoped>
.demo-nav {
  display: flex;
  gap: 8px;
  max-width: 1120px;
  margin: 24px auto 0;
  padding: 0 24px;
}

.demo-nav button {
  padding: 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: #333;
  cursor: pointer;
}

.demo-nav button[aria-pressed="true"] {
  border-color: #1677ff;
  color: #0958d9;
  background: #e6f4ff;
}
</style>
