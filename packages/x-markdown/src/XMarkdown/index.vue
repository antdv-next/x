<script setup lang="ts">
import type { Component, PropType, VNode } from "vue";

import { computed, defineComponent, h, ref, shallowRef, watch } from "vue";

import type { XMarkdownProps } from "./interface";

import DebugPanel from "./components/DebugPanel.vue";
import Section from "./components/Section.vue";
import TailIndicator from "./components/TailIndicator.vue";
import { useStreamingCore } from "./composables/useStreaming";
import { useTail } from "./composables/useTail";
import { useTypewriter } from "./composables/useTypewriter";
import { Parser } from "./core/Parser";
import { VueRenderer } from "./core/VueRenderer";
import { resolveStreaming } from "./utils/streaming";

const props = withDefaults(defineProps<XMarkdownProps>(), {
  content: "",
  components: () => ({}),
  streaming: undefined,
  config: () => ({ gfm: true }),
  debug: false,
  protectCustomTagNewlines: true,
  escapeRawHtml: false,
  openLinksInNewTab: true,
  paragraphTag: "p",
});

// `streaming={true|false}` expands to a frozen preset object, so everything
// downstream keyed on the resolved option keeps a stable identity.
const streamingResolved = computed(() => resolveStreaming(props.streaming));

const contentRef = computed(() => props.content || "");
const componentsRef = computed(() => props.components);

// The typewriter runs first so that what reaches the streaming cache is
// always a prefix of the previous value.
const typewriterRef = computed(() => streamingResolved.value?.typewriter);
const hasNextChunkRef = computed(() => !!streamingResolved.value?.hasNextChunk);
const pacedContent = useTypewriter(contentRef, typewriterRef, hasNextChunkRef);

// An empty output renders nothing at all (no root wrapper, no debug panel),
// matching upstream's early `if (!output) return null`; the template guards
// the wrapper with `v-if="processedContent"`.
const { output: processedContent, sections } = useStreamingCore(
  pacedContent,
  streamingResolved,
  componentsRef,
);
const { tailContent, tailComponent, showTail } = useTail(streamingResolved);

// One stable bridge component: its render reads the current tail config, so
// the `xmd-tail` node is patched in place when the tail content or component
// changes. Creating the bridge inside the `mergedComponents` computed would
// produce a fresh component type per recompute — and Vue remounts on type
// identity change — remounting the tail on every chunk for callers with an
// inline `:components` literal.
const TailBridge = defineComponent({
  name: "XmdTailBridge",
  setup() {
    return () =>
      h(tailComponent.value || TailIndicator, { content: tailContent.value });
  },
});

const mergedComponents = computed<Record<string, Component>>(() => {
  const baseComponents = { ...props.components };

  if (!showTail.value || !tailContent.value) {
    return baseComponents;
  }

  return {
    ...baseComponents,
    "xmd-tail": TailBridge,
  };
});

const VNodeRenderer = defineComponent({
  name: "XmdVNodeRenderer",
  props: {
    node: {
      type: Object as PropType<VNode>,
      required: true,
    },
  },
  setup(props) {
    return () => props.node;
  },
});

const parser = shallowRef(
  new Parser({
    openLinksInNewTab: props.openLinksInNewTab,
    paragraphTag: props.paragraphTag,
    protectCustomTags: props.protectCustomTagNewlines,
    escapeRawHtml: props.escapeRawHtml,
    config: props.config,
    components: props.components,
  }),
);

const renderer = shallowRef(
  new VueRenderer({
    components: mergedComponents.value,
    componentsProps: props.componentsProps,
    enableAnimation: streamingResolved.value?.enableAnimation ?? true,
    animationConfig: streamingResolved.value?.animationConfig,
  }),
);

const optionsVersion = ref(0);

const bumpOptionsVersion = () => {
  optionsVersion.value += 1;
};

const htmlOutput = computed(() => {
  void optionsVersion.value;
  // Sections are parsed one by one inside the Section components; the
  // whole-document parse is skipped while they are active.
  if (sections.value) {
    return "";
  }
  return parser.value.parse(processedContent.value, {
    injectTail: showTail.value,
  });
});

const vNode = computed(() => {
  void optionsVersion.value;
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
    bumpOptionsVersion();
  },
);

watch(
  () => props.config,
  newConfig => {
    parser.value.setOptions({
      config: newConfig,
    });
    bumpOptionsVersion();
  },
  { deep: true },
);

watch(
  () => props.components,
  newComponents => {
    parser.value.setOptions({
      components: newComponents,
    });
    bumpOptionsVersion();
  },
  { deep: true },
);

watch(
  mergedComponents,
  newComponents => {
    renderer.value.setOptions({
      components: newComponents,
    });
    bumpOptionsVersion();
  },
  { deep: true },
);

watch(
  () => props.componentsProps,
  newComponentsProps => {
    renderer.value.setOptions({
      componentsProps: newComponentsProps,
    });
    bumpOptionsVersion();
  },
  { deep: true },
);

// The renderer only reads enableAnimation and the animationConfig fields from
// `streaming`, so watch those scalars rather than the objects: an inline
// `:streaming="{ hasNextChunk, animationConfig: { ... } }"` literal (the
// documented usage) must not rebuild the renderer options — and with it every
// memoised section — per parent render. Watching the fields also picks up
// in-place mutation of a reactive animationConfig.
watch(
  [
    () => streamingResolved.value?.enableAnimation,
    () => streamingResolved.value?.animationConfig?.fadeDuration,
    () => streamingResolved.value?.animationConfig?.easing,
    () => streamingResolved.value?.animationConfig?.splitBy,
    () => streamingResolved.value?.animationConfig?.delimiters?.join("\u0000"),
    () => streamingResolved.value?.animationConfig?.maxSentenceChars,
  ],
  () => {
    const animationConfig = streamingResolved.value?.animationConfig;
    renderer.value.setOptions({
      enableAnimation: streamingResolved.value?.enableAnimation ?? true,
      animationConfig: animationConfig ? { ...animationConfig } : undefined,
    });
    bumpOptionsVersion();
  },
);
</script>

<template>
  <div
    v-if="processedContent"
    :class="['x-markdown', className]"
    :style="style"
  >
    <template v-if="sections">
      <Section
        v-for="(section, index) in sections"
        :key="index"
        :content="section"
        :parser="parser"
        :renderer="renderer"
        :inject-tail="!!showTail && index === sections.length - 1"
        :options-version="optionsVersion"
      />
    </template>
    <VNodeRenderer v-else :node="vNode" />
    <DebugPanel v-if="debug" />
  </div>
</template>
