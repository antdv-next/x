<script setup lang="ts">
const senderRef = useTemplateRef("senderRef");
</script>

<template>
  <a-flex wrap :gap="12">
    <a-button @click="senderRef?.insert('some text')"> Insert Text </a-button>
    <a-button @click="senderRef?.insert('some text', 'end')">
      Insert Text End
    </a-button>
    <a-button @click="senderRef?.insert('some text', 'start')">
      Insert Text Start
    </a-button>
    <a-button @click="senderRef?.focus({ cursor: 'start' })">
      Focus at first
    </a-button>
    <a-button @click="senderRef?.focus({ cursor: 'end' })">
      Focus at last
    </a-button>
    <a-button @click="senderRef?.focus({ cursor: 'all' })">
      Focus to select all
    </a-button>
    <a-button @click="senderRef?.focus({ preventScroll: true })">
      Focus prevent scroll
    </a-button>
    <a-button @click="senderRef?.blur()"> Blur </a-button>
    <ax-sender
      ref="senderRef"
      default-value="Hello, welcome to use Ant Design X!"
    />
  </a-flex>
</template>

<docs lang="zh-CN">
使用 `ref` 选项控制聚焦、文本插入等。
</docs>

<docs lang="en-US">
Use the `ref` option to control focus, text insertion, and more.
</docs>
