<script setup lang="ts">
import { Bubble } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex } from "antdv-next";
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  watch,
  type VNode,
} from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const text = `
**Infographic** can turn structured YAML-like specs into rich charts.

\`\`\`infographic
infographic sequence-pyramid-simple
data
  title Enterprise Digital Transformation
  desc A five-layer path from infrastructure to strategic innovation
  items
    - label Strategic Innovation
      desc Data-driven decision making
    - label Intelligent Operations
      desc AI-powered automation
    - label Data Integration
      desc Build a unified data platform
themeConfig
  palette antv
\`\`\`
`;

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

const InfographicRenderer = defineComponent({
  name: "InfographicRenderer",
  setup(_, { attrs, slots }) {
    const code = computed(() => extractText(slots.default?.() ?? []));

    const lang = computed(() => {
      const dataLang =
        typeof attrs["data-lang"] === "string" ? attrs["data-lang"] : "";
      const className = typeof attrs.class === "string" ? attrs.class : "";
      const classLang = className.match(/(?:^|\s)language-([^\s]+)/)?.[1] ?? "";
      return dataLang || classLang;
    });

    return () => {
      if (lang.value !== "infographic") {
        return h("code", code.value);
      }

      return h("div", { class: "infographic-shell" }, [
        h("div", { class: "infographic-title" }, "Infographic Spec Preview"),
        h("pre", { class: "infographic-code" }, code.value),
      ]);
    };
  },
});

const components = {
  code: InfographicRenderer,
};

const { isDark } = useDarkMode();
const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const index = ref(0);
const contentRef = ref<HTMLElement | null>(null);
let timerRef: ReturnType<typeof setTimeout> | null = null;

const clearTimer = () => {
  if (timerRef !== null) {
    clearTimeout(timerRef);
    timerRef = null;
  }
};

watch(
  index,
  () => {
    clearTimer();

    if (index.value >= text.length) {
      return;
    }

    timerRef = setTimeout(() => {
      index.value = Math.min(index.value + 5, text.length);
    }, 20);
  },
  { immediate: true },
);

watch(index, () => {
  if (!contentRef.value || index.value <= 0 || index.value >= text.length) {
    return;
  }

  const { scrollHeight, clientHeight } = contentRef.value;
  if (scrollHeight > clientHeight) {
    contentRef.value.scrollTo({
      top: scrollHeight,
      behavior: "smooth",
    });
  }
});

onBeforeUnmount(clearTimer);

const renderMarkdown = (content: string) =>
  h(XMarkdown, {
    content,
    components,
    paragraphTag: "div",
  });

const rerender = () => {
  clearTimer();
  index.value = 0;
};
</script>

<template>
  <Flex
    vertical
    :gap="8"
    style="height: 680px; overflow: auto"
    :class="markdownClass"
    ref="contentRef"
  >
    <Flex justify="flex-end">
      <Button type="primary" @click="rerender">Re-Render</Button>
    </Flex>

    <Bubble
      :content="text.slice(0, index)"
      :styles="{ content: { width: '700px' } }"
      :content-render="renderMarkdown"
      variant="outlined"
    />
  </Flex>
</template>

<style scoped>
.infographic-shell {
  border: 1px solid var(--ant-color-border, #d9d9d9);
  border-radius: 8px;
  overflow: hidden;
  background: var(--ant-color-fill-tertiary, #fafafa);
}

.infographic-title {
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  border-bottom: 1px solid var(--ant-color-border, #d9d9d9);
}

.infographic-code {
  margin: 0;
  padding: 12px;
  overflow: auto;
  white-space: pre;
  max-height: 420px;
}
</style>

<docs lang="zh-CN">
Infographic 示例：对齐 antdx 的代码块接管结构，展示结构化图形 DSL 的渲染入口。
</docs>

<docs lang="en-US">
Infographic demo aligned with antdx code-block override pattern, showing the rendering entry for structured chart DSL.
</docs>
