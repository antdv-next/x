<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { defineComponent, h } from "vue";

const content = `<latex formula="\\int_0^1 x^2 dx = 1/3"></latex>`;

const LatexBlock = defineComponent({
  name: "LatexBlock",
  props: {
    formula: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () =>
      h("div", { class: "latex-box" }, [
        h("div", { class: "latex-label" }, "LaTeX"),
        h("code", props.formula),
      ]);
  },
});

const components = {
  latex: LatexBlock,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>

<style scoped>
.latex-box {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  border: 1px dashed var(--ant-color-border, #d9d9d9);
  border-radius: 8px;
  padding: 10px;
}

.latex-label {
  font-size: 12px;
  color: var(--ant-color-text-secondary, #6b7280);
}
</style>

<docs lang="zh-CN">
LaTeX 示例：在 Markdown 中扩展公式渲染能力。
</docs>

<docs lang="en-US">
LaTeX demo: extend markdown rendering with formula blocks.
</docs>
