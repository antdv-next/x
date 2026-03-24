<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { Popover } from "antdv-next";
import { computed, defineComponent, h, type VNode } from "vue";

const referenceList = [
  { url: "https://x.antdv-next.com/markdown", title: "x-markdown docs" },
  { url: "https://x.antdv-next.com/components", title: "x components" },
  { url: "https://x.antdv-next.com", title: "antdv-next-x" },
];

const source = `
# Custom Footnote Plugin

Ant Design X provides extensible Markdown rendering[^1], so you can add plugins and map them to business components[^2].

- Parse custom syntax
- Render business UI
- Keep streaming-friendly behavior

See docs for more details[^3].

[^1]: x-markdown supports custom tokenizer and renderer.
[^2]: Use components to map tags to Vue components.
[^3]: Links in this demo are for footnote interaction only.
`;

const content = computed(() => {
  const withoutDefinitions = source.replace(/^\[\^\d+\]:.*$/gm, "").trim();

  return withoutDefinitions.replace(/\[\^(\d+)\]/g, (_, index) => {
    const order = Number(index) - 1;
    const item = referenceList[order];
    if (!item) return "";

    return `<footnote href="${item.url}" title="${item.title}">${index}</footnote>`;
  });
});

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

const Footnote = defineComponent({
  name: "Footnote",
  props: {
    href: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "Footnote",
    },
  },
  setup(props, { slots }) {
    const index = computed(() => extractText(slots.default?.() ?? []));

    const onClick = () => {
      if (props.href) {
        window.open(props.href, "_blank", "noopener,noreferrer");
      }
    };

    return () =>
      h(
        Popover,
        { title: "Footnote", content: props.title, trigger: "hover" },
        {
          default: () =>
            h(
              "sup",
              {
                class: "markdown-cite",
                onClick,
              },
              index.value,
            ),
        },
      );
  },
});

const components = {
  footnote: Footnote,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>

<style scoped>
.markdown-cite {
  cursor: pointer;
  color: var(--ant-color-primary, #1677ff);
  margin-left: 2px;
  font-size: 12px;
}
</style>

<docs lang="zh-CN">
自定义插件示例：对齐 antdx 的脚注扩展思路，将语法标记映射为交互组件。
</docs>

<docs lang="en-US">
Custom plugin demo aligned with antdx footnote extension idea: map syntax markers to interactive components.
</docs>
