<script setup lang="ts">
import type { ConversationsProps } from '@antdv-next/x'
import { FieldTimeOutlined } from '@antdv-next/icons'
import { Conversations } from '@antdv-next/x'
import { Flex, theme } from 'antdv-next'
import { computed, h, ref } from 'vue'

const { token } = theme.useToken()
const expandedKeys = ref(['Yesterday'])

const style = computed(() => ({
  width: '256px',
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}))

const groupName = ['Today', 'Yesterday', 'Historical chats']
const items: ConversationsProps['items'] = Array.from({ length: 9 }).map((_, index) => ({
  key: `item${index + 1}`,
  label: `Conversation Item ${index + 1}`,
  group: groupName[index % 3],
}))

const groupable = computed<ConversationsProps['groupable']>(() => ({
  label: group => h(Flex, { gap: 'small' }, {
    default: () => [h(FieldTimeOutlined), group],
  }),
  collapsible: group => group !== 'Today',
  expandedKeys: expandedKeys.value,
  onExpand: (keys) => {
    expandedKeys.value = keys
  },
}))
</script>

<template>
  <Conversations
    :items="items"
    default-active-key="item1"
    :style="style"
    :groupable="groupable"
  />
</template>

<docs lang="zh-CN">
受控的分组可折叠。
</docs>

<docs lang="en-US">
Controlled group collapsing‌ function.
</docs>
