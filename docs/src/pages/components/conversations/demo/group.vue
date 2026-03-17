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
  group: index < 3 ? 'Today' : 'Yesterday',
}))
</script>

<template>
  <Conversations :items="items" default-active-key="item1" :style="style" groupable />
</template>

<docs lang="zh-CN">
使用 `groupable` 属性开启分组，开启后默认按 [Conversation.group](/components/conversations-cn#conversation) 字段分组
</docs>

<docs lang="en-US">
After using `groupable` properties open group, open the default according to [Conversation.Group](/components/conversations#conversation) field group
</docs>
