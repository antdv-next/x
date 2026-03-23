<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { defineComponent, h } from "vue";

const content = `回答引用来源：\n\n<sources title="AntDV Next X" url="https://github.com/antdv-next/antdv-next-x"></sources>\n\n<sources title="Marked" url="https://github.com/markedjs/marked"></sources>`;

const SourcesBlock = defineComponent({
  name: "SourcesBlock",
  props: {
    title: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () =>
      h("a", { class: "source-item", href: props.url, target: "_blank" }, [
        h("strong", props.title),
        h("span", props.url),
      ]);
  },
});

const components = {
  sources: SourcesBlock,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>

<style scoped>
.source-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 6px 0;
  padding: 8px 10px;
  border: 1px dashed var(--ant-color-border, #d9d9d9);
  border-radius: 6px;
  text-decoration: none;
}

.source-item span {
  font-size: 12px;
  color: var(--ant-color-text-tertiary, #6b7280);
}
</style>

<docs lang="zh-CN">
Sources 组件示例：将引用来源映射为可点击链接块。
</docs>

<docs lang="en-US">
Sources demo: map references into clickable link blocks.
</docs>
