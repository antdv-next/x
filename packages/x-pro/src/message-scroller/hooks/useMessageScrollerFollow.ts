import type { ComputedRef, Ref, ShallowRef } from "vue";

import { onBeforeUnmount, onMounted, watch } from "vue";

import {
  prefersReducedMotion,
  PROGRAMMATIC_SCROLL_WINDOW,
  resolveItemId,
} from "../utils";

/** 会让视口离开底部的内容区手势与按键。 */
const DETACH_KEYS = ["ArrowUp", "PageUp", "Home"];

export interface MessageScrollerFollowOptions {
  viewport: ShallowRef<HTMLElement | undefined>;
  content: ShallowRef<HTMLElement | undefined>;
  itemSelector: Ref<string>;
  threshold: Ref<number>;
  smooth: Ref<boolean>;
  following: ComputedRef<boolean>;
  setFollowing: (following: boolean) => void;
}

/**
 * 流式贴底跟随：视口滚动状态判定、程序化滚动屏蔽，以及内容增长时的自动贴底。
 */
export function useMessageScrollerFollow(
  options: MessageScrollerFollowOptions,
) {
  const {
    viewport,
    content,
    itemSelector,
    threshold,
    smooth,
    following,
    setFollowing,
  } = options;

  let programmatic = false;
  let programmaticTimer: number | undefined;

  /**
   * 意图脱离之后，位置判定必须先观察到视口朝最新方向回移，才有资格按阈值恢复跟随。
   *
   * 一次触控板手势里滚轮事件与滚动事件交替到达：意图事件先把状态切成脱离，紧随其后的滚动
   * 事件仍落在阈值带内。若当场按位置恢复跟随，按钮与未读计数会在同一手势里反复进出。
   */
  let detachIntent = false;
  let lastDistance: number | undefined;

  function clearProgrammaticTimer() {
    if (programmaticTimer !== undefined) {
      window.clearTimeout(programmaticTimer);
      programmaticTimer = undefined;
    }
  }

  /**
   * 用户重新接管视口：立即解除程序化滚动的屏蔽，让后续滚动事件重新判定跟随状态。
   */
  function releaseLiveEdge() {
    clearProgrammaticTimer();
    programmatic = false;
  }

  function markProgrammatic(behavior: ScrollBehavior) {
    clearProgrammaticTimer();
    programmatic = true;
    programmaticTimer = window.setTimeout(
      () => {
        programmaticTimer = undefined;
        programmatic = false;
      },
      behavior === "smooth" ? PROGRAMMATIC_SCROLL_WINDOW : 0,
    );
  }

  function resolveBehavior(behavior?: ScrollBehavior): ScrollBehavior {
    return (
      behavior ?? (smooth.value && !prefersReducedMotion() ? "smooth" : "auto")
    );
  }

  function applyScroll(top: number, behavior: ScrollBehavior) {
    const element = viewport.value;
    if (!element) {
      return;
    }

    markProgrammatic(behavior);

    if (typeof element.scrollTo === "function") {
      element.scrollTo({ top, behavior });
      return;
    }

    element.scrollTop = top;
  }

  function scrollToEnd(options?: { behavior?: ScrollBehavior }) {
    const element = viewport.value;
    if (!element) {
      return;
    }

    applyScroll(element.scrollHeight, resolveBehavior(options?.behavior));
  }

  function scrollToElement(
    element: HTMLElement,
    options?: { behavior?: ScrollBehavior },
  ) {
    const target = viewport.value;
    if (!target || !element) {
      return;
    }

    const viewportRect = target.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const top =
      target.scrollTop +
      elementRect.top -
      viewportRect.top -
      (target.clientHeight - elementRect.height) / 2;

    applyScroll(top, resolveBehavior(options?.behavior));
  }

  function findItemElement(target: string | number) {
    const root = content.value;
    if (!root) {
      return undefined;
    }

    const selector = itemSelector.value;
    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const byId = elements.find(
      (element, index) =>
        resolveItemId(element, index, selector) === String(target),
    );
    if (byId) {
      return byId;
    }

    const index = typeof target === "number" ? target : Number(target);
    return Number.isInteger(index) ? elements[index] : undefined;
  }

  function scrollToItem(
    target: string | number,
    options?: { behavior?: ScrollBehavior },
  ) {
    const element = findItemElement(target);
    if (element) {
      scrollToElement(element, options);
    }
  }

  /**
   * 读者主动脱离：滚轮上滑与脱离按键共用同一条路径。
   *
   * 进入脱离时记下位置基准，后续滚动事件必须越过它才算往回走；同一次手势里连续的滚轮事件
   * 不再重复读取布局，方向由读者自己的滚动事件维持。
   */
  function detachByIntent() {
    releaseLiveEdge();
    if (!detachIntent) {
      const element = viewport.value;
      detachIntent = true;
      lastDistance = element
        ? element.scrollHeight - element.scrollTop - element.clientHeight
        : undefined;
    }

    setFollowing(false);
  }

  function syncFollowing() {
    const element = viewport.value;
    if (!element) {
      return;
    }

    const distance =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    const approaching = lastDistance !== undefined && distance < lastDistance;
    lastDistance = distance;

    if (distance > threshold.value || (detachIntent && !approaching)) {
      setFollowing(false);
      return;
    }

    detachIntent = false;
    setFollowing(true);
  }

  function handleScroll() {
    if (programmatic) {
      return;
    }

    syncFollowing();
  }

  /**
   * 滚轮向上即认为读者要回看历史，先发制人脱离跟随，无需等待滚动事件。
   */
  function handleWheel(event: WheelEvent) {
    if (event.deltaY < 0) {
      detachByIntent();
      return;
    }

    releaseLiveEdge();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (DETACH_KEYS.includes(event.key)) {
      detachByIntent();
      return;
    }

    releaseLiveEdge();
  }

  /**
   * 触屏按下即代表读者接管视口，后续滚动事件需要重新判定跟随状态。
   */
  function handleTouchStart() {
    releaseLiveEdge();
  }

  let resizeObserver: ResizeObserver | undefined;
  let resizeFrame: number | undefined;

  /**
   * 内容高度变化时贴底。
   *
   * 脱离态下这里必须什么都不做：流式推入导致的任何高度变动都不能移动视口。
   */
  function followContentGrowth() {
    if (!following.value) {
      return;
    }

    scrollToEnd();
  }

  onMounted(() => {
    const element = content.value;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    resizeObserver = new ResizeObserver(() => {
      if (resizeFrame !== undefined) {
        window.cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = undefined;
        followContentGrowth();
      });
    });
    resizeObserver.observe(element);
  });

  watch(following, value => {
    if (!value) {
      releaseLiveEdge();
      return;
    }

    // 回到跟随后意图基准作废：下一次脱离由新的手势或新的位置重新判定。
    detachIntent = false;
    lastDistance = undefined;
  });

  onBeforeUnmount(() => {
    clearProgrammaticTimer();
    if (resizeFrame !== undefined) {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = undefined;
    }
    resizeObserver?.disconnect();
    resizeObserver = undefined;
  });

  return {
    scrollToEnd,
    scrollToItem,
    scrollToElement,
    handleScroll,
    handleWheel,
    handleKeyDown,
    handleTouchStart,
  };
}
