const DEFAULT_TAIL_CONTENT = "▋";

export function resolveTailContent(
  tail?: boolean | { content?: string; component?: unknown },
): string | null {
  if (!tail) return null;
  if (tail === true) return DEFAULT_TAIL_CONTENT;
  return tail.content || DEFAULT_TAIL_CONTENT;
}
