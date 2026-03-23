<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { computed, defineComponent, h, ref } from "vue";

const raw = ref(`:::note\nPlugin extension can preprocess markdown.\n:::`);

const transformed = computed(() =>
  raw.value.replace(/:::note\n([\s\S]*?)\n:::/g, '<x-note text="$1"></x-note>'),
);

const NoteBlock = defineComponent({
  name: "NoteBlock",
  props: {
    text: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () => h("blockquote", { class: "note" }, props.text);
  },
});

const components = {
  "x-note": NoteBlock,
};
</script>

<template>
  <XMarkdown :content="transformed" :components="components" />
</template>

<style scoped>
.note {
  margin: 0;
  padding: 8px 12px;
  border-left: 4px solid var(--ant-color-primary, #1677ff);
  background: var(--ant-color-fill-tertiary, #f5f8ff);
}
</style>

<docs lang="zh-CN">
自定义插件示例：预处理语法并交给组件渲染。
</docs>

<docs lang="en-US">
Custom plugin demo: preprocess syntax before component rendering.
</docs>
