import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, defineComponent, ref, shallowRef } from "vue";

import { useMessageScrollerFollow } from "../src/message-scroller/hooks/useMessageScrollerFollow";

/**
 * 在一个最小宿主组件里运行 composable，保留真实的生命周期语义。
 */
function setupFollow() {
  const viewport = shallowRef<HTMLElement>();
  const content = shallowRef<HTMLElement>();
  const itemSelector = ref("[data-message-id]");
  const threshold = ref(56);
  const smooth = ref(false);
  const following = computed(() => true);
  const setFollowing = vi.fn();

  let result!: ReturnType<typeof useMessageScrollerFollow>;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useMessageScrollerFollow({
          viewport,
          content,
          itemSelector,
          threshold,
          smooth,
          following,
          setFollowing,
        });
        return () => null;
      },
    }),
  );

  return { viewport, wrapper, ...result };
}

describe("useMessageScrollerFollow", () => {
  it("keeps the scroll helpers inert without a viewport", () => {
    const { handleScroll, scrollToElement, scrollToEnd, wrapper } =
      setupFollow();

    try {
      // 宿主元素缺失（例如卸载竞态）时静默降级，而不是抛错。
      expect(() => {
        handleScroll();
        scrollToElement(document.createElement("div"));
        scrollToEnd();
      }).not.toThrow();
    } finally {
      wrapper.unmount();
    }
  });

  it("ignores scrollToElement without a target element", () => {
    const { scrollToElement, viewport, wrapper } = setupFollow();

    try {
      viewport.value = document.createElement("div");

      expect(() =>
        scrollToElement(undefined as unknown as HTMLElement),
      ).not.toThrow();
    } finally {
      wrapper.unmount();
    }
  });
});
