<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { defineComponent, h } from "vue";

const content = `<code-highlighter lang="ts" code="const answer: number = 42;"></code-highlighter>`;

const CodeHighlighter = defineComponent({
  name: "CodeHighlighterDemo",
  props: {
    lang: {
      type: String,
      default: "text",
    },
    code: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () =>
      h("div", { class: "hl-wrap" }, [
        h("div", { class: "hl-lang" }, props.lang),
        h("pre", { class: "hl-code" }, props.code),
      ]);
  },
});

const components = {
  "code-highlighter": CodeHighlighter,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>

<style scoped>
.hl-wrap {
  border: 1px solid #1f2937;
  border-radius: 8px;
  overflow: hidden;
  width: 320px;
}

.hl-lang {
  background: #111827;
  color: #9ca3af;
  padding: 4px 8px;
  font-size: 12px;
}

.hl-code {
  margin: 0;
  padding: 10px;
  background: #0b1220;
  color: #e5e7eb;
  overflow: auto;
}
</style>

<docs lang="zh-CN">
CodeHighlighter 示例：将富文本代码块映射为自定义高亮展示。
</docs>

<docs lang="en-US">
CodeHighlighter demo: map rich text code blocks to custom rendering.
</docs>
