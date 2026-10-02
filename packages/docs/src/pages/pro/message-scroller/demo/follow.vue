<docs lang="zh-CN">
跟随状态：通过 `v-model:follow` 受控，宿主可据此构建「回到最新」提示或未读计数；`followChange` 实时上报状态变化。
</docs>

<docs lang="en-US">
Following state: control it through `v-model:follow` and build "back to latest" hints or unread counters on top of it. `followChange` reports every transition.
</docs>

<script setup lang="ts">
import { MessageScroller } from "@antdv-next/x-pro";
import { ref } from "vue";

const following = ref(true);
const changeCount = ref(0);
const messages = Array.from({ length: 14 }, (_, index) => ({
  id: `message-${index + 1}`,
  from: (index % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
  content: `Turn ${index + 1}: scroll away from the bottom and the viewport stops following this transcript.`,
}));

function handleFollowChange(value: boolean) {
  changeCount.value += 1;
  following.value = value;
}
</script>

<template>
  <div>
    <a-flex justify="space-between" align="center" style="margin-bottom: 12px">
      <a-space>
        <a-tag :color="following ? 'success' : 'warning'">
          {{ following ? "Following" : "Detached" }}
        </a-tag>
        <a-typography-text type="secondary">
          followChange × {{ changeCount }}
        </a-typography-text>
      </a-space>
      <a-button @click="following = !following"> Toggle follow </a-button>
    </a-flex>

    <MessageScroller
      v-model:follow="following"
      back-to-bottom
      :follow-threshold="56"
      :style="{
        height: '300px',
        border: '1px solid var(--ant-color-border)',
        borderRadius: '14px',
        background: 'var(--ant-color-bg-container)',
      }"
      @follow-change="handleFollowChange"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        :data-message-id="message.id"
        style="padding: 8px 16px"
      >
        <div
          style="
            padding: 8px 12px;
            border-radius: 12px;
            background: var(--ant-color-fill-secondary);
          "
        >
          <a-typography-text>{{ message.content }}</a-typography-text>
        </div>
      </div>
    </MessageScroller>
  </div>
</template>
