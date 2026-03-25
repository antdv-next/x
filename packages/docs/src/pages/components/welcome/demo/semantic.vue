<script setup lang="ts">
import { EllipsisOutlined, ShareAltOutlined } from "@antdv-next/icons";
import { Welcome } from "@antdv-next/x";
import { Button, Space } from "antdv-next";
import { computed, h } from "vue";

import { SemanticPreview } from "@/components/semantic";
const locales = {
  "zh-CN": {
    root: "根节点",
    icon: "图标容器",
    title: "标题容器",
    description: "描述容器",
    extra: "额外内容",
  },
} as const;

const semantics = computed(() => [
  { name: "root", desc: locales["zh-CN"].root },
  { name: "icon", desc: locales["zh-CN"].icon },
  { name: "title", desc: locales["zh-CN"].title },
  { name: "description", desc: locales["zh-CN"].description },
  { name: "extra", desc: locales["zh-CN"].extra },
]);

const extraNode = h(Space, undefined, () => [
  h(Button, { size: "small", icon: h(ShareAltOutlined) }),
  h(Button, { size: "small", icon: h(EllipsisOutlined) }),
]);
</script>

<template>
  <SemanticPreview component-name="Welcome" :semantics="semantics">
    <template #default="{ classes }">
      <Welcome
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="你好，我是 Ant Design X"
        description="基于蚂蚁设计，AGI产品界面解决方案，打造更美好的智能愿景~"
        :extra="extraNode"
        :classes="classes"
      />
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Welcome 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Welcome.
</docs>
