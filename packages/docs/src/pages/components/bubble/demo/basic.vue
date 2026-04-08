<script setup lang="ts">
import { AntDesignOutlined, RedoOutlined } from "@antdv-next/icons";

const actionItems = [
  {
    key: "copy",
    label: "copy",
  },
  {
    key: "retry",
    label: "Retry",
  },
];

const text = "Hello World\nNext line\nTab\tindent";
</script>

<template>
  <ax-bubble
    :content="text"
    :typing="{ effect: 'fade-in' }"
    header="Antdv Design X"
  >
    <template #avatar>
      <a-avatar size="small">
        <template #icon>
          <AntDesignOutlined />
        </template>
      </a-avatar>
    </template>
    <template #footer>
      <ax-actions :items="actionItems">
        <template #icon-render="items">
          <RedoOutlined v-if="items.item.key === 'copy'" />
        </template>

        <template #action-render="items">
          <ax-actions-copy v-if="items.item.key === 'retry'" :text="text" />
        </template>
      </ax-actions>
    </template>
  </ax-bubble>
</template>

<docs lang="zh-CN">
基础用法。
</docs>

<docs lang="en-US">
Basic usage.
</docs>
