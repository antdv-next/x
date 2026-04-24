<script setup lang="ts">
import { CopyOutlined, RedoOutlined, UserOutlined } from "@antdv-next/icons";

const actionItems = [
  {
    key: "retry",
    label: "Retry",
  },
  {
    key: "copy",
    label: "Copy",
  },
];
</script>

<template>
  <a-space direction="vertical" style="display: flex; width: 100%" :size="10">
    <ax-bubble content="outer footer" header="footer">
      <template #avatar>
        <a-avatar>
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </template>
      <template #footer>
        <ax-actions :items="actionItems">
          <template #icon-render="items">
            <RedoOutlined v-if="items.item.key === 'retry'" />
            <CopyOutlined v-if="items.item.key === 'copy'" />
          </template>
        </ax-actions>
      </template>
    </ax-bubble>
    <ax-bubble
      content="inner footer"
      placement="end"
      footer-placement="inner-end"
      header="footer"
    >
      <template #avatar>
        <a-avatar>
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </template>
      <template #footer>
        <ax-actions :items="actionItems">
          <template #icon-render="items">
            <RedoOutlined v-if="items.item.key === 'retry'" />
            <CopyOutlined v-if="items.item.key === 'copy'" />
          </template>
        </ax-actions>
      </template>
    </ax-bubble>
    <ax-bubble
      content="outer footer and align right"
      footer-placement="outer-end"
      header="footer"
    >
      <template #avatar>
        <a-avatar>
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </template>
      <template #footer>
        <ax-actions :items="actionItems">
          <template #icon-render="items">
            <RedoOutlined v-if="items.item.key === 'retry'" />
            <CopyOutlined v-if="items.item.key === 'copy'" />
          </template>
        </ax-actions>
      </template>
    </ax-bubble>
    <ax-bubble
      content="inner footer and align left"
      placement="end"
      footer-placement="inner-start"
      header="footer"
    >
      <template #avatar>
        <a-avatar>
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </template>
      <template #footer>
        <ax-actions :items="actionItems">
          <template #icon-render="items">
            <RedoOutlined v-if="items.item.key === 'retry'" />
            <CopyOutlined v-if="items.item.key === 'copy'" />
          </template>
        </ax-actions>
      </template>
    </ax-bubble>
  </a-space>
</template>

<docs lang="zh-CN">
气泡尾部，不受 `placement` 影响，需要通过 `footerPlacement` 来控制尾部的渲染位置。
</docs>

<docs lang="en-US">
Bubble footer, not affected by `placement`, use `footerPlacement` to control the rendering position of the footer.
</docs>
