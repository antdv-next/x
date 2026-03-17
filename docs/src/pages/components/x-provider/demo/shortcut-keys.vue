<docs lang="zh-CN">
通过 `shortcutKeys` 设置快捷键。
</docs>

<docs lang="en-US">
Modify shortcut keys by `shortcutKeys` prop.
</docs>

<script setup lang="ts">
import type { ConversationsProps, XProviderProps } from '@antdv-next/x'
import {
  CodeOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  SignatureOutlined,
} from '@antdv-next/icons'
import { Conversations, XProvider } from '@antdv-next/x'
import { Card, Flex, Tag, Typography } from 'antdv-next'
import { h } from 'vue'

const providerConversationsConfig: XProviderProps['conversations'] = {
  shortcutKeys: {
    items: ['Alt', 'number'],
  },
}

const items: ConversationsProps['items'] = [
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
]
</script>

<template>
  <Flex :gap="12" style="margin-bottom: 16px" align="center">
    <Typography.Text>
      You can switch sessions using the shortcut key:
      <Tag>Alt/⌥</Tag>
      +
      <Tag>number</Tag>
    </Typography.Text>
  </Flex>

  <Card>
    <XProvider :conversations="providerConversationsConfig">
      <Conversations
        :style="{ width: '220px' }"
        default-active-key="write"
        :items="items"
      />
    </XProvider>
  </Card>
</template>
