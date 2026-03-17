<script setup lang="ts">
import type { ConversationsProps } from '@antdv-next/x'
import { DeleteOutlined, EditOutlined, ShareAltOutlined, StopOutlined } from '@antdv-next/icons'
import { Conversations } from '@antdv-next/x'
import { theme } from 'antdv-next'
import { computed, h } from 'vue'

const { token } = theme.useToken()

const style = computed(() => ({
  width: '256px',
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}))

const items: ConversationsProps['items'] = Array.from({ length: 4 }).map((_, index) => ({
  key: `item${index + 1}`,
  label: `Conversation Item ${index + 1}`,
  disabled: index === 3,
}))

const menuConfig: ConversationsProps['menu'] = conversation => ({
  items: [
    {
      label: 'Rename',
      key: 'Rename',
      icon: h(EditOutlined),
    },
    {
      label: 'Share',
      key: 'Share',
      icon: h(ShareAltOutlined),
    },
    {
      type: 'divider',
    },
    {
      label: 'Archive',
      key: 'Archive',
      icon: h(StopOutlined),
      disabled: true,
    },
    {
      label: 'Delete Chat',
      key: 'deleteChat',
      icon: h(DeleteOutlined),
      danger: true,
    },
  ],
  onClick: (itemInfo) => {
    console.log(`Click ${itemInfo.key}`, conversation.key)
    itemInfo.domEvent.stopPropagation()
  },
})
</script>

<template>
  <Conversations
    default-active-key="item1"
    :menu="menuConfig"
    :items="items"
    :style="style"
  />
</template>

<docs lang="zh-CN">
配合 `menu` 属性，配置操作菜单。
</docs>

<docs lang="en-US">
Use the `menu` property to configure conversation.
</docs>
