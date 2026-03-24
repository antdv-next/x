<script setup lang="ts">
import type { ComponentProps } from "@antdv-next/x-markdown";

import { Bubble, Think } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex } from "antdv-next";
import {
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  type PropType,
  watch,
} from "vue";

const text = `
<think>Deep thinking is a systematic and structured cognitive approach that requires individuals to move beyond intuition and superficial information, delving into the essence of a problem and its underlying principles through logical analysis, multi-perspective examination, and persistent inquiry. Unlike quick reactions or heuristic judgments, deep thinking emphasizes slow thinking, actively engaging knowledge reserves, critical thinking, and creativity to uncover deeper connections and meanings.
Key characteristics of deep thinking include:
Probing the Essence: Not settling for "what it is," but continuously asking "why" and "how it works" until reaching the fundamental logic.
Multidimensional Connections: Placing the issue in a broader context and analyzing it through interdisciplinary knowledge or diverse perspectives.
Skepticism & Reflection: Challenging existing conclusions, authoritative opinions, and even personal biases, validating them through logic or evidence.
Long-term Value Focus: Prioritizing systemic consequences and sustainable impact over short-term or localized benefits.
This mode of thinking helps individuals avoid cognitive biases in complex scenarios, improve decision-making, and generate groundbreaking insights in fields such as academic research, business innovation, and social problem-solving.</think>
# Hello Deep Thinking\n Deep thinking is over.\n\n You can use the think tag to package your thoughts.
`;

const ThinkComponent = defineComponent({
  name: "ThinkComponent",
  props: {
    streamStatus: {
      type: String as PropType<ComponentProps["streamStatus"]>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const title = ref("Deep thinking...");
    const loading = ref(true);
    const expand = ref(true);

    watch(
      () => props.streamStatus,
      streamStatus => {
        if (streamStatus === "done") {
          title.value = "Complete thinking";
          loading.value = false;
          expand.value = false;
        }
      },
      { immediate: true },
    );

    return () =>
      h(
        Think,
        {
          title: title.value,
          loading: loading.value,
          expanded: expand.value,
          onClick: () => {
            expand.value = !expand.value;
          },
        },
        { default: () => slots.default?.() },
      );
  },
});

const components = {
  think: ThinkComponent,
};

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
    style="height: 420px; overflow: auto"
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

<docs lang="zh-CN">
Think 示例：对齐 antdx，展示流式过程中思考块的展开/收起交互。
</docs>

<docs lang="en-US">
Think demo aligned with antdx: show expandable/collapsible thought blocks during streaming output.
</docs>
