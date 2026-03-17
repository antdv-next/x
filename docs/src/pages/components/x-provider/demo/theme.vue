<docs lang="zh-CN">
通过 `theme` 修改主题。
</docs>

<docs lang="en-US">
Modify theme by `theme` prop.
</docs>

<script setup lang="ts">
import type { ActionsProps, ConversationsProps, XProviderProps } from '@antdv-next/x'
import { CommentOutlined, FireOutlined, ReadOutlined } from '@antdv-next/icons'
import { Actions, Conversations, XProvider } from '@antdv-next/x'
import { Card, ColorPicker, Flex, Space, Typography } from 'antdv-next'
import { computed, h, ref } from 'vue'

const colorPrimary = ref('#d10eef')

const theme = computed<XProviderProps['theme']>(() => {
  return {
    token: {
      colorPrimary: colorPrimary.value,
    },
  }
})

const conversationItems: ConversationsProps['items'] = [
  {
    key: '1',
    label: 'Conversation - 1',
    icon: h(FireOutlined, { style: { color: '#FF4D4F' } }),
  },
  {
    key: '2',
    label: 'Conversation - 2',
    icon: h(ReadOutlined, { style: { color: '#1890FF' } }),
  },
]

const actionItems: ActionsProps['items'] = [
  {
    key: 'feedback',
    actionRender: () => h(Actions.Feedback),
  },
  {
    key: 'copy',
    label: 'copy',
    actionRender: () => h(Actions.Copy, { text: 'Theme token demo' }),
  },
  {
    key: 'audio',
    label: 'audio',
    actionRender: () => h(Actions.Audio),
  },
]

function onColorChange(value: { toHexString?: () => string } | string) {
  if (typeof value === 'string') {
    colorPrimary.value = value
    return
  }

  const nextColor = value.toHexString?.()
  if (nextColor)
    colorPrimary.value = nextColor
}

function renderTitle() {
  return h(
    Space,
    { align: 'center' },
    {
      default: () => [h(CommentOutlined), h('span', 'Themed Actions')],
    },
  )
}
</script>

<template>
  <Flex :gap="12" style="margin-bottom: 16px" align="center">
    <Typography.Text>ColorPrimary:</Typography.Text>
    <ColorPicker :value="colorPrimary" @change="onColorChange" />
  </Flex>

  <Card>
    <XProvider :theme="theme">
      <Flex :gap="12" vertical>
        <Conversations
          :style="{ width: '220px' }"
          :creation="{ onClick: () => {} }"
          default-active-key="1"
          :items="conversationItems"
        />

        <Card size="small" :title="renderTitle()">
          <Actions :items="actionItems" variant="filled" />
        </Card>
      </Flex>
    </XProvider>
  </Card>
</template>
