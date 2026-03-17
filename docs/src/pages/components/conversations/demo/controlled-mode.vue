<script setup lang="ts">
import type { ConversationsProps } from '@antdv-next/x'
import {
  CodeOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  SignatureOutlined,
} from '@antdv-next/icons'
import { Conversations } from '@antdv-next/x'
import { Button, Flex, theme } from 'antdv-next'
import { computed, h, ref } from 'vue'

const activeKey = ref<string | number>('write')
const { token } = theme.useToken()

const style = computed(() => ({
  width: '256px',
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}))

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
  <Flex vertical gap="small" align="flex-start">
    <Conversations
      :active-key="activeKey"
      :shortcut-keys="{ items: ['Alt', 'number'] }"
      :on-active-change="(value) => { activeKey = value }"
      :items="items"
      :style="style"
    />

    <Flex gap="small">
      <Button @click="activeKey = 'write'">
        Active First
      </Button>
      <Button @click="activeKey = 'deepSearch'">
        Active Last
      </Button>
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
使用 `activeKey`、`onChange` 属性，控制当前选中的会话。
</docs>

<docs lang="en-US">
Use the `activeKey` and `onChange` property to configure conversation.
</docs>
