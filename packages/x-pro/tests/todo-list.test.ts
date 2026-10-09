import type { VueWrapper } from "@vue/test-utils";
import type { Plugin } from "vue";

import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, h, nextTick, ref } from "vue";

import type { TodoItem, TodoListRef } from "../src/todo-list/types";

import { TodoList, XProProvider } from "../src/index";
import xProZhCN from "../src/locale/zh_CN";

const HEADER_SELECTOR = ".ant-todo-list-header";
const ITEM_SELECTOR = ".ant-todo-list-item";
const CONTENT_SELECTOR = ".ant-todo-list-content";
const STATUS_SELECTOR = ".ant-todo-list-status";
const COUNTER_SELECTOR = ".ant-todo-list-header-counter";

function todo(
  id: string,
  status?: TodoItem["status"],
  extra: Partial<TodoItem> = {},
): TodoItem {
  return { id, title: `Task ${id}`, status, ...extra };
}

function mountTodo(
  props: Record<string, unknown> = {},
  slots: Record<string, (slotProps: any) => unknown> = {},
) {
  return mount(TodoList, {
    attachTo: document.body,
    props: {
      items: [todo("1"), todo("2")],
      ...props,
    },
    slots,
  });
}

function find(root: Element, selector: string) {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`Missing ${selector}`);
  }

  return element;
}

function lastPayload(wrapper: VueWrapper, event: string) {
  const events = wrapper.emitted(event);
  return events?.[events.length - 1];
}

/**
 * 折叠过渡需要额外一帧才会把内容从 DOM 中移除。
 */
async function flushFrames() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe("TodoList", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exports TodoList from the package entry", async () => {
    const mod = await import("../src/index");
    expect(mod.TodoList).toBeDefined();
  });

  it("renders every item with its status", () => {
    const wrapper = mountTodo({
      items: [
        todo("1", "pending"),
        todo("2", "in-progress", { progress: 30 }),
        todo("3", "completed"),
        todo("4", "cancelled"),
      ],
    });

    const items = wrapper.findAll(ITEM_SELECTOR);
    expect(items).toHaveLength(4);
    expect(items.map(item => item.attributes("data-status"))).toEqual([
      "pending",
      "in-progress",
      "completed",
      "cancelled",
    ]);

    const statuses = wrapper.findAll(`${ITEM_SELECTOR} > ${STATUS_SELECTOR}`);
    expect(statuses).toHaveLength(4);
    expect(
      statuses.map(status =>
        status.classes().find(name => name.startsWith("ant-todo-list-status-")),
      ),
    ).toEqual([
      "ant-todo-list-status-pending",
      "ant-todo-list-status-in-progress",
      "ant-todo-list-status-completed",
      "ant-todo-list-status-cancelled",
    ]);
  });

  it("labels each row status for assistive technology", () => {
    const wrapper = mountTodo({
      items: [todo("1", "completed"), todo("2", "cancelled")],
    });

    const labels = wrapper
      .findAll(".ant-todo-list-item-status-text")
      .map(node => node.text());

    expect(labels).toEqual(["Completed", "Cancelled"]);
  });

  it("renders the completed counter and its accessibility state", () => {
    const wrapper = mountTodo({
      items: [todo("1", "completed"), todo("2", "pending"), todo("3")],
    });

    expect(wrapper.find(COUNTER_SELECTOR).text()).toBe("1 of 3 completed");

    const header = wrapper.find(HEADER_SELECTOR);
    expect(header.attributes("aria-expanded")).toBe("true");
    expect(header.attributes("aria-controls")).toBe("ant-todo-list-content");
  });

  it("uses translated labels from the XPro locale", () => {
    const wrapper = mount(XProProvider, {
      props: { locale: xProZhCN },
      slots: {
        default: () =>
          h(TodoList, {
            title: "发布计划",
            items: [todo("1", "completed"), todo("2")],
          }),
      },
    });

    expect(wrapper.find(COUNTER_SELECTOR).text()).toBe("已完成 1 / 2");
    expect(wrapper.findAll(".ant-todo-list-item-status-text")[1]?.text()).toBe(
      "待处理",
    );
  });

  it("toggles open state and emits both open events", async () => {
    const wrapper = mountTodo();

    await wrapper.find(HEADER_SELECTOR).trigger("click");

    expect(lastPayload(wrapper, "update:open")).toEqual([false]);
    expect(lastPayload(wrapper, "openChange")).toEqual([false]);
    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "false",
    );
  });

  it("honours defaultOpen for the uncontrolled initial state", () => {
    const wrapper = mountTodo({ defaultOpen: false });

    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "false",
    );
  });

  it("follows a controlled open prop without mutating it", async () => {
    const wrapper = mountTodo({ open: true });

    await wrapper.find(HEADER_SELECTOR).trigger("click");

    // 受控宿主没接住这次广播，视图保持宿主的取值。
    expect(lastPayload(wrapper, "openChange")).toEqual([false]);
    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "true",
    );

    await wrapper.setProps({ open: false });
    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "false",
    );
  });

  it("auto-collapses once every task reaches a terminal state", async () => {
    const wrapper = mountTodo({
      items: [todo("1", "completed"), todo("2", "in-progress")],
    });

    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "true",
    );

    await wrapper.setProps({
      items: [todo("1", "completed"), todo("2", "cancelled")],
    });

    expect(lastPayload(wrapper, "openChange")).toEqual([false]);
    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "false",
    );
  });

  it("does not auto-collapse when collapseOnComplete is off", async () => {
    const wrapper = mountTodo({
      collapseOnComplete: false,
      items: [todo("1", "completed"), todo("2", "completed")],
    });

    await wrapper.setProps({
      items: [todo("1", "completed"), todo("2", "completed")],
    });

    expect(wrapper.emitted("openChange")).toBeUndefined();
    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "true",
    );
  });

  it("does not auto-collapse an empty list", async () => {
    const wrapper = mountTodo({ items: [] });

    await wrapper.setProps({ items: [] });

    expect(wrapper.emitted("openChange")).toBeUndefined();
  });

  it("re-opens when a new task arrives after an auto-collapse", async () => {
    const wrapper = mountTodo({
      items: [todo("1", "completed")],
    });

    await wrapper.setProps({ items: [todo("1", "completed")] });
    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "false",
    );

    await wrapper.setProps({
      items: [todo("1", "completed"), todo("2", "pending")],
    });

    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "true",
    );
  });

  /**
   * 自动展开只撤销「自己造成的」折叠：用户手动收起面板后，新增任务不得把它顶开。
   */
  it("keeps a manual collapse when a new task arrives", async () => {
    const wrapper = mountTodo({
      items: [todo("1", "completed"), todo("2", "completed")],
    });

    await wrapper.find(HEADER_SELECTOR).trigger("click");
    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "false",
    );

    await wrapper.setProps({
      items: [
        todo("1", "completed"),
        todo("2", "completed"),
        todo("3", "pending"),
      ],
    });

    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "false",
    );
  });

  it("prefers the itemTitle and itemDetail slots over the props", () => {
    const wrapper = mountTodo(
      { items: [todo("1", undefined, { detail: "from prop" })] },
      {
        itemTitle: ({ item }: { item: TodoItem }) =>
          h("em", { class: "slot-title" }, `slot:${item.id}`),
        itemDetail: () => h("i", { class: "slot-detail" }, "slot detail"),
      },
    );

    expect(wrapper.find(".slot-title").text()).toBe("slot:1");
    expect(wrapper.find(".slot-detail").text()).toBe("slot detail");
    expect(wrapper.text()).not.toContain("from prop");
  });

  it("renders the header slot in place of the title", () => {
    const wrapper = mountTodo(
      { items: [todo("1", "completed"), todo("2")] },
      {
        header: ({ completed, total }: { completed: number; total: number }) =>
          h("strong", { class: "slot-header" }, `${completed}/${total} done`),
      },
    );

    expect(wrapper.find(".slot-header").text()).toBe("1/2 done");
  });

  it("merges semantic classes and styles, with props winning", () => {
    const wrapper = mountTodo({
      items: [todo("1", "completed")],
      classes: { item: "custom-item" },
      styles: { item: { color: "red" } },
    });

    const item = wrapper.find(ITEM_SELECTOR);
    expect(item.classes()).toContain("custom-item");
    expect(item.attributes("style")).toContain("color: red");
  });

  it("takes title and collapse defaults from the XProProvider config", async () => {
    const wrapper = mount(XProProvider, {
      props: {
        todoList: { title: "Provider plan", collapseOnComplete: false },
      },
      slots: {
        default: () =>
          h(TodoList, { items: [todo("1", "completed"), todo("2")] }),
      },
    });

    expect(wrapper.find(".ant-todo-list-header-title").text()).toBe(
      "Provider plan",
    );

    await wrapper.setProps({});
    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "true",
    );
  });

  it("lets component props override the provider config", () => {
    const wrapper = mount(XProProvider, {
      props: { todoList: { title: "Provider plan" } },
      slots: {
        default: () => h(TodoList, { title: "Local plan", items: [todo("1")] }),
      },
    });

    expect(wrapper.find(".ant-todo-list-header-title").text()).toBe(
      "Local plan",
    );
  });

  it("exposes imperative helpers through the ref", async () => {
    const wrapper = mountTodo();
    const api = wrapper.vm as unknown as TodoListRef;

    expect(api.open).toBe(true);
    expect(api.nativeElement).toBeInstanceOf(HTMLElement);
    expect(api.viewportElement).toBeInstanceOf(HTMLElement);

    api.setOpen(false);
    await nextTick();

    expect(api.open).toBe(false);
    expect(lastPayload(wrapper, "openChange")).toEqual([false]);
  });

  it("scrolls the content container when a task is added while open", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    const wrapper = mountTodo({ items: [todo("1")] });
    const viewport = find(wrapper.element, CONTENT_SELECTOR);
    // 真正滚动的是内容层，而实例上的 viewportElement 必须指向它。
    expect((wrapper.vm as unknown as TodoListRef).viewportElement).toBe(
      viewport,
    );
    const scrollTo = vi.fn();
    Object.defineProperty(viewport, "scrollHeight", {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(viewport, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });

    await wrapper.setProps({ items: [todo("1"), todo("2")] });
    frames.forEach(cb => cb(0));

    expect(scrollTo).toHaveBeenCalledWith({ top: 600, behavior: "smooth" });
  });

  it("uses instant scrolling under reduced motion", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    const wrapper = mountTodo({ items: [todo("1")] });
    const viewport = find(wrapper.element, CONTENT_SELECTOR);
    const scrollTo = vi.fn();
    Object.defineProperty(viewport, "scrollHeight", {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(viewport, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });

    await wrapper.setProps({ items: [todo("1"), todo("2")] });
    frames.forEach(cb => cb(0));

    expect(scrollTo).toHaveBeenCalledWith({ top: 600, behavior: "auto" });
  });

  it("does not scroll when a task is removed", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    const wrapper = mountTodo({ items: [todo("1"), todo("2")] });
    const viewport = find(wrapper.element, CONTENT_SELECTOR);
    const scrollTo = vi.fn();
    Object.defineProperty(viewport, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });

    await wrapper.setProps({ items: [todo("1")] });
    frames.forEach(cb => cb(0));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("unmounts the list content when collapsed", async () => {
    const wrapper = mountTodo({ defaultOpen: true });

    expect(wrapper.find(CONTENT_SELECTOR).exists()).toBe(true);

    await wrapper.find(HEADER_SELECTOR).trigger("click");
    await flushFrames();

    expect(wrapper.find(CONTENT_SELECTOR).exists()).toBe(false);
  });

  it("marks the root as open and passes direction through", () => {
    const wrapper = mountTodo();

    expect(wrapper.find(".ant-todo-list").classes()).toContain(
      "ant-todo-list-open",
    );
  });

  it("keeps class and style out of the attribute passthrough", () => {
    const wrapper = mount(TodoList, {
      attachTo: document.body,
      props: { items: [todo("1")], class: "host-class", "data-probe": "x" },
    });

    const root = wrapper.find(".ant-todo-list");
    expect(root.classes()).toContain("host-class");
    expect(root.attributes("data-probe")).toBe("x");
  });

  it("is inert without items", () => {
    const wrapper = mountTodo({ items: [] });

    expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(0);
    expect(wrapper.find(COUNTER_SELECTOR).text()).toBe("0 of 0 completed");
  });

  it("writes the max height onto the scroll container", () => {
    const wrapper = mountTodo({ maxHeight: 320, items: [todo("1")] });

    expect(wrapper.find(CONTENT_SELECTOR).attributes("style")).toContain(
      "max-height: 320px",
    );
  });

  it("accepts a ref of items like a real host would", async () => {
    const items = ref<TodoItem[]>([todo("1")]);
    const wrapper = mount(TodoList, {
      attachTo: document.body,
      props: { items: items.value },
    });

    items.value = [todo("1"), todo("2")];
    await wrapper.setProps({ items: items.value });

    expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(2);
  });

  it("registers itself as a global component on install", () => {
    const app = createApp({ render: () => null });
    app.use(TodoList as unknown as Plugin);

    expect(app.component("ATodoList")).toBe(TodoList);
  });

  it("honours a later defaultOpen change while uncontrolled", async () => {
    const wrapper = mountTodo({ defaultOpen: true });

    await wrapper.setProps({ defaultOpen: false });

    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "false",
    );
  });

  it("ignores a defaultOpen change while controlled", async () => {
    const wrapper = mountTodo({ open: true });

    await wrapper.setProps({ defaultOpen: false });

    // 受控时 `open` 说了算，`defaultOpen` 只提供非受控初值。
    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "true",
    );
  });

  it("lets the host re-open a controlled panel and forgets the auto-collapse", async () => {
    const wrapper = mountTodo({
      open: true,
      items: [todo("1", "completed"), todo("2", "in-progress")],
    });

    // 全部终态触发自动折叠，但受控宿主忽略这次广播，视图仍是展开的。
    await wrapper.setProps({
      open: true,
      items: [todo("1", "completed"), todo("2", "completed")],
    });
    expect(lastPayload(wrapper, "openChange")).toEqual([false]);

    // 宿主自己把 open 拨到 true：自动折叠标记作废，之后再来任务不会重复广播。
    await wrapper.setProps({
      open: true,
      items: [todo("1", "completed"), todo("2", "completed")],
    });
    await wrapper.setProps({
      open: true,
      items: [
        todo("1", "completed"),
        todo("2", "completed"),
        todo("3", "pending"),
      ],
    });

    expect(wrapper.emitted("openChange")).toHaveLength(1);
  });

  it("lets the host drive setOpen imperatively without flipping the flag back", async () => {
    const wrapper = mountTodo({ open: true });

    (wrapper.vm as unknown as TodoListRef).setOpen(false);
    await nextTick();

    expect(lastPayload(wrapper, "openChange")).toEqual([false]);

    // 受控宿主没接住，视图保持 true；但内部已记为手动操作，
    // 因此再来一个待办也不会被自动展开逻辑改写。
    await wrapper.setProps({
      open: true,
      items: [todo("1", "completed"), todo("2", "pending")],
    });

    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "true",
    );
  });

  it("scrolls to the end through the ref, with an explicit behavior", async () => {
    const wrapper = mountTodo();
    const viewport = find(wrapper.element, CONTENT_SELECTOR);
    const scrollTo = vi.fn();
    Object.defineProperty(viewport, "scrollHeight", {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(viewport, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });

    (wrapper.vm as unknown as TodoListRef).scrollToEnd({ behavior: "auto" });

    expect(scrollTo).toHaveBeenCalledWith({ top: 500, behavior: "auto" });
  });

  it("falls back to scrollTop when the element has no scrollTo", async () => {
    const wrapper = mountTodo();
    const viewport = find(wrapper.element, CONTENT_SELECTOR);
    Object.defineProperty(viewport, "scrollHeight", {
      configurable: true,
      value: 320,
    });
    Object.defineProperty(viewport, "scrollTo", {
      configurable: true,
      value: undefined,
    });

    (wrapper.vm as unknown as TodoListRef).scrollToEnd({ behavior: "auto" });

    expect(viewport.scrollTop).toBe(320);
  });

  it("cancels a pending scroll frame when a second batch arrives", async () => {
    const cancelAnimationFrame = vi.fn();
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);

    const wrapper = mountTodo({ items: [todo("1")] });

    await wrapper.setProps({ items: [todo("1"), todo("2")] });
    await wrapper.setProps({ items: [todo("1"), todo("2"), todo("3")] });

    // 第一帧还没跑就又来了一批，上一帧必须取消，否则会滚两次。
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  it("cancels a pending scroll frame on unmount", async () => {
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal("requestAnimationFrame", () => 7);
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);

    const wrapper = mountTodo({ items: [todo("1")] });

    await wrapper.setProps({ items: [todo("1"), todo("2")] });
    wrapper.unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
  });

  it("does not schedule a scroll frame on unmount without a pending one", () => {
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);

    const wrapper = mountTodo();
    wrapper.unmount();

    expect(cancelAnimationFrame).not.toHaveBeenCalled();
  });

  it("scrollToEnd is a no-op before the viewport exists", () => {
    const wrapper = mountTodo({ defaultOpen: false });
    const api = wrapper.vm as unknown as TodoListRef;

    expect(api.viewportElement).toBeNull();
    expect(() => api.scrollToEnd()).not.toThrow();
  });

  it("does not follow a new task while the panel is collapsed", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    const wrapper = mountTodo({ defaultOpen: false, items: [todo("1")] });

    await wrapper.setProps({ items: [todo("1"), todo("2")] });

    // 折叠时容器高度为 0，滚动既无意义也看不见，连帧都不该排。
    expect(frames).toHaveLength(0);
  });

  it("reports null elements once unmounted", () => {
    const wrapper = mountTodo();
    const api = wrapper.vm as unknown as TodoListRef;

    wrapper.unmount();

    expect(api.nativeElement).toBeNull();
    expect(api.viewportElement).toBeNull();
  });

  it("forgets an auto-collapse once the host re-opens it", async () => {
    const wrapper = mountTodo({
      open: false,
      items: [todo("1", "completed"), todo("2", "completed")],
    });

    // 宿主把 open 从 false 拨到 true：自动折叠标记作废。
    await wrapper.setProps({
      open: true,
      items: [todo("1", "completed"), todo("2", "completed")],
    });

    expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
      "true",
    );
  });

  it("renders an empty list when items is omitted", () => {
    const wrapper = mount(TodoList, { attachTo: document.body });

    expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(0);
    expect(wrapper.find(COUNTER_SELECTOR).text()).toBe("0 of 0 completed");
  });
});
