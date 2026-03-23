<script setup lang="ts">
import { CodeOutlined, FileOutlined, SearchOutlined } from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { Space } from "antdv-next";
import { h } from "vue";
</script>

<template>
  <Space direction="vertical">
    <Space>
      <ThoughtChain.Item
        variant="solid"
        :icon="h(CodeOutlined)"
        title="生成代码"
        description="index.ts"
      />
      <ThoughtChain.Item
        variant="outlined"
        :icon="h(FileOutlined)"
        title="创建文件"
        status="success"
      />
      <ThoughtChain.Item
        variant="text"
        :icon="h(SearchOutlined)"
        title="搜索"
      />
    </Space>
    <Space>
      <ThoughtChain.Item variant="solid" title="错误状态" status="error" />
      <ThoughtChain.Item variant="solid" title="禁用状态" disabled />
      <ThoughtChain.Item variant="solid" title="可点击" :on-click="() => {}" />
    </Space>
  </Space>
</template>

<docs lang="zh-CN">
ThoughtChain.Item 子组件的三种变体与状态。
</docs>

<docs lang="en-US">
ThoughtChain.Item sub-component variants and states.
</docs>
