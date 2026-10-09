import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";

import TodoDisclosure from "../src/todo-list/components/TodoDisclosure";

const PREFIX = "ant-todo-list";

/**
 * `Transition` 的高度钩子只在进入/离开的瞬间跑，同一 tick 内就会被下一步覆盖，
 * 从组件外部观察不到。这里把 `Transition` 换成记录 props 的探针，直接抓住宿主传下来的
 * 钩子逐个调用，于是「目标高度怎么算、清空时清成什么样」都能确定性地断言。
 */
function mountDisclosure(props: Record<string, unknown> = {}) {
  const captured: Record<string, ((el: Element) => void) | undefined> = {};
  const contentRef = ref<HTMLElement>();

  const TransitionProbe = defineComponent({
    name: "TransitionProbe",
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      for (const key of [
        "onBeforeEnter",
        "onEnter",
        "onAfterEnter",
        "onBeforeLeave",
        "onLeave",
        "onAfterLeave",
      ]) {
        captured[key] = attrs[key] as ((el: Element) => void) | undefined;
      }

      return () => h("div", { class: "probe-transition" }, slots.default?.());
    },
  });

  const wrapper = mount(TodoDisclosure, {
    props: {
      prefixCls: PREFIX,
      open: true,
      maxHeight: 100,
      contentRef,
      ...props,
    },
    global: { stubs: { transition: TransitionProbe } },
    slots: { default: () => h("span", "body") },
  });

  return { wrapper, captured, contentRef };
}

function element(overrides: { scrollHeight?: number } = {}) {
  return {
    style: { height: "", opacity: "" },
    scrollHeight: 400,
    offsetHeight: 400,
    ...overrides,
  } as unknown as HTMLElement;
}

describe("TodoDisclosure", () => {
  it("sets the height from the enter hook", () => {
    const { captured } = mountDisclosure();
    const node = element();

    captured.onBeforeEnter?.(node);
    expect(node.style.height).toBe("0px");
    expect(node.style.opacity).toBe("0");

    captured.onEnter?.(node);
    expect(node.style.height).toBe("100px");

    captured.onAfterEnter?.(node);
    expect(node.style.height).toBe("auto");
    expect(node.style.opacity).toBe("1");
  });

  it("clamps the enter height to maxHeight", () => {
    const { captured } = mountDisclosure({ maxHeight: 100 });
    const node = element({ scrollHeight: 900 });

    captured.onEnter?.(node);

    expect(node.style.height).toBe("100px");
  });

  it("keeps the full height when the content is shorter than maxHeight", () => {
    const { captured } = mountDisclosure({ maxHeight: 100 });
    const node = element({ scrollHeight: 40 });

    captured.onEnter?.(node);

    expect(node.style.height).toBe("40px");
  });

  it("collapses to zero on leave and clears the inline styles afterwards", () => {
    const { captured } = mountDisclosure();
    const node = element({ scrollHeight: 60 });

    captured.onBeforeLeave?.(node);
    expect(node.style.height).toBe("60px");
    expect(node.style.opacity).toBe("1");

    captured.onLeave?.(node);
    expect(node.style.height).toBe("0px");
    expect(node.style.opacity).toBe("0");

    captured.onAfterLeave?.(node);
    expect(node.style.height).toBe("");
    expect(node.style.opacity).toBe("");
  });

  it("exposes the content element through contentRef while open", async () => {
    const { wrapper, contentRef } = mountDisclosure();

    await wrapper.vm.$nextTick();

    expect(contentRef.value).toBeInstanceOf(HTMLElement);
    expect(contentRef.value?.className).toContain(`${PREFIX}-content`);
  });

  it("renders no content and clears the ref when closed", async () => {
    const { wrapper, contentRef } = mountDisclosure({ open: false });

    await wrapper.vm.$nextTick();

    expect(wrapper.find(`.${PREFIX}-content`).exists()).toBe(false);
    expect(contentRef.value).toBeUndefined();
  });

  it("writes the max height onto the content element", () => {
    const { wrapper } = mountDisclosure({ maxHeight: 320 });

    expect(wrapper.find(`.${PREFIX}-content`).attributes("style")).toContain(
      "max-height: 320px",
    );
  });

  it("tolerates a disclosure without a contentRef", () => {
    const { wrapper } = mountDisclosure({ contentRef: undefined });

    expect(wrapper.find(`.${PREFIX}-content`).exists()).toBe(true);
  });

  it("merges a host class onto the content element", () => {
    const { wrapper } = mountDisclosure({ class: "host-content" });

    expect(wrapper.find(`.${PREFIX}-content`).classes()).toContain(
      "host-content",
    );
  });
});
