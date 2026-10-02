export { default as XMarkdown } from "./XMarkdown/index.vue";

export type { XMarkdownProps } from "./XMarkdown/interface";
export type { StreamingOption, TypewriterOption } from "./XMarkdown/interface";
export type { AnimationConfig, TypewriterConfig } from "./XMarkdown/interface";
export type { StreamCacheTokenType } from "./XMarkdown/interface";
export type { MarkedConfig } from "./XMarkdown/interface";
export type { ComponentProps } from "./XMarkdown/interface";

export { Parser } from "./XMarkdown/core/Parser";
export { VueRenderer } from "./XMarkdown/core/VueRenderer";
export { detectUnclosedComponentTags } from "./XMarkdown/core/detectUnclosedComponentTags";

export {
  useStreaming,
  useStreamingCore,
} from "./XMarkdown/composables/useStreaming";
export { useTypewriter } from "./XMarkdown/composables/useTypewriter";
export { useParser } from "./XMarkdown/composables/useParser";
export { useRenderer } from "./XMarkdown/composables/useRenderer";
export { useTail } from "./XMarkdown/composables/useTail";

export {
  AnimationText,
  DebugPanel,
  TailIndicator,
} from "./XMarkdown/components";

export { resolveStreaming } from "./XMarkdown/utils/streaming";
export { resolveTailContent } from "./XMarkdown/utils/tail";
