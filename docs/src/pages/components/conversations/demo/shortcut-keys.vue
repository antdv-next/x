<script setup lang="ts">
import type { ConversationsProps } from '@antdv-next/x'
import {
  CodeOutlined,
  CodeSandboxOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  SignatureOutlined,
} from '@antdv-next/icons'
import { Conversations } from '@antdv-next/x'
import { Flex, Tag, theme } from 'antdv-next'
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
    key: 'inDepthResearch',
    label: 'In-depth research',
    group: 'More Features',
  },
  {
    key: 'vincentFigure',
    label: 'Vincent Figure',
    group: 'More Features',
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
  <div style="margin-bottom: 16px;">
    You can switch sessions using the shortcut key:
    <Tag>Alt/⌥</Tag>
    +
    <Tag>number</Tag>
    , and create new chat using the shortcut key:
    <Tag>Win/⌘</Tag>
    +
    <Tag>K</Tag>
    .
  </div>

  <Conversations
    :creation="{ onClick: newChatClick }"
    :style="style"
    default-active-key="write"
    :on-active-change="(value) => { console.log(value) }"
    :shortcut-keys="{
      creation: ['Meta', 75],
      items: ['Alt', 'number'],
    }"
    :groupable="{
      label: (group) => {
        if (group !== 'Today') {
          return h(Flex, { gap: 'small' }, {
            default: () => [h(CodeSandboxOutlined), group],
          })
        }
        return group
      },
      collapsible: (group) => group !== 'Today',
    }"
    :items="items"
  />
</template>

<docs lang="zh-CN">
通过 `shortcutKeys` 为切换会话或新建会话设置快捷键。
</docs>

<docs lang="en-US">
Set shortcut keys for switching sessions or creating new sessions through `shortcutKeys`.
</docs>
