<script setup lang="ts">
import { ref, computed, watch, shallowRef } from "vue";

import type { XMarkdownProps } from "./interface";

import DebugPanel from "./components/DebugPanel.vue";
import TailIndicator from "./components/TailIndicator.vue";
import { useStreaming } from "./composables/useStreaming";
import { useTail } from "./composables/useTail";
import { Parser } from "./core/Parser";
import { VueRenderer } from "./core/VueRenderer";

const props = withDefaults(defineProps<XMarkdownProps>(), {
  content: "",
  components: () => ({}),
  streaming: undefined,
  config: () => ({}),
  debug: false,
  protectCustomTagNewlines: true,
  escapeRawHtml: false,
  openLinksInNewTab: true,
  paragraphTag: "p",
});

const contentRef = computed(() => props.content || "");
const streamingRef = computed(() => props.streaming);

const { processedContent } = useStreaming(contentRef, streamingRef);
const { tailContent, showTail } = useTail(streamingRef);

const parser = shallowRef(
  new Parser({
    openLinksInNewTab: props.openLinksInNewTab,
    paragraphTag: props.paragraphTag,
    protectCustomTags: props.protectCustomTagNewlines,
    escapeRawHtml: props.escapeRawHtml,
  }),
);

const renderer = shallowRef(
  new VueRenderer({
    components: {
      ...props.components,
      "xmd-tail": TailIndicator,
    },
    enableAnimation: props.streaming?.enableAnimation ?? true,
    animationConfig: props.streaming?.animationConfig,
  }),
);

const htmlOutput = computed(() => {
  return parser.value.parse(processedContent.value);
});

const vNode = computed(() => {
  return renderer.value.render(htmlOutput.value);
});

watch(
  () => [
    props.openLinksInNewTab,
    props.paragraphTag,
    props.protectCustomTagNewlines,
    props.escapeRawHtml,
  ],
  () => {
    parser.value.setOptions({
      openLinksInNewTab: props.openLinksInNewTab,
      paragraphTag: props.paragraphTag,
      protectCustomTags: props.protectCustomTagNewlines,
      escapeRawHtml: props.escapeRawHtml,
    });
  },
);

watch(
  () => props.components,
  newComponents => {
    renderer.value.setOptions({
      components: {
        ...newComponents,
        "xmd-tail": TailIndicator,
      },
    });
  },
  { deep: true },
);

watch(
  () => props.streaming,
  newStreaming => {
    renderer.value.setOptions({
      enableAnimation: newStreaming?.enableAnimation ?? true,
      animationConfig: newStreaming?.animationConfig,
    });
  },
  { deep: true },
);
</script>

<template>
  <div :class="['x-markdown', className]" :style="style">
    <component :is="vNode" />
    <DebugPanel v-if="debug" />
  </div>
</template>

<style scoped>
.x-markdown {
  line-height: 1.6;
  word-wrap: break-word;
}

.x-markdown :deep(a) {
  color: #1890ff;
  text-decoration: none;
}

.x-markdown :deep(a:hover) {
  text-decoration: underline;
}

.x-markdown :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.x-markdown :deep(pre) {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.x-markdown :deep(pre code) {
  background: none;
  padding: 0;
}

.x-markdown :deep(blockquote) {
  border-left: 4px solid #d9d9d9;
  padding-left: 16px;
  margin-left: 0;
  color: #666;
}

.x-markdown :deep(ul),
.x-markdown :deep(ol) {
  padding-left: 24px;
}

.x-markdown :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.x-markdown :deep(th),
.x-markdown :deep(td) {
  border: 1px solid #d9d9d9;
  padding: 8px 16px;
  text-align: left;
}

.x-markdown :deep(th) {
  background: #fafafa;
}
</style>
