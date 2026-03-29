import "./XMarkdown/index.css";

export { default as XMarkdown } from "./XMarkdown/index.vue";

export type { XMarkdownProps } from "./XMarkdown/interface";
export type { StreamingOption } from "./XMarkdown/interface";
export type { MarkedConfig } from "./XMarkdown/interface";
export type { ComponentProps } from "./XMarkdown/interface";

export { Parser } from "./XMarkdown/core/Parser";
export { VueRenderer } from "./XMarkdown/core/VueRenderer";
export { detectUnclosedComponentTags } from "./XMarkdown/core/detectUnclosedComponentTags";

export { useStreaming } from "./XMarkdown/composables/useStreaming";
export { useParser } from "./XMarkdown/composables/useParser";
export { useRenderer } from "./XMarkdown/composables/useRenderer";
export { useTail } from "./XMarkdown/composables/useTail";

export {
  AnimationText,
  DebugPanel,
  TailIndicator,
} from "./XMarkdown/components";

export { resolveTailContent } from "./XMarkdown/utils/tail";
