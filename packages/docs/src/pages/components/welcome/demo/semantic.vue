<script setup lang="ts">
import { EllipsisOutlined, ShareAltOutlined } from "@antdv-next/icons";
import { computed } from "vue";

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
</script>

<template>
  <SemanticPreview component-name="Welcome" :semantics="semantics">
    <template #default="{ classes }">
      <ax-welcome
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="你好，我是 Antdv Next X"
        description="基于 Antdv Next 的 AGI 产品界面解决方案，打造更美好的智能愿景~"
        :classes="classes"
      >
        <template #extra>
          <a-space>
            <a-button size="small">
              <template #icon>
                <ShareAltOutlined />
              </template>
            </a-button>
            <a-button size="small">
              <template #icon>
                <EllipsisOutlined />
              </template>
            </a-button>
          </a-space>
        </template>
      </ax-welcome>
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Welcome 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Welcome.
</docs>
