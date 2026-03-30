<script setup lang="ts">
import { Bubble, Mermaid } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex } from "antdv-next";
import {
  computed,
  defineComponent,
  h,
  nextTick,
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
    style A fill:#2ecc71,stroke:#27ae60
    style F fill:#e74c3c,stroke:#c0392b
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

#### 3. Quadrant Chart

\`\`\`mermaid
quadrantChart
    title Reach and engagement of campaigns
    x-axis Low Reach --> High Reach
    y-axis Low Engagement --> High Engagement
    quadrant-1 We should expand
    quadrant-2 Need to promote
    quadrant-3 Re-evaluate
    quadrant-4 May be improved
    Campaign A: [0.3, 0.6]
    Campaign B: [0.45, 0.23]
    Campaign C: [0.57, 0.69]
    Campaign D: [0.78, 0.34]
    Campaign E: [0.40, 0.34]
    Campaign F: [0.35, 0.78]
\`\`\`
`;

const { isDark } = useDarkMode();

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

const CodeRenderer = defineComponent({
  name: "MarkdownMermaidCodeRenderer",
  setup(_, { attrs, slots }) {
    const lang = computed(() => {
      const className = typeof attrs.class === "string" ? attrs.class : "";
      return className.match(/language-(\w+)/)?.[1] || "";
    });

    return () => {
      const code = extractText(slots.default?.() ?? []);

      if (lang.value === "mermaid") {
        return h(Mermaid, {
          content: code,
          codeHighlighterProps: {
            theme: isDark.value ? "dark" : "light",
          },
        });
      }

      return h("code", code);
    };
  },
});

const components = {
  code: CodeRenderer,
};
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

function resolveScrollContainer(): HTMLElement | null {
  const node = contentRef.value as
    | HTMLElement
    | { $el?: Element | null }
    | null;

  if (!node) return null;
  if (node instanceof HTMLElement) return node;
  if (node.$el instanceof HTMLElement) return node.$el;
  return null;
}

watch(
  index,
  async () => {
    if (index.value <= 0 || index.value >= text.length) {
      return;
    }

    await nextTick();
    const container = resolveScrollContainer();
    if (!container) {
      return;
    }

    const { scrollHeight, clientHeight } = container;
    if (scrollHeight > clientHeight) {
      container.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
    }
  },
  { flush: "post" },
);

onBeforeUnmount(clearTimer);

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
      variant="outlined"
    >
      <template #contentRender="{ content }">
        <XMarkdown
          :content="content"
          :components="components"
          paragraph-tag="div"
        />
      </template>
    </Bubble>
  </Flex>
</template>

<docs lang="zh-CN">
Mermaid 示例：严格对齐官方 demo，使用 `components.code` 按语言接管代码块并渲染 `Mermaid`。
</docs>

<docs lang="en-US">
Mermaid demo aligned with the upstream example: override `components.code` by language and render `Mermaid`.
</docs>
