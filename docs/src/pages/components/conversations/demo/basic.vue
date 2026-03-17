<script setup lang="ts">
import type { ConversationsProps } from '@antdv-next/x'
import {
  CodeOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  SignatureOutlined,
} from '@antdv-next/icons'
import { Conversations } from '@antdv-next/x'
import { Flex, Switch, theme } from 'antdv-next'
import { computed, h, ref } from 'vue'

const { token } = theme.useToken()
const deepSearchChecked = ref(false)

const style = computed(() => ({
  width: '256px',
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}))

const items = computed<ConversationsProps['items']>(() => [
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
    disabled: !deepSearchChecked.value,
    label: h(Flex, { gap: 'small', align: 'center' }, {
      default: () => [
        'Deep Search',
        h(Switch, {
          size: 'small',
          checked: deepSearchChecked.value,
          onClick: (e: Event) => e.stopPropagation(),
          onChange: (value: boolean) => {
            deepSearchChecked.value = value
          },
        }),
      ],
    }),
    icon: h(FileSearchOutlined),
  },
])
</script>

<template>
  <Conversations :items="items" default-active-key="write" :style="style" />
</template>

<docs lang="zh-CN">
基础用法。
</docs>

<docs lang="en-US">
Basic usage.
</docs>
