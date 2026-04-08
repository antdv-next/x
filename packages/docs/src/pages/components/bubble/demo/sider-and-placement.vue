<script setup lang="ts">
import { CopyOutlined, UserOutlined } from "@antdv-next/icons";
</script>

<template>
  <a-space direction="vertical" style="display: flex; width: 100%" :size="10">
    <ax-bubble content="align left">
      <template #avatar>
        <a-tooltip title="main side">
          <a-avatar>
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>
        </a-tooltip>
      </template>
      <template #extra>
        <a-tooltip title="extra side">
          <CopyOutlined />
        </a-tooltip>
      </template>
    </ax-bubble>
    <ax-bubble content="align right" placement="end">
      <template #avatar>
        <a-tooltip title="main side">
          <a-avatar>
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>
        </a-tooltip>
      </template>
      <template #extra>
        <a-tooltip title="extra side">
          <CopyOutlined />
        </a-tooltip>
      </template>
    </ax-bubble>
  </a-space>
</template>

<docs lang="zh-CN">
气泡边栏与位置，位置 `placement` 会改变主次侧栏的位置。
</docs>

<docs lang="en-US">
Bubble sidebar and placement, `placement` will change the position of the primary and secondary sidebars.
</docs>
