<script setup lang="ts">
import type { ConversationsProps } from '@antdv-next/x'
import { Conversations } from '@antdv-next/x'
import { theme } from 'antdv-next'
import { computed } from 'vue'

const { token } = theme.useToken()

const style = computed(() => ({
  width: '256px',
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}))

const items: ConversationsProps['items'] = Array.from({ length: 6 }).map((_, index) => ({
  key: `item${index + 1}`,
  label:
    index === 0
      ? "This's Conversation Item 1, you can click me!"
      : `Conversation Item ${index + 1}`,
  disabled: index === 3,
  group: index < 3 ? 'Today' : 'Yesterday',
}))

const groupable: ConversationsProps['groupable'] = {
  label: (group, { groupInfo }) => `${group}(${groupInfo.data.length})`,
  collapsible: true,
}
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
配置`collapsible`属性为分组开启可折叠功能。
</docs>

<docs lang="en-US">
Configure the `collapsible` property to enable group collapsibly‌.
</docs>
