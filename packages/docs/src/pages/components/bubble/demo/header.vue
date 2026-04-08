<script setup lang="ts">
import { UserOutlined } from "@antdv-next/icons";
</script>

<template>
  <a-space direction="vertical" style="display: flex; width: 100%" :size="10">
    <ax-bubble content="align left" header="header">
      <template #avatar>
        <a-avatar size="small">
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </template>
    </ax-bubble>
    <ax-bubble content="align right" placement="end" header="header">
      <template #avatar>
        <a-avatar size="small">
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </template>
    </ax-bubble>
  </a-space>
</template>

<docs lang="zh-CN">
气泡头部，位置 `placement` 会改变头部的对齐方式。
</docs>

<docs lang="en-US">
Bubble header, `placement` will change the alignment of the header.
</docs>
