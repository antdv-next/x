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
<think>Deep thinking is a systematic and structured cognitive approach that requires individuals to move beyond intuition and superficial information, delving into the essence of a problem and its underlying principles through logical analysis, multi-perspective examination, and persistent inquiry. Unlike quick reactions or heuristic judgments, deep thinking emphasizes slow thinking, actively engaging knowledge reserves, critical thinking, and creativity to uncover deeper connections and meanings.

Key characteristics of deep thinking include:
- Probing the essence: ask why and how repeatedly.
- Multidimensional connections: analyze from interdisciplinary viewpoints.
- Skepticism and reflection: challenge assumptions with evidence.
- Long-term value focus: prefer sustainable impact.
</think>

# Hello Deep Thinking

Deep thinking is over.

You can use the think tag to package your thoughts.
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

const ThinkComponent = defineComponent({
  name: "ThinkComponent",
  props: {
    streamStatus: {
      type: String,
      default: "done",
    },
  },
  setup(props, { slots }) {
    const expanded = ref(true);

    const title = computed(() =>
      props.streamStatus === "done" ? "Complete thinking" : "Deep thinking...",
    );

    const loading = computed(() => props.streamStatus !== "done");
    const content = computed(() => extractText(slots.default?.() ?? []));

    watch(
      () => props.streamStatus,
      status => {
        if (status === "done") {
          expanded.value = false;
        }
      },
      { immediate: true },
    );

    const toggle = () => {
      expanded.value = !expanded.value;
    };

    return () =>
      h("div", { class: "think-shell" }, [
        h(
          "button",
          {
            type: "button",
            class: "think-header",
            onClick: toggle,
          },
          `${title.value}${loading.value ? " (streaming...)" : ""}`,
        ),
        expanded.value
          ? h("div", { class: "think-body" }, content.value)
          : null,
      ]);
  },
});

const components = {
  think: ThinkComponent,
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
    style="height: 460px; overflow: auto"
    :class="markdownClass"
    ref="contentRef"
  >
    <Flex justify="flex-end">
      <Button @click="rerender">Re-Render</Button>
    </Flex>

    <Bubble
      :content="text.slice(0, index)"
      :content-render="renderMarkdown"
      variant="outlined"
    />
  </Flex>
</template>

<style scoped>
.think-shell {
  border: 1px solid var(--ant-color-border, #d9d9d9);
  border-radius: 8px;
  background: var(--ant-color-fill-tertiary, #fafafa);
  overflow: hidden;
}

.think-header {
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 10px 12px;
  font-weight: 600;
}

.think-body {
  padding: 0 12px 12px;
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>

<docs lang="zh-CN">
Think 示例：对齐 antdx，展示流式过程中思考块的展开/收起交互。
</docs>

<docs lang="en-US">
Think demo aligned with antdx: show expandable/collapsible thought blocks during streaming output.
</docs>
