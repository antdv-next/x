import type { Ref, ShallowRef } from "vue";

import { onBeforeUnmount, watch } from "vue";

import { prefersReducedMotion } from "../../_util/motion";

export interface TodoListScrollOptions {
  viewport: ShallowRef<HTMLElement | undefined>;
  /** 任务条目，用于观察数量变化。 */
  items: Ref<unknown[]>;
  /** 是否展开；折叠时列表不可见，无需滚动。 */
  open: Ref<boolean>;
}

/**
 * 任务列表的滚动跟随：新增条目时贴底，让最新任务始终可见。
 *
 * 折叠状态下不滚动——容器高度为 0 时 `scrollHeight` 无意义，而且用户看不到结果。
 */
export function useTodoListScroll(options: TodoListScrollOptions) {
  const { viewport, items, open } = options;

  let frame: number | undefined;

  function scrollToEnd(options?: { behavior?: ScrollBehavior }) {
    const element = viewport.value;
    if (!element) {
      return;
    }

    const behavior =
      options?.behavior ??
      (prefersReducedMotion() ? ("auto" as ScrollBehavior) : "smooth");

    if (typeof element.scrollTo === "function") {
      element.scrollTo({ top: element.scrollHeight, behavior });
      return;
    }

    element.scrollTop = element.scrollHeight;
  }

  watch(
    () => items.value.length,
    (next, previous) => {
      // 只在新增时跟随；删除条目不该把视口甩到底部。
      if (next <= (previous ?? 0) || !open.value) {
        return;
      }

      if (frame !== undefined) {
        window.cancelAnimationFrame(frame);
      }

      // 等 DOM 更新后再量高度，否则读到的是插入前的 `scrollHeight`。
      frame = window.requestAnimationFrame(() => {
        frame = undefined;
        scrollToEnd();
      });
    },
  );

  onBeforeUnmount(() => {
    if (frame !== undefined) {
      window.cancelAnimationFrame(frame);
      frame = undefined;
    }
  });

  return { scrollToEnd };
}
