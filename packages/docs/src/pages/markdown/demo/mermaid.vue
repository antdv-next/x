<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { defineComponent, h } from "vue";

const content = `<mermaid chart="graph TD; A[Input] --> B[Parse]; B --> C[Render]"></mermaid>`;

const MermaidBlock = defineComponent({
  name: "MermaidBlock",
  props: {
    chart: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () =>
      h("pre", { class: "mermaid-block" }, `Mermaid:\n${props.chart}`);
  },
});

const components = {
  mermaid: MermaidBlock,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>

<style scoped>
.mermaid-block {
  margin: 0;
  padding: 10px;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  overflow: auto;
}
</style>

<docs lang="zh-CN">
Mermaid 示例：将图表语法映射到自定义展示组件。
</docs>

<docs lang="en-US">
Mermaid demo: map chart syntax to a custom display block.
</docs>
