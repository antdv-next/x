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
Here are several Mermaid diagram examples.

#### 1. Flowchart (Vertical)

\`\`\`mermaid
graph TD
    A[Start] --> B{Data Valid?}
    B -->|Yes| C[Process Data]
    B -->|No| D[Error Handling]
    C --> E[Generate Report]
    D --> E
    E --> F[End]
\`\`\`

#### 2. Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Database
    Client->>Server: POST /api/data
    Server->>Database: INSERT record
    Database-->>Server: Success
    Server-->>Client: 201 Created
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

const MermaidRenderer = defineComponent({
  name: "MermaidRenderer",
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
      if (lang.value !== "mermaid") {
        return h("code", code.value);
      }

      return h("div", { class: "mermaid-shell" }, [
        h("div", { class: "mermaid-title" }, "Mermaid Preview"),
        h("pre", { class: "mermaid-code" }, code.value),
      ]);
    };
  },
});

const components = {
  code: MermaidRenderer,
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
    style="height: 600px; overflow: auto"
    :class="markdownClass"
    ref="contentRef"
  >
    <Flex justify="flex-end">
      <Button @click="rerender">Re-Render</Button>
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
.mermaid-shell {
  border: 1px solid var(--ant-color-border, #d9d9d9);
  border-radius: 8px;
  overflow: hidden;
  background: var(--ant-color-fill-tertiary, #fafafa);
}

.mermaid-title {
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  border-bottom: 1px solid var(--ant-color-border, #d9d9d9);
}

.mermaid-code {
  margin: 0;
  padding: 12px;
  overflow: auto;
  white-space: pre;
}
</style>

<docs lang="zh-CN">
Mermaid 示例：对齐 antdx 结构，演示流式内容中按语言接管代码块渲染。
</docs>

<docs lang="en-US">
Mermaid demo aligned with antdx structure: override code-block rendering by language during streaming output.
</docs>
