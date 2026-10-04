import type { VueWrapper } from "@vue/test-utils";
import type { App } from "vue";

import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick, ref } from "vue";

import type {
  MessageScrollerItem,
  MessageScrollerRef,
} from "../src/message-scroller/types";

import { MessageScroller, XProProvider } from "../src/index";
import xProZhCN from "../src/locale/zh_CN";

const VIEWPORT_SELECTOR = ".ant-message-scroller-viewport";
const CONTENT_SELECTOR = ".ant-message-scroller-content";
const RAIL_SELECTOR = ".ant-message-scroller-rail";
const RAIL_ITEM_SELECTOR = ".ant-message-scroller-rail-item";
const PREVIEW_SELECTOR = ".ant-message-scroller-preview";

interface DemoMessage {
  id: string;
  text: string;
}

function mockMetrics(
  element: Element,
  metrics: Partial<
    Record<
      | "clientWidth"
      | "clientHeight"
      | "scrollWidth"
      | "scrollHeight"
      | "scrollTop"
      | "scrollLeft",
      number
    >
  >,
) {
  Object.entries(metrics).forEach(([key, value]) => {
    Object.defineProperty(element, key, {
      configurable: true,
      writable: true,
      value,
    });
  });
}

function mockRect(element: Element, rect: { top: number; height: number }) {
  element.getBoundingClientRect = () =>
    ({
      top: rect.top,
      height: rect.height,
      bottom: rect.top + rect.height,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: rect.top,
      toJSON: () => ({}),
    }) as DOMRect;
}

/**
 * jsdom 会把 `scrollTop` 夹到可滚动范围内，这里记录组件真正写入的值。
 */
function trackScroll(element: Element, initial = 0) {
  const writes: number[] = [];
  let value = initial;
  Object.defineProperty(element, "scrollTop", {
    configurable: true,
    get: () => value,
    set: (next: number) => {
      value = next;
      writes.push(next);
    },
  });
  return writes;
}

class TestResizeObserver {
  static instances: TestResizeObserver[] = [];

  private readonly observed = new Set<Element>();
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    TestResizeObserver.instances.push(this);
  }

  observe = vi.fn((target: Element) => {
    this.observed.add(target);
  });

  unobserve = vi.fn((target: Element) => {
    this.observed.delete(target);
  });

  disconnect = vi.fn(() => {
    this.observed.clear();
  });

  trigger(target: Element) {
    if (!this.observed.has(target)) {
      return;
    }

    this.callback(
      [{ target } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }

  static reset() {
    TestResizeObserver.instances = [];
  }

  static trigger(target: Element) {
    TestResizeObserver.instances.forEach(instance => instance.trigger(target));
  }
}

function installResizeObserverMock() {
  const originResizeObserver = globalThis.ResizeObserver;

  TestResizeObserver.reset();
  globalThis.ResizeObserver =
    TestResizeObserver as unknown as typeof ResizeObserver;

  return () => {
    globalThis.ResizeObserver = originResizeObserver;
    TestResizeObserver.reset();
  };
}

function createMessages(count = 3): DemoMessage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `message-${index + 1}`,
    text: `Message ${index + 1}`,
  }));
}

function mountScroller(
  props: Record<string, unknown> = {},
  messages: DemoMessage[] = createMessages(),
) {
  return mount(MessageScroller, {
    attachTo: document.body,
    props,
    slots: {
      default: () =>
        messages.map(message =>
          h("div", { "data-message-id": message.id }, message.text),
        ),
    },
  });
}

function find(root: Element, selector: string) {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`Missing ${selector}`);
  }

  return element;
}

function findRailItems(wrapper: VueWrapper) {
  return wrapper.findAll(RAIL_ITEM_SELECTOR);
}

function railItem(wrapper: VueWrapper, index: number) {
  const item = findRailItems(wrapper)[index];
  if (!item) {
    throw new Error(`Missing rail item ${index}`);
  }

  return item;
}

/**
 * 最后一条事件载荷。
 *
 * 这里不用 `Array.prototype.at`，因为该包编译目标为 ES2020。
 */
function lastPayload(wrapper: VueWrapper, event: string) {
  const events = wrapper.emitted(event);
  return events?.[events.length - 1];
}

/**
 * 组件通过 `requestAnimationFrame` 批量刷新贴底与导轨同步，这里等待真实帧边界而不是猜测时长。
 * `Transition` 的离场内容也需要额外一帧才会从 DOM 中移除。
 */
async function flushFrames() {
  await nextFrame();
  await nextFrame();
  await nextTick();
  await Promise.resolve();
  await nextTick();
  await flushPromises();
}

/**
 * 该包编译目标为 ES2020，缺少 `Promise.withResolvers`，只能用执行器形式等待帧回调。
 */
function nextFrame() {
  return new Promise<void>(resolve => {
    window.requestAnimationFrame(() => resolve());
  });
}

function setupOverflowingRail(
  wrapper: VueWrapper,
  scrollHeight = 1200,
  clientHeight = 400,
) {
  const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
  const content = find(wrapper.element, CONTENT_SELECTOR);
  mockMetrics(viewport, {
    scrollHeight,
    clientHeight,
    clientWidth: 200,
    scrollWidth: 200,
  });
  TestResizeObserver.trigger(viewport);
  TestResizeObserver.trigger(content);
  return { viewport, content };
}

describe("MessageScroller", () => {
  it("exports MessageScroller from package entry", async () => {
    const mod = await import("../src/index");
    expect(mod.MessageScroller).toBeDefined();
  });

  it("renders slot content in a labelled live region", () => {
    const wrapper = mountScroller({ busy: true });
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    const content = find(wrapper.element, CONTENT_SELECTOR);

    expect(viewport.getAttribute("aria-label")).toBe("Conversation");
    expect(viewport.getAttribute("tabindex")).toBe("0");
    expect(content.getAttribute("role")).toBe("log");
    expect(content.getAttribute("aria-live")).toBe("polite");
    expect(content.getAttribute("aria-busy")).toBe("true");
    expect(content.querySelectorAll("[data-message-id]")).toHaveLength(3);
  });

  it("uses translated labels from the XPro locale", () => {
    const wrapper = mount(XProProvider, {
      props: { locale: xProZhCN },
      slots: {
        default: () =>
          h(MessageScroller, null, {
            default: () => h("div", { "data-message-id": "message-1" }, "a"),
          }),
      },
    });

    expect(wrapper.find(VIEWPORT_SELECTOR).attributes("aria-label")).toBe(
      "会话内容",
    );
  });

  it("pins the viewport to the bottom while content grows", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller();
      const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
      const content = find(wrapper.element, CONTENT_SELECTOR);
      const writes = trackScroll(viewport, 0);
      mockMetrics(viewport, { scrollHeight: 1000, clientHeight: 400 });

      TestResizeObserver.trigger(content);
      await flushFrames();

      expect(writes).toEqual([1000]);
    } finally {
      dispose();
    }
  });

  it("keeps the reading position when content grows after detaching", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller();
      const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
      const content = find(wrapper.element, CONTENT_SELECTOR);
      const writes = trackScroll(viewport, 100);
      mockMetrics(viewport, { scrollHeight: 1000, clientHeight: 400 });

      await wrapper.find(VIEWPORT_SELECTOR).trigger("scroll");
      expect(lastPayload(wrapper, "followChange")).toEqual([false]);

      TestResizeObserver.trigger(content);
      await flushFrames();

      mockMetrics(viewport, { scrollHeight: 1800 });
      TestResizeObserver.trigger(content);
      await flushFrames();

      expect(writes).toEqual([]);
      expect(lastPayload(wrapper, "followChange")).toEqual([false]);
    } finally {
      dispose();
    }
  });

  it("detaches on scroll up before the scroll event arrives", async () => {
    const wrapper = mountScroller();

    await wrapper.find(VIEWPORT_SELECTOR).trigger("wheel", { deltaY: -1 });

    expect(lastPayload(wrapper, "followChange")).toEqual([false]);
    expect(lastPayload(wrapper, "update:follow")).toEqual([false]);
  });

  it("re-attaches when the reader scrolls back within the threshold", async () => {
    const wrapper = mountScroller({ followThreshold: 80 });
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    mockMetrics(viewport, {
      scrollTop: 400,
      scrollHeight: 1000,
      clientHeight: 400,
    });

    await wrapper.find(VIEWPORT_SELECTOR).trigger("wheel", { deltaY: -1 });
    expect(lastPayload(wrapper, "followChange")).toEqual([false]);

    mockMetrics(viewport, { scrollTop: 560 });
    await wrapper.find(VIEWPORT_SELECTOR).trigger("scroll");

    expect(lastPayload(wrapper, "followChange")).toEqual([true]);
  });

  it("stays detached after a controlled follow prop turns false", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ follow: false });
      const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
      const content = find(wrapper.element, CONTENT_SELECTOR);
      const writes = trackScroll(viewport, 0);
      mockMetrics(viewport, { scrollHeight: 1000, clientHeight: 400 });

      TestResizeObserver.trigger(content);
      await flushFrames();

      expect(writes).toEqual([]);
      expect(wrapper.emitted("followChange")).toBeUndefined();
    } finally {
      dispose();
    }
  });

  it("scrolls to the bottom when following is restored through the ref", async () => {
    const wrapper = mountScroller({ follow: false });
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    const writes = trackScroll(viewport, 0);
    mockMetrics(viewport, { scrollHeight: 1500, clientHeight: 400 });

    const api = wrapper.vm as unknown as MessageScrollerRef;
    api.setFollowing(true);
    await nextTick();

    expect(writes).toEqual([1500]);
    expect(lastPayload(wrapper, "followChange")).toEqual([true]);
    expect(lastPayload(wrapper, "update:follow")).toEqual([true]);
  });

  it("exposes the elements and following state through the ref", () => {
    const wrapper = mountScroller();
    const api = wrapper.vm as unknown as MessageScrollerRef;

    expect(api.nativeElement).toBe(wrapper.element);
    expect(api.viewportElement?.className).toContain(
      "ant-message-scroller-viewport",
    );
    expect(api.contentElement?.className).toContain(
      "ant-message-scroller-content",
    );
    expect(api.following).toBe(true);
  });

  it("centers the target message with scrollToItem", () => {
    const wrapper = mountScroller();
    const api = wrapper.vm as unknown as MessageScrollerRef;
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    const target = find(wrapper.element, '[data-message-id="message-2"]');
    const writes = trackScroll(viewport, 100);

    mockMetrics(viewport, { scrollHeight: 1000, clientHeight: 400 });
    mockRect(viewport, { top: 0, height: 400 });
    mockRect(target, { top: 300, height: 40 });

    api.scrollToItem("message-2");

    expect(writes).toEqual([220]);
  });

  it("reveals the back-to-latest button while detached and pins on click", async () => {
    const wrapper = mountScroller({ backToBottom: true });
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    const writes = trackScroll(viewport, 120);
    mockMetrics(viewport, { scrollHeight: 1000, clientHeight: 400 });

    expect(wrapper.find(".ant-message-scroller-back-to-bottom").exists()).toBe(
      false,
    );

    await wrapper.find(VIEWPORT_SELECTOR).trigger("wheel", { deltaY: -1 });
    await nextTick();

    const button = wrapper.find(".ant-message-scroller-back-to-bottom-button");
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe("Back to latest");

    await button.trigger("click");
    await nextTick();

    expect(lastPayload(wrapper, "followChange")).toEqual([true]);
    expect(writes).toEqual([1000]);
  });

  it("renders rail items from the item selector with attenuated ticks", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" }, createMessages(5));
      const { viewport } = setupOverflowingRail(wrapper);
      await flushFrames();

      // 挂载后视图已被钉到底部，回到顶部以观察首个消息作为当前项时的刻度衰减。
      mockMetrics(viewport, { scrollTop: 0 });
      await wrapper.find(VIEWPORT_SELECTOR).trigger("scroll");

      const rail = wrapper.find(RAIL_SELECTOR);
      expect(rail.exists()).toBe(true);
      expect(rail.attributes("aria-label")).toBe("Message navigation");

      expect(findRailItems(wrapper)).toHaveLength(5);
      expect(railItem(wrapper, 0).attributes("aria-label")).toBe(
        "Go to message 1 of 5",
      );
      expect(railItem(wrapper, 4).attributes("aria-label")).toBe(
        "Go to message 5 of 5",
      );
      expect(railItem(wrapper, 0).attributes("data-active")).toBeDefined();
      expect(railItem(wrapper, 0).attributes("data-highlighted")).toBeDefined();
      expect(railItem(wrapper, 1).attributes("data-active")).toBeUndefined();
      expect(railItem(wrapper, 0).attributes("style")).toContain(
        "--ant-message-scroller-rail-scale: 1",
      );
      expect(railItem(wrapper, 1).attributes("style")).toContain(
        "--ant-message-scroller-rail-scale: 0.68",
      );
      expect(railItem(wrapper, 2).attributes("style")).toContain(
        "--ant-message-scroller-rail-scale: 0.44",
      );
      expect(railItem(wrapper, 3).attributes("style")).toContain(
        "--ant-message-scroller-rail-scale: 0.25",
      );
      expect(railItem(wrapper, 4).attributes("style")).toContain(
        "--ant-message-scroller-rail-scale: 0.25",
      );
    } finally {
      dispose();
    }
  });

  it("hides the rail when the transcript does not overflow", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" });
      setupOverflowingRail(wrapper, 300, 400);
      await flushFrames();

      expect(wrapper.find(RAIL_SELECTOR).exists()).toBe(false);
    } finally {
      dispose();
    }
  });

  it("slides a single preview card between rail items", async () => {
    const dispose = installResizeObserverMock();

    try {
      const items = createMessages().map<MessageScrollerItem>(message => ({
        id: message.id,
        title: `Title ${message.id}`,
      }));
      const wrapper = mountScroller({ navigation: "rail", items });
      setupOverflowingRail(wrapper);
      await flushFrames();

      await railItem(wrapper, 1).trigger("pointerenter", {
        pointerType: "mouse",
      });
      await nextTick();

      expect(wrapper.findAll(PREVIEW_SELECTOR)).toHaveLength(1);
      expect(wrapper.find(".ant-message-scroller-preview-title").text()).toBe(
        "Title message-2",
      );
      expect(
        wrapper.find(".ant-message-scroller-preview-track").attributes("style"),
      ).toContain("translateY(0px)");

      await railItem(wrapper, 2).trigger("pointerenter", {
        pointerType: "mouse",
      });
      await nextTick();

      expect(wrapper.findAll(PREVIEW_SELECTOR)).toHaveLength(1);
      expect(wrapper.find(".ant-message-scroller-preview-title").text()).toBe(
        "Title message-3",
      );
      expect(
        wrapper.find(".ant-message-scroller-preview-track").attributes("style"),
      ).toContain("translateY(14px)");
    } finally {
      dispose();
    }
  });

  it("pins the preview after a touch tap and dismisses it on an outside tap", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" });
      setupOverflowingRail(wrapper);
      await flushFrames();

      await railItem(wrapper, 1).trigger("pointerdown", {
        pointerType: "touch",
      });
      await railItem(wrapper, 1).trigger("click");
      await wrapper.find(RAIL_SELECTOR).trigger("pointerleave");
      await nextTick();

      expect(wrapper.find(".ant-message-scroller-preview-title").text()).toBe(
        "Message 2",
      );

      document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      await flushFrames();

      expect(wrapper.find(PREVIEW_SELECTOR).exists()).toBe(false);
    } finally {
      dispose();
    }
  });

  it("restores following when the last rail item is selected", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail", follow: false });
      const { viewport } = setupOverflowingRail(wrapper);
      const writes = trackScroll(viewport, 0);
      await flushFrames();

      await railItem(wrapper, 2).trigger("click");
      await nextTick();

      expect(lastPayload(wrapper, "railItemSelect")).toEqual([
        "message-3",
        expect.objectContaining({ id: "message-3" }),
      ]);
      expect(lastPayload(wrapper, "followChange")).toEqual([true]);
      expect(writes).toEqual([1200]);
    } finally {
      dispose();
    }
  });

  it("detaches and centers when a middle rail item is selected", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail", follow: false });
      const { viewport } = setupOverflowingRail(wrapper);
      const writes = trackScroll(viewport, 0);
      await flushFrames();

      const target = find(wrapper.element, '[data-message-id="message-2"]');
      mockRect(viewport, { top: 0, height: 400 });
      mockRect(target, { top: 300, height: 40 });

      await railItem(wrapper, 1).trigger("click");
      await nextTick();

      expect(writes).toEqual([300 - (400 - 40) / 2]);
      expect(wrapper.emitted("followChange")).toBeUndefined();
    } finally {
      dispose();
    }
  });

  it("emits css-var-safe length declarations", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail", backToBottom: true });
      setupOverflowingRail(wrapper);
      await flushFrames();

      const css = [...document.querySelectorAll("style")]
        .map(style => style.textContent ?? "")
        .filter(text => text.includes("ant-message-scroller"))
        .join("\n");

      expect(css).not.toBe("");
      expect(css).not.toMatch(/NaN/);
      expect(css).not.toMatch(/\)px/);
      expect(css).not.toMatch(/\)var\(/);
      // 状态类与根元素同体：必须生成 `.ant-x.ant-x-state` 复合选择器，而不是后代选择器。
      expect(css).toContain(
        `.ant-message-scroller.ant-message-scroller-rail-enabled ${VIEWPORT_SELECTOR}`,
      );
      expect(css).toContain(
        `.ant-message-scroller.ant-message-scroller-rail-visible ${VIEWPORT_SELECTOR}`,
      );
    } finally {
      dispose();
    }
  });

  it("merges semantic classes and styles from props and the XPro provider", () => {
    const wrapper = mount(XProProvider, {
      props: {
        locale: xProZhCN,
        messageScroller: {
          class: "provider-class",
          classes: { viewport: "provider-viewport" },
          styles: { viewport: { paddingTop: "4px" } },
        },
      },
      slots: {
        default: () =>
          h(
            MessageScroller,
            {
              classes: { content: "props-content" },
              styles: { content: { paddingBottom: "8px" } },
            },
            {
              default: () => h("div", { "data-message-id": "message-1" }, "a"),
            },
          ),
      },
    });

    expect(wrapper.find(".ant-message-scroller").classes()).toContain(
      "provider-class",
    );
    expect(wrapper.find(VIEWPORT_SELECTOR).classes()).toContain(
      "provider-viewport",
    );
    expect(wrapper.find(CONTENT_SELECTOR).classes()).toContain("props-content");
    expect(wrapper.find(VIEWPORT_SELECTOR).attributes("style")).toContain(
      "padding-top: 4px",
    );
    expect(wrapper.find(CONTENT_SELECTOR).attributes("style")).toContain(
      "padding-bottom: 8px",
    );
  });

  it("detaches on navigation keys and ignores other keys", async () => {
    const wrapper = mountScroller();

    await wrapper.find(VIEWPORT_SELECTOR).trigger("keydown", {
      key: "ArrowDown",
    });
    expect(wrapper.emitted("followChange")).toBeUndefined();

    await wrapper.find(VIEWPORT_SELECTOR).trigger("keydown", { key: "PageUp" });
    expect(lastPayload(wrapper, "followChange")).toEqual([false]);
    expect(lastPayload(wrapper, "update:follow")).toEqual([false]);
  });

  it("keeps following when the wheel moves towards the live edge", async () => {
    const wrapper = mountScroller();
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    mockMetrics(viewport, {
      scrollTop: 560,
      scrollHeight: 1000,
      clientHeight: 400,
    });

    await wrapper.find(VIEWPORT_SELECTOR).trigger("wheel", { deltaY: 1 });

    expect(wrapper.emitted("followChange")).toBeUndefined();
  });

  it("lets a touch gesture take over a programmatic smooth scroll", async () => {
    const wrapper = mountScroller();
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    mockMetrics(viewport, { scrollHeight: 1000, clientHeight: 400 });
    const api = wrapper.vm as unknown as MessageScrollerRef;

    api.setFollowing(false);
    // 重新跟随触发程序化平滑滚动，其屏蔽窗口内忽略滚动事件。
    api.setFollowing(true);

    mockMetrics(viewport, { scrollTop: 0 });
    await wrapper.find(VIEWPORT_SELECTOR).trigger("scroll");
    expect(lastPayload(wrapper, "followChange")).toEqual([true]);

    await wrapper.find(VIEWPORT_SELECTOR).trigger("touchstart");
    await wrapper.find(VIEWPORT_SELECTOR).trigger("scroll");
    expect(lastPayload(wrapper, "followChange")).toEqual([false]);
  });

  it("prefers the native scrollTo when the element provides one", () => {
    const wrapper = mountScroller({ follow: false, smooth: false });
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    const scrollTo = vi.fn();
    Object.defineProperty(viewport, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });
    mockMetrics(viewport, { scrollHeight: 1500, clientHeight: 400 });

    (wrapper.vm as unknown as MessageScrollerRef).setFollowing(true);

    expect(scrollTo).toHaveBeenCalledWith({ top: 1500, behavior: "auto" });
  });

  it("coalesces a burst of content resizes into one follow", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller();
      const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
      const content = find(wrapper.element, CONTENT_SELECTOR);
      const writes = trackScroll(viewport, 0);
      mockMetrics(viewport, { scrollHeight: 1000, clientHeight: 400 });

      TestResizeObserver.trigger(content);
      TestResizeObserver.trigger(content);
      TestResizeObserver.trigger(content);
      await flushFrames();

      expect(writes).toEqual([1000]);
    } finally {
      dispose();
    }
  });

  it("accepts a numeric index in scrollToItem and ignores one out of range", () => {
    const wrapper = mountScroller();
    const api = wrapper.vm as unknown as MessageScrollerRef;
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    const target = find(wrapper.element, '[data-message-id="message-3"]');
    const writes = trackScroll(viewport, 100);

    mockMetrics(viewport, { scrollHeight: 1000, clientHeight: 400 });
    mockRect(viewport, { top: 0, height: 400 });
    mockRect(target, { top: 300, height: 40 });

    api.scrollToItem(2);
    expect(writes).toEqual([220]);

    api.scrollToItem(9);
    api.scrollToItem("no-such-message");
    expect(writes).toEqual([220]);
  });

  it("scrolls through the exposed scrollToEnd without changing follow state", () => {
    const wrapper = mountScroller({ follow: false });
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    const writes = trackScroll(viewport, 0);
    mockMetrics(viewport, { scrollHeight: 1500, clientHeight: 400 });
    const api = wrapper.vm as unknown as MessageScrollerRef;

    api.scrollToEnd({ behavior: "auto" });

    expect(writes).toEqual([1500]);
    expect(api.following).toBe(false);
    expect(wrapper.emitted("followChange")).toBeUndefined();
  });

  it("detaches through the exposed setFollowing without scrolling", () => {
    const wrapper = mountScroller();
    const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
    const writes = trackScroll(viewport, 0);
    mockMetrics(viewport, { scrollHeight: 1000, clientHeight: 400 });
    const api = wrapper.vm as unknown as MessageScrollerRef;

    api.setFollowing(false);

    expect(api.following).toBe(false);
    expect(writes).toEqual([]);
    expect(lastPayload(wrapper, "followChange")).toEqual([false]);
  });

  it("disconnects observers on unmount and stays inert afterwards", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" });
      const viewport = find(wrapper.element, VIEWPORT_SELECTOR);
      const content = find(wrapper.element, CONTENT_SELECTOR);
      mockMetrics(viewport, { scrollHeight: 1200, clientHeight: 400 });

      // 排入尚未执行的同步帧，卸载时应被取消。
      TestResizeObserver.trigger(viewport);
      TestResizeObserver.trigger(content);
      await nextTick();

      const observers = [...TestResizeObserver.instances];
      expect(observers.length).toBeGreaterThan(0);

      const api = wrapper.vm as unknown as MessageScrollerRef;
      wrapper.unmount();

      observers.forEach(observer => {
        expect(observer.disconnect).toHaveBeenCalled();
      });

      expect(api.nativeElement).toBeNull();
      expect(api.viewportElement).toBeNull();
      expect(api.contentElement).toBeNull();
      // 卸载后暴露的 API 必须静默降级，而不是抛错。
      expect(() => {
        api.scrollToEnd();
        api.scrollToItem("message-1");
        api.setFollowing(true);
      }).not.toThrow();

      // 没有挂起同步帧的卸载路径也必须清理观察者。
      const plain = mountScroller();
      const plainObservers = [...TestResizeObserver.instances];
      plain.unmount();

      expect(plainObservers.length).toBeGreaterThan(observers.length);
      plainObservers.forEach(observer => {
        expect(observer.disconnect).toHaveBeenCalled();
      });
    } finally {
      dispose();
    }
  });

  it("tracks the message nearest the viewport center while scrolling", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" }, createMessages(5));
      const { viewport } = setupOverflowingRail(wrapper, 1200, 400);
      await flushFrames();

      [0, 100, 200, 300, 400].forEach((top, index) => {
        mockRect(wrapper.findAll("[data-message-id]")[index].element, {
          top,
          height: 40,
        });
      });
      mockRect(viewport, { top: 0, height: 400 });

      mockMetrics(viewport, { scrollTop: 300 });
      await wrapper.find(VIEWPORT_SELECTOR).trigger("scroll");
      await nextTick();

      // 视口中心 200px 落在 message-3 的行中心 220px 上。
      expect(railItem(wrapper, 2).attributes("data-active")).toBeDefined();
      expect(railItem(wrapper, 1).attributes("data-active")).toBeUndefined();
    } finally {
      dispose();
    }
  });

  it("marks the last item active near the live edge", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" }, createMessages(5));
      const { viewport } = setupOverflowingRail(wrapper, 1200, 400);
      await flushFrames();

      mockMetrics(viewport, { scrollTop: 790 });
      await wrapper.find(VIEWPORT_SELECTOR).trigger("scroll");
      await nextTick();

      expect(railItem(wrapper, 4).attributes("data-active")).toBeDefined();
      expect(railItem(wrapper, 4).attributes("aria-current")).toBe("location");
      expect(wrapper.emitted("followChange")).toBeUndefined();
    } finally {
      dispose();
    }
  });

  it("falls back to the default item height when the viewport is too short", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" }, createMessages(3));
      // 视口高度小于导轨上下内缩之和，单项高度退回默认值。
      setupOverflowingRail(wrapper, 1200, 20);
      await flushFrames();

      expect(wrapper.find(RAIL_SELECTOR).exists()).toBe(true);
      expect(railItem(wrapper, 0).attributes("style")).toContain(
        "height: 14px",
      );
    } finally {
      dispose();
    }
  });

  it("re-syncs the rail when navigation is enabled after mount", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller();
      expect(wrapper.find(RAIL_SELECTOR).exists()).toBe(false);

      await wrapper.setProps({ navigation: "rail" });
      setupOverflowingRail(wrapper);
      await flushFrames();

      expect(wrapper.find(RAIL_SELECTOR).exists()).toBe(true);
      expect(findRailItems(wrapper)).toHaveLength(3);
    } finally {
      dispose();
    }
  });

  it("opens the preview for a keyboard-focused rail item", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" });
      setupOverflowingRail(wrapper);
      await flushFrames();

      // 鼠标点击的聚焦不是 focus-visible，不弹出卡片。
      await railItem(wrapper, 1).trigger("focus");
      await nextTick();
      expect(wrapper.find(PREVIEW_SELECTOR).exists()).toBe(false);

      const item = railItem(wrapper, 1);
      vi.spyOn(item.element, "matches").mockReturnValue(true);
      await item.trigger("focus");
      await nextTick();
      expect(wrapper.find(".ant-message-scroller-preview-title").text()).toBe(
        "Message 2",
      );
    } finally {
      dispose();
    }
  });

  it("keeps the focused preview while focus stays inside the rail", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" });
      setupOverflowingRail(wrapper);
      await flushFrames();

      const item = railItem(wrapper, 1);
      vi.spyOn(item.element, "matches").mockReturnValue(true);
      await item.trigger("focus");
      await nextTick();
      expect(wrapper.find(PREVIEW_SELECTOR).exists()).toBe(true);

      await wrapper.find(RAIL_SELECTOR).trigger("blur", {
        relatedTarget: railItem(wrapper, 2).element,
      });
      await nextTick();
      expect(wrapper.find(PREVIEW_SELECTOR).exists()).toBe(true);

      await wrapper.find(RAIL_SELECTOR).trigger("blur", {
        relatedTarget: document.body,
      });
      await nextTick();
      expect(wrapper.find(PREVIEW_SELECTOR).exists()).toBe(false);
    } finally {
      dispose();
    }
  });

  it("ignores hover for touch pointers", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" });
      setupOverflowingRail(wrapper);
      await flushFrames();

      await railItem(wrapper, 1).trigger("pointerenter", {
        pointerType: "touch",
      });
      await nextTick();

      expect(wrapper.find(PREVIEW_SELECTOR).exists()).toBe(false);
    } finally {
      dispose();
    }
  });

  it("keeps the pinned preview when the tap lands inside the rail", async () => {
    const dispose = installResizeObserverMock();

    try {
      const wrapper = mountScroller({ navigation: "rail" });
      setupOverflowingRail(wrapper);
      await flushFrames();

      await railItem(wrapper, 1).trigger("pointerdown", {
        pointerType: "touch",
      });
      await railItem(wrapper, 1).trigger("click");
      // 触屏抬手后指针离开刻度项，卡片靠锁定继续展示。
      await wrapper.find(RAIL_SELECTOR).trigger("pointerleave");
      await flushFrames();
      expect(wrapper.find(PREVIEW_SELECTOR).exists()).toBe(true);

      railItem(wrapper, 0).element.dispatchEvent(
        new Event("pointerdown", { bubbles: true }),
      );
      await flushFrames();
      expect(wrapper.find(PREVIEW_SELECTOR).exists()).toBe(true);

      await wrapper.find(RAIL_SELECTOR).trigger("pointerleave");
      document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      await flushFrames();
      expect(wrapper.find(PREVIEW_SELECTOR).exists()).toBe(false);
    } finally {
      dispose();
    }
  });

  it("renders item descriptions in the preview card", async () => {
    const dispose = installResizeObserverMock();

    try {
      const items = createMessages().map<MessageScrollerItem>(message => ({
        id: message.id,
        title: `Title ${message.id}`,
        description: `Description ${message.id}`,
      }));
      const wrapper = mountScroller({ navigation: "rail", items });
      setupOverflowingRail(wrapper);
      await flushFrames();

      await railItem(wrapper, 1).trigger("pointerenter", {
        pointerType: "mouse",
      });
      await nextTick();

      expect(
        wrapper.find(".ant-message-scroller-preview-description").text(),
      ).toBe("Description message-2");
    } finally {
      dispose();
    }
  });

  it("degrades gracefully when the hovered message disappears", async () => {
    const dispose = installResizeObserverMock();

    try {
      const messages = ref(createMessages(4));
      const wrapper = mount(MessageScroller, {
        attachTo: document.body,
        props: { navigation: "rail" },
        slots: {
          default: () =>
            messages.value.map(message =>
              h("div", { "data-message-id": message.id }, message.text),
            ),
        },
      });
      setupOverflowingRail(wrapper);
      await flushFrames();

      await railItem(wrapper, 2).trigger("pointerenter", {
        pointerType: "mouse",
      });
      await nextTick();
      expect(wrapper.find(".ant-message-scroller-preview-title").text()).toBe(
        "Message 3",
      );

      messages.value = createMessages(2);
      await nextTick();
      await flushFrames();

      // 悬停项已不存在：刻度退化为统一的最小比例，预览卡片收起。
      expect(findRailItems(wrapper)).toHaveLength(2);
      expect(railItem(wrapper, 0).attributes("style")).toContain(
        "--ant-message-scroller-rail-scale: 0.25",
      );
      expect(wrapper.find(PREVIEW_SELECTOR).exists()).toBe(false);
    } finally {
      dispose();
    }
  });

  it("merges class and style attributes passed to the host element", () => {
    const wrapper = mount(MessageScroller, {
      attrs: {
        class: ["scroller-class", { "scroller-flag": true }],
        style: "color: rgb(1, 2, 3)",
      },
      slots: {
        default: () => h("div", { "data-message-id": "message-1" }, "a"),
      },
    });
    const root = wrapper.find(".ant-message-scroller");

    expect(root.classes()).toContain("scroller-class");
    expect(root.classes()).toContain("scroller-flag");
    expect(root.attributes("style")).toContain("color: rgb(1, 2, 3)");
  });

  it("merges an object class and style attribute passed to the host element", () => {
    const wrapper = mount(MessageScroller, {
      attrs: {
        class: { "scroller-object": true },
        style: { marginTop: "3px" },
      },
      slots: {
        default: () => h("div", { "data-message-id": "message-1" }, "a"),
      },
    });
    const root = wrapper.find(".ant-message-scroller");

    expect(root.classes()).toContain("scroller-object");
    expect(root.attributes("style")).toContain("margin-top: 3px");
  });

  it("resolves function-form semantic classes and styles", () => {
    const wrapper = mount(MessageScroller, {
      props: {
        classes: () => ({ content: "calculated-content" }),
        styles: () => ({ viewport: { marginTop: "6px" } }),
      },
      slots: {
        default: () => h("div", { "data-message-id": "message-1" }, "a"),
      },
    });

    expect(wrapper.find(CONTENT_SELECTOR).classes()).toContain(
      "calculated-content",
    );
    expect(wrapper.find(VIEWPORT_SELECTOR).attributes("style")).toContain(
      "margin-top: 6px",
    );
  });

  it("installs MessageScroller and XProProvider through app.use", () => {
    const component = vi.fn();
    const app = { component } as unknown as App;

    (MessageScroller as unknown as { install: (app: App) => void }).install(
      app,
    );
    (XProProvider as unknown as { install: (app: App) => void }).install(app);

    expect(component).toHaveBeenCalledWith("AMessageScroller", MessageScroller);
    expect(component).toHaveBeenCalledWith("AXProProvider", XProProvider);
  });
});
