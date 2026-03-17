<script setup lang="ts">
import type { ConversationsProps } from '@antdv-next/x'
import {
  AppstoreAddOutlined,
  CodeOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  SignatureOutlined,
} from '@antdv-next/icons'
import { Conversations } from '@antdv-next/x'
import { theme } from 'antdv-next'
import { computed, h, ref } from 'vue'

const { token } = theme.useToken()

const style = computed(() => ({
  width: '256px',
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}))

const agentItems: ConversationsProps['items'] = [
  {
    key: 'write',
    label: 'Help Me Write',
    icon: h(SignatureOutlined),
  },
  {
    key: 'coding',
    label: 'AI Coding',
    icon: h(CodeOutlined),
  },
  {
    key: 'createImage',
    label: 'Create Image',
    icon: h(FileImageOutlined),
  },
  {
    key: 'deepSearch',
    label: 'Deep Search',
    icon: h(FileSearchOutlined),
  },
  {
    type: 'divider',
  },
]

const historicalItems = ref<ConversationsProps['items']>([
  {
    key: 'item1',
    label: 'Conversation Item 1',
    group: 'Today',
  },
])

const items = computed(() => [...agentItems, ...(historicalItems.value ?? [])])

function newChatClick() {
  const list = historicalItems.value ?? []
  historicalItems.value = [
    ...list,
    {
      key: `item${list.length + 1}`,
      label: `Conversation Item ${list.length + 1}`,
      group: 'Today',
    },
  ]
}
</script>

<template>
  <Conversations
    :creation="{
      label: 'Create a new chat',
      align: 'start',
      icon: h(AppstoreAddOutlined),
      onClick: newChatClick,
    }"
    :items="items"
    default-active-key="write"
    :style="style"
    groupable
  />
</template>

<docs lang="zh-CN">
自定义新对话。
</docs>

<docs lang="en-US">
Customize the new chat.
</docs>
