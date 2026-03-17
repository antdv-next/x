<script setup lang="ts">
import type { ConversationsProps } from '@antdv-next/x'
import {
  DeleteOutlined,
  EditOutlined,
  PlusSquareOutlined,
  ShareAltOutlined,
  StopOutlined,
} from '@antdv-next/icons'
import { Conversations } from '@antdv-next/x'
import type { MenuProps } from 'antdv-next'
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

const menuItems: MenuProps['items'] = [
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
]

const menuConfig: ConversationsProps['menu'] = conversation => ({
  trigger:
    conversation.key === 'item2'
      ? h(ShareAltOutlined, {
          onClick: (event: MouseEvent) => {
            event.stopPropagation()
            console.log(`Share ${conversation.key}`)
          },
        })
      : h(PlusSquareOutlined, {
          onClick: (event: MouseEvent) => {
            event.stopPropagation()
          },
        }),
  items: conversation.key !== 'item2' ? menuItems : [],
  onClick: (itemInfo) => {
    console.log(`Click ${conversation.key}-${itemInfo.key}`)
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
自定义菜单入口。
</docs>

<docs lang="en-US">
Customize the menu trigger.
</docs>
