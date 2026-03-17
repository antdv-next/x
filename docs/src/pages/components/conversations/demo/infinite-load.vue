<script setup lang="ts">
import type { ConversationsProps } from '@antdv-next/x'
import { RedoOutlined } from '@antdv-next/icons'
import { Conversations } from '@antdv-next/x'
import { Avatar, Divider, Spin, theme } from 'antdv-next'
import { computed, h, onMounted, ref } from 'vue'

const { token } = theme.useToken()
const loading = ref(false)
const data = ref<ConversationsProps['items']>([])

const style = computed(() => ({
  width: '280px',
  height: '600px',
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
  overflow: 'auto',
}))

const hasMore = computed(() => (data.value?.length ?? 0) < 50)

const loadingIndicator = h(RedoOutlined, { spin: true })

async function loadMoreData() {
  if (loading.value || !hasMore.value)
    return

  loading.value = true

  try {
    const response = await fetch('https://randomuser.me/api/?results=10&inc=name,gender,email,nat,picture&noinfo')
    const body = await response.json()

    const formattedData = (body.results || []).map((item: any) => ({
      key: item.email,
      label: `${item.name.title} ${item.name.first} ${item.name.last}`,
      icon: h(Avatar, { src: item.picture.thumbnail }),
      group: item.nat,
    }))

    data.value = [...(data.value ?? []), ...formattedData]
  }
  finally {
    loading.value = false
  }
}

function onScroll(event: Event) {
  const target = event.target as HTMLElement
  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight

  if (distanceToBottom <= 24)
    loadMoreData()
}

onMounted(() => {
  loadMoreData()
})
</script>

<template>
  <div id="scrollableDiv" :style="style" @scroll="onScroll">
    <Conversations :items="data" default-active-key="demo1" groupable />

    <div v-if="loading" style="text-align: center;">
      <Spin :indicator="loadingIndicator" size="small" />
    </div>

    <Divider v-if="!hasMore" plain>
      It is all, nothing more 🤐
    </Divider>
  </div>
</template>

<docs lang="zh-CN">
</docs>

<docs lang="en-US">
</docs>
