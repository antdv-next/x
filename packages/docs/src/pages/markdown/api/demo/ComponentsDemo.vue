<script setup lang="ts">
import { Bubble, CodeHighlighter } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex } from "antdv-next";
import { computed, defineComponent, h, ref, type VNode } from "vue";

function extractText(nodes: VNode[]): string {
  return nodes
    .map(node => {
      const children = node.children;
      if (typeof children === "string") return children;
      if (Array.isArray(children)) return extractText(children as VNode[]);
      return "";
    })
    .join("");
}

const codeRenderer = defineComponent({
  name: "ApiCodeRenderer",
  setup(_, { attrs, slots }) {
    const lang = computed(() => {
      const dataLang =
        typeof attrs["data-lang"] === "string" ? attrs["data-lang"] : "";
      const dataLangCamel =
        typeof attrs.dataLang === "string" ? attrs.dataLang : "";
      const langAttr = typeof attrs.lang === "string" ? attrs.lang : "";
      const className = typeof attrs.class === "string" ? attrs.class : "";
      const classLang = className.match(/(?:^|\s)language-([^\s]+)/)?.[1] ?? "";
      return dataLang || dataLangCamel || langAttr || classLang;
    });

    const isBlock = computed(() => {
      const dataBlock = attrs["data-block"];
      const dataBlockCamel = attrs.dataBlock;
      const block = attrs.block;

      return (
        dataBlock === "true" ||
        dataBlock === true ||
        dataBlockCamel === "true" ||
        dataBlockCamel === true ||
        block === "true" ||
        block === true
      );
    });

    return () => {
      const code = extractText(slots.default?.() ?? []);
      if (!isBlock.value && !lang.value) {
        return h("code", code);
      }
      return h(CodeHighlighter, {
        content: code,
        language: lang.value || "text",
      });
    };
  },
});

const components = { code: codeRenderer };

const source = `\`\`\`ts
const message = "hello from XMarkdown";
console.log(message);
\`\`\``;

const index = ref(source.length);
const rerender = () => {
  index.value = 0;
  requestAnimationFrame(() => {
    index.value = source.length;
  });
};
const content = computed(() => source.slice(0, index.value));

const renderMarkdown = (value: string) =>
  h(XMarkdown, {
    content: value,
    components,
    paragraphTag: "div",
  });
</script>

<template>
  <Flex vertical :gap="8">
    <Flex justify="flex-end">
      <Button size="small" @click="rerender">Re-Render</Button>
    </Flex>
    <Bubble
      :content="content"
      :content-render="renderMarkdown"
      variant="outlined"
    />
  </Flex>
</template>

<docs lang="zh-CN">
组件扩展：使用 `components.code` 将 Markdown 代码块映射到 `@antdv-next/x` 的 `CodeHighlighter`，并通过 `Bubble` 承载渲染。
</docs>

<docs lang="en-US">
Component extension: map Markdown code blocks to `@antdv-next/x` `CodeHighlighter` via `components.code`, rendered inside `Bubble`.
</docs>
