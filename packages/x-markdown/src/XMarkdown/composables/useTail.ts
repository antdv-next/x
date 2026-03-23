import { computed, type Ref } from "vue";

import type { StreamingOption } from "../interface";

const DEFAULT_TAIL_CONTENT = "▋";

export function useTail(streaming: Ref<StreamingOption | undefined>) {
  const tailContent = computed(() => {
    const tail = streaming.value?.tail;
    if (!tail) return null;
    if (typeof tail === "boolean") return DEFAULT_TAIL_CONTENT;
    return tail.content || DEFAULT_TAIL_CONTENT;
  });

  const tailComponent = computed(() => {
    const tail = streaming.value?.tail;
    if (!tail) return null;
    if (typeof tail === "boolean") return null;
    return tail.component || null;
  });

  const showTail = computed(() => {
    const opts = streaming.value;
    return opts?.hasNextChunk && tailContent.value !== null;
  });

  return {
    tailContent,
    tailComponent,
    showTail,
  };
}
