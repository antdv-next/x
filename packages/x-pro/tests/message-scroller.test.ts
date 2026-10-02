import type { VueWrapper } from "@vue/test-utils";

import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";

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
});
