<script setup lang="ts">
import { Bubble } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex } from "antdv-next";
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const sourceText = `
## Inline formulas

Pythagorean theorem: $a^2 + b^2 = c^2$, Euler identity: $e^{i\\pi}+1=0$.

## Block formulas

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$

$$
\\frac{dy}{dx} = ky \\Rightarrow y = Ce^{kx}
$$
`;

function transformLatex(markdown: string): string {
  const withBlocks = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
    const encoded = encodeURIComponent((formula as string).trim());
    return `<latex-block description="${encoded}"></latex-block>`;
  });

  return withBlocks.replace(/\$([^$\n]+)\$/g, (_, formula) => {
    const encoded = encodeURIComponent((formula as string).trim());
    return `<latex-inline description="${encoded}"></latex-inline>`;
  });
}

const LatexInline = defineComponent({
  name: "LatexInline",
  props: {
    description: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const formula = computed(() => decodeURIComponent(props.description || ""));
    return () => h("code", { class: "latex-inline" }, formula.value);
  },
});

const LatexBlock = defineComponent({
  name: "LatexBlock",
  props: {
    description: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const formula = computed(() => decodeURIComponent(props.description || ""));

    return () =>
      h("div", { class: "latex-shell" }, [
        h("div", { class: "latex-title" }, "LaTeX Preview"),
        h("pre", { class: "latex-code" }, formula.value),
      ]);
  },
});

const components = {
  "latex-inline": LatexInline,
  "latex-block": LatexBlock,
};

const text = transformLatex(sourceText);

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
      :content-render="renderMarkdown"
      variant="outlined"
    />
  </Flex>
</template>

<style scoped>
.latex-inline {
  display: inline-block;
  margin: 0 2px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--ant-color-fill-tertiary, #f5f5f5);
}

.latex-shell {
  border: 1px dashed var(--ant-color-border, #d9d9d9);
  border-radius: 8px;
  overflow: hidden;
  margin: 8px 0;
}

.latex-title {
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  border-bottom: 1px dashed var(--ant-color-border, #d9d9d9);
}

.latex-code {
  margin: 0;
  padding: 12px;
  overflow: auto;
  white-space: pre-wrap;
}
</style>

<docs lang="zh-CN">
LaTeX 示例：对齐 antdx 的流式重放结构，演示公式语法的扩展渲染方式。
</docs>

<docs lang="en-US">
LaTeX demo aligned with antdx streaming replay structure, showing formula-syntax extension rendering.
</docs>
