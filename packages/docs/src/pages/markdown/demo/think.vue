<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { defineComponent, h } from "vue";

const content = `在回答前先展示思考步骤：\n\n<think title="Reasoning" steps="Search docs -> compare options -> summarize result"></think>`;

const ThinkBlock = defineComponent({
  name: "ThinkBlock",
  props: {
    title: {
      type: String,
      default: "Think",
    },
    steps: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () =>
      h("div", { class: "think-block" }, [
        h("div", { class: "think-title" }, props.title),
        h("div", props.steps),
      ]);
  },
});

const components = {
  think: ThinkBlock,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>

<style scoped>
.think-block {
  border: 1px solid var(--ant-color-border-secondary, #e5e7eb);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--ant-color-fill-tertiary, #f8fafc);
}

.think-title {
  font-weight: 600;
  margin-bottom: 6px;
}
</style>

<docs lang="zh-CN">
Think 组件示例：将推理步骤映射为可读的卡片块。
</docs>

<docs lang="en-US">
Think demo: map reasoning steps to a readable card block.
</docs>
