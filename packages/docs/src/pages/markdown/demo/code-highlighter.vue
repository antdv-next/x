<script setup lang="ts">
import { Bubble, CodeHighlighter } from "@antdv-next/x";
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
Here's a Python code block example that demonstrates how to calculate Fibonacci numbers:

\`\`\`python
def fibonacci(n):
    """
    Calculate the nth Fibonacci number
    :param n: The position in the Fibonacci sequence (must be a positive integer)
    :return: The value at position n
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        a, b = 0, 1
        for _ in range(2, n+1):
            a, b = b, a + b
        return b

if __name__ == "__main__":
    for i in range(1, 11):
        print(fibonacci(i), end=" ")
\`\`\`

This code includes:

1. A function to compute Fibonacci numbers
2. Docstring documentation
3. A small output loop for verification
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

const CodeRenderer = defineComponent({
  name: "CodeRenderer",
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
        theme: isDark.value ? "dark" : "light",
      });
    };
  },
});

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

const components = {
  code: CodeRenderer,
};

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

    <Bubble :content="text.slice(0, index)" variant="outlined">
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
CodeHighlighter 示例：对齐 antdx，流式输出代码并使用组件替换默认代码块渲染。
</docs>

<docs lang="en-US">
CodeHighlighter demo aligned with antdx: stream content and replace default code rendering with the component.
</docs>
