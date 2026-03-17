<docs lang="zh-CN">
此处列出 Ant Design X 中需要国际化支持的组件，你可以在演示里切换语言。
</docs>

<docs lang="en-US">
Components which need localization support are listed here, you can toggle the language in the demo.
</docs>

<script setup lang="ts">
import type { ActionsProps, ConversationsProps, XProviderProps } from '@antdv-next/x'
import {
  CodeOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  SignatureOutlined,
} from '@antdv-next/icons'
import { Actions, Conversations, XProvider } from '@antdv-next/x'
import { Card, Flex, Radio, Typography } from 'antdv-next'
import enUS from 'antdv-next/dist/locale/en_US'
import zhCN from 'antdv-next/dist/locale/zh_CN'
import { computed, h, ref } from 'vue'

const localeType = ref<'zh' | 'en'>('zh')

const itemsLocale = {
  en: {
    write: 'Help Me Write',
    coding: 'AI Coding',
    createImage: 'Create Image',
    deepSearch: 'Deep Search',
  },
  zh: {
    write: '帮我写作',
    coding: 'AI编码',
    createImage: '图片生成',
    deepSearch: '深度搜索',
  },
}

const locale = computed<XProviderProps['locale']>(() => {
  return localeType.value === 'zh' ? zhCN : enUS
})

const conversationItems = computed<ConversationsProps['items']>(() => {
  const t = itemsLocale[localeType.value]

  return [
    {
      key: 'write',
      label: t.write,
      icon: h(SignatureOutlined),
    },
    {
      key: 'coding',
      label: t.coding,
      icon: h(CodeOutlined),
    },
    {
      key: 'createImage',
      label: t.createImage,
      icon: h(FileImageOutlined),
    },
    {
      key: 'deepSearch',
      label: t.deepSearch,
      icon: h(FileSearchOutlined),
    },
  ]
})

const actionItems: ActionsProps['items'] = [
  {
    key: 'feedback',
    actionRender: () => h(Actions.Feedback),
  },
  {
    key: 'copy',
    label: 'copy',
    actionRender: () => h(Actions.Copy, { text: 'copy value' }),
  },
  {
    key: 'audio',
    label: 'audio',
    actionRender: () => h(Actions.Audio),
  },
]
</script>

<template>
  <Flex :gap="12" style="margin-bottom: 16px" align="center">
    <Typography.Text>Change locale of components:</Typography.Text>
    <Radio.Group v-model:value="localeType">
      <Radio.Button value="en">
        English
      </Radio.Button>
      <Radio.Button value="zh">
        中文
      </Radio.Button>
    </Radio.Group>
  </Flex>

  <XProvider :locale="locale">
    <Flex :gap="12" vertical>
      <Card>
        <Conversations
          :style="{ width: '220px' }"
          default-active-key="write"
          :creation="{ onClick: () => {} }"
          :items="conversationItems"
        />
      </Card>

      <Card>
        <Actions :items="actionItems" />
      </Card>
    </Flex>
  </XProvider>
</template>
