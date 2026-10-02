import type { StreamingOption, XMarkdownProps } from "../interface";

/**
 * The preset behind `streaming={true}` / `streaming={false}`: every streaming
 * capability that needs no per-app configuration, switched on. The boolean is
 * `hasNextChunk`, so callers can pass their own "is the answer still
 * streaming" flag straight through.
 */
const PRESET: Omit<StreamingOption, "hasNextChunk"> = {
  incremental: true,
  incompleteMarkdown: "complete",
  typewriter: true,
  // Sentence fade-in units: the typewriter reveals a few characters per
  // frame, and `splitBy: 'chunk'` would wrap each frame's reveal in its own
  // fade-in node, accumulating thousands of them over a long answer. This
  // follows the advice on `AnimationConfig.splitBy` itself. (Ahead of
  // upstream ant-design/x#2061, whose preset leaves the default 'chunk'.)
  animationConfig: Object.freeze({ splitBy: "sentence" as const }),
  // No tail cursor: it is a visual choice for the app to make (`tail: true`
  // in the object form), not part of "streams well by default".
};

// Frozen module-level objects so the resolved option keeps a stable identity
// across renders; everything downstream memoises on it.
const STREAMING_ON: StreamingOption = Object.freeze({
  ...PRESET,
  hasNextChunk: true,
});
const STREAMING_OFF: StreamingOption = Object.freeze({
  ...PRESET,
  hasNextChunk: false,
});

/**
 * Normalise the `streaming` prop. Objects pass through untouched (the
 * behaviour of every existing caller), booleans expand to the preset.
 */
export const resolveStreaming = (
  streaming: XMarkdownProps["streaming"],
): StreamingOption | undefined => {
  if (streaming === true) return STREAMING_ON;
  if (streaming === false) return STREAMING_OFF;
  return streaming;
};
