import { computed, ref, watch, type Ref } from "vue";

/**
 * Reveal `text` in `chunk`-sized steps, one step per `intervalMs`.
 *
 * The scheduling mirrors the upstream React demo's useEffect cleanup
 * semantics: the pending step is replaced only when the watcher re-fires,
 * so `restart()` while the stream is already at position 0 is a no-op that
 * leaves the pending step alive — restarting never strands the stream with
 * no timer scheduled.
 */
export function useChunkedStream(
  text: string,
  chunk: number,
  intervalMs: Ref<number>,
) {
  const index = ref(0);
  const isStreaming = ref(true);

  watch(
    [index, intervalMs],
    (_values, _oldValues, onCleanup) => {
      if (index.value >= text.length) {
        isStreaming.value = false;
        return;
      }
      const timer = setTimeout(() => {
        index.value = Math.min(index.value + chunk, text.length);
      }, intervalMs.value);
      onCleanup(() => clearTimeout(timer));
    },
    { immediate: true },
  );

  const content = computed(() => text.slice(0, index.value));

  const restart = () => {
    index.value = 0;
    isStreaming.value = true;
  };

  return { content, index, isStreaming, restart };
}
