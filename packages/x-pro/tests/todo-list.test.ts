import type { VueWrapper } from "@vue/test-utils";
import type { Plugin } from "vue";

import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, createCommentVNode, h, nextTick, ref } from "vue";

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

  describe("tree expansion", () => {
    const tree = (): TodoItem[] => [
      {
        id: "a",
        title: "Parent",
        status: "in-progress",
        children: [todo("a-1"), todo("a-2")],
      },
      todo("plain"),
    ];
    const EXPAND_SELECTOR = ".ant-todo-list-item-expand-icon";
    const EXTRA_SELECTOR = ".ant-todo-list-item-extra";
    const TITLE_SELECTOR = ".ant-todo-list-item-title";

    it("adds an expand affordance only to rows with children", () => {
      const wrapper = mountTodo({ items: tree() });
      const rows = wrapper.findAll(ITEM_SELECTOR);

      expect(rows[0]!.find(EXPAND_SELECTOR).exists()).toBe(true);
      expect(rows[1]!.find(EXPAND_SELECTOR).exists()).toBe(false);
      expect(rows[0]!.attributes("data-depth")).toBe("0");
      expect(rows[0]!.find(EXPAND_SELECTOR).attributes("aria-expanded")).toBe(
        "false",
      );
    });

    it("renders the nested list only after expanding, then hides it again", async () => {
      const wrapper = mountTodo({ items: tree() });

      expect(wrapper.find(EXTRA_SELECTOR).exists()).toBe(false);
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(2);

      await wrapper.find(EXPAND_SELECTOR).trigger("click");

      const rows = wrapper.findAll(ITEM_SELECTOR);
      expect(rows).toHaveLength(4);
      expect(rows[1]!.attributes("data-depth")).toBe("1");
      expect(rows[1]!.attributes("data-index")).toBe("0");
      expect(wrapper.find(".ant-todo-list-list-nested").exists()).toBe(true);
      expect(wrapper.find(EXPAND_SELECTOR).attributes("aria-expanded")).toBe(
        "true",
      );

      await wrapper.find(EXPAND_SELECTOR).trigger("click");
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(2);
    });

    it("toggles expansion by clicking the title of an expandable row", async () => {
      const wrapper = mountTodo({ items: tree() });
      const firstTitle = wrapper.findAll(TITLE_SELECTOR)[0]!;

      expect(firstTitle.attributes("role")).toBe("button");
      expect(firstTitle.attributes("tabindex")).toBe("0");
      expect(firstTitle.attributes("aria-expanded")).toBe("false");
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(2);

      await firstTitle.trigger("click");
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(4);
      expect(firstTitle.attributes("aria-expanded")).toBe("true");

      await firstTitle.trigger("click");
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(2);
    });

    it("toggles expansion with Enter / Space on the focused title", async () => {
      const wrapper = mountTodo({ items: tree() });
      const firstTitle = wrapper.findAll(TITLE_SELECTOR)[0]!;

      const enter = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      });
      firstTitle.element.dispatchEvent(enter);
      await nextTick();
      expect(enter.defaultPrevented).toBe(true);
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(4);

      const space = new KeyboardEvent("keydown", {
        key: " ",
        bubbles: true,
        cancelable: true,
      });
      firstTitle.element.dispatchEvent(space);
      await nextTick();
      expect(space.defaultPrevented).toBe(true);
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(2);
    });

    it.each([
      ["link", () => h("a", { class: "title-control", href: "#" }, "Link")],
      ["button", () => h("button", { class: "title-control" }, "Button")],
      ["input", () => h("input", { class: "title-control" })],
      ["textarea", () => h("textarea", { class: "title-control" })],
      ["select", () => h("select", { class: "title-control" })],
      [
        "custom button",
        () =>
          h(
            "span",
            { class: "title-control", role: "button", tabindex: 0 },
            "Button",
          ),
      ],
      [
        "editable content",
        () =>
          h(
            "span",
            { contenteditable: "true" },
            h("span", { class: "title-control" }, "Edit"),
          ),
      ],
      [
        "nested button content",
        () =>
          h("button", null, h("span", { class: "title-control" }, "Button")),
      ],
    ] as const)(
      "preserves Enter / Space events from a title %s",
      async (_name, renderControl) => {
        const wrapper = mountTodo(
          { items: tree() },
          { itemTitle: () => renderControl() },
        );
        const control = wrapper.find(".title-control");

        for (const key of ["Enter", " "]) {
          const event = new KeyboardEvent("keydown", {
            key,
            bubbles: true,
            cancelable: true,
          });
          control.element.dispatchEvent(event);
          await nextTick();

          expect(event.defaultPrevented).toBe(false);
          expect(wrapper.find(TITLE_SELECTOR).attributes("aria-expanded")).toBe(
            "false",
          );
          expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(2);
          expect(wrapper.emitted("expandedKeysChange")).toBeUndefined();
          expect(wrapper.emitted("update:expandedKeys")).toBeUndefined();
        }
      },
    );

    it("does not toggle when an interactive element inside the title is clicked", async () => {
      const wrapper = mountTodo(
        { items: tree() },
        {
          itemTitle: ({ item }: any) =>
            h("a", { class: "title-link", href: "#" }, item.title),
        },
      );

      await wrapper.find(".title-link").trigger("click");
      // 点链接不应连带折叠/展开这一行。
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(2);
    });

    it("keeps a leaf title non-interactive", () => {
      const wrapper = mountTodo({ items: tree() });
      const plainTitle = wrapper.findAll(TITLE_SELECTOR)[1]!;

      expect(plainTitle.attributes("role")).toBeUndefined();
      expect(plainTitle.attributes("tabindex")).toBeUndefined();
      expect(plainTitle.attributes("aria-expanded")).toBeUndefined();
    });

    it("honours defaultExpandedKeys for the uncontrolled initial state", () => {
      const wrapper = mountTodo({
        items: tree(),
        defaultExpandedKeys: ["a"],
      });

      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(4);
    });

    it("does not reset user expansion when a literal default array is re-created", async () => {
      const wrapper = mountTodo({
        items: tree(),
        defaultExpandedKeys: [],
      });
      const api = wrapper.vm as unknown as TodoListRef;
      api.setExpandedKeys(["a"]);
      await nextTick();

      await wrapper.setProps({
        title: "Updated title",
        defaultExpandedKeys: [],
      });
      await nextTick();

      expect(api.expandedKeys).toEqual(["a"]);
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(4);
    });

    it("follows a controlled expandedKeys prop and broadcasts changes", async () => {
      const wrapper = mountTodo({ items: tree(), expandedKeys: [] });

      await wrapper.find(EXPAND_SELECTOR).trigger("click");

      expect(lastPayload(wrapper, "expandedKeysChange")).toEqual([["a"]]);
      expect(lastPayload(wrapper, "update:expandedKeys")).toEqual([["a"]]);
      // 受控宿主没接住，视图仍按 props 保持收起。
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(2);

      await wrapper.setProps({ expandedKeys: ["a"] });
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(4);
    });

    it("lets itemExtra take over the expanded area and receive its context", async () => {
      const wrapper = mountTodo(
        { items: tree() },
        {
          itemExtra: ({ item, depth, expanded }: any) =>
            item.id === "a"
              ? h(
                  "div",
                  { class: "custom-extra" },
                  `${item.id}:${depth}:${expanded}`,
                )
              : null,
        },
      );

      expect(wrapper.findAll(EXPAND_SELECTOR)).toHaveLength(1);

      await wrapper.find(EXPAND_SELECTOR).trigger("click");
      expect(wrapper.find(".custom-extra").text()).toBe("a:0:true");
      // 插槽优先：默认子清单不再渲染。
      expect(wrapper.find(".ant-todo-list-list-nested").exists()).toBe(false);
    });

    it("hides the expand affordance on leaves without content, even with an itemExtra slot", () => {
      // 树：a 有子任务，a-1 / a-2 是纯叶子；插槽只对不存在的行返回内容。
      const wrapper = mountTodo(
        { items: tree() },
        {
          itemExtra: ({ item }: any) =>
            item.id === "nothing" ? h("div", "extra") : null,
        },
      );

      const rows = wrapper.findAll(ITEM_SELECTOR);
      expect(rows).toHaveLength(2);
      // 只有 a 有子任务可展开；plain 是叶子且插槽没给它内容。
      expect(rows[0]!.find(EXPAND_SELECTOR).exists()).toBe(true);
      expect(rows[1]!.find(EXPAND_SELECTOR).exists()).toBe(false);
      expect(wrapper.findAll(EXPAND_SELECTOR)).toHaveLength(1);
    });

    it("still expands a leaf that has itemExtra content gated by v-if", () => {
      // 常见于 `v-if="expanded && ..."`：探测阶段须按展开态取值，
      // 否则有内容的叶子会被误判成无箭头。
      const wrapper = mountTodo(
        { items: [todo("leaf")] },
        {
          itemExtra: ({ expanded }: any) =>
            expanded ? h("div", { class: "gated-extra" }, "detail") : null,
        },
      );

      expect(wrapper.findAll(EXPAND_SELECTOR)).toHaveLength(1);
      expect(wrapper.find(".gated-extra").exists()).toBe(false);
    });

    it("falls back to the child list when itemExtra renders a comment node", async () => {
      // Vue 把 v-if 为假的分支编译成注释 VNode；它不应盖掉默认子清单。
      const wrapper = mountTodo(
        { items: tree(), defaultExpandedKeys: ["a"] },
        {
          itemExtra: ({ item }: any) =>
            item.id === "a" ? createCommentVNode("v-if") : null,
        },
      );

      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(4);
      expect(wrapper.find(".ant-todo-list-list-nested").exists()).toBe(true);
    });

    it("uses itemExpandIcon over the built-in arrow", () => {
      const wrapper = mountTodo(
        { items: tree() },
        {
          itemExpandIcon: () => h("span", { class: "custom-icon" }, "+"),
        },
      );

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });

    it("toggles when a custom expand icon is clicked", async () => {
      const wrapper = mountTodo(
        { items: tree() },
        {
          itemExpandIcon: ({ expanded }: any) =>
            h("span", { class: "icon-proxy" }, expanded ? "open" : "closed"),
        },
      );

      expect(wrapper.find(".icon-proxy").text()).toBe("closed");
      // 图标只是视觉，点击由组件外层按钮统一处理。
      await wrapper.find(EXPAND_SELECTOR).trigger("click");
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(4);
      expect(wrapper.find(".icon-proxy").text()).toBe("open");
    });

    it("counts top-level rows by default and all rows with recursiveCount", () => {
      const items: TodoItem[] = [
        {
          id: "a",
          title: "a",
          status: "completed",
          children: [todo("a-1", "completed"), todo("a-2", "pending")],
        },
      ];

      expect(mountTodo({ items }).find(COUNTER_SELECTOR).text()).toBe(
        "1 of 1 completed",
      );
      expect(
        mountTodo({ items, recursiveCount: true })
          .find(COUNTER_SELECTOR)
          .text(),
      ).toBe("2 of 3 completed");
    });

    it("exposes expandedKeys helpers through the ref", async () => {
      const wrapper = mountTodo({ items: tree() });
      const api = wrapper.vm as unknown as TodoListRef;

      expect(api.expandedKeys).toEqual([]);

      api.expandAll();
      await nextTick();
      expect(api.expandedKeys).toEqual(["a"]);
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(4);
      expect(lastPayload(wrapper, "expandedKeysChange")).toEqual([["a"]]);

      api.collapseAll();
      await nextTick();
      expect(api.expandedKeys).toEqual([]);
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(2);

      api.setExpandedKeys(["a"]);
      await nextTick();
      expect(wrapper.findAll(ITEM_SELECTOR)).toHaveLength(4);
    });

    it("expands only rows whose itemExtra is available at their real position", async () => {
      const wrapper = mountTodo(
        {
          items: [
            {
              ...todo("root"),
              children: [todo("nested"), todo("nested-extra")],
            },
          ],
        },
        {
          itemExtra: ({ item, depth, index }: any) =>
            depth === 1 && index === 1
              ? h("div", { class: "nested-extra" }, item.id)
              : null,
        },
      );

      const api = wrapper.vm as unknown as TodoListRef;
      api.expandAll();
      await nextTick();

      expect(api.expandedKeys).toEqual(["root", "nested-extra"]);
      expect(wrapper.find(".nested-extra").text()).toBe("nested-extra");
    });

    it("does not collect descendants hidden by a non-expandable parent", async () => {
      const wrapper = mountTodo({
        items: [
          {
            ...todo("closed"),
            expandable: false,
            children: [{ ...todo("hidden"), children: [todo("deeper")] }],
          },
          { ...todo("open"), children: [todo("visible")] },
        ],
      });
      const api = wrapper.vm as unknown as TodoListRef;

      api.expandAll();
      await nextTick();

      expect(api.expandedKeys).toEqual(["open"]);
    });

    it("keeps row transition classes aligned with generated styles", async () => {
      const wrapper = mount(TodoList, {
        attachTo: document.body,
        global: { stubs: { transition: false } },
        props: {
          items: [{ ...todo("a"), children: [todo("a-1")] }],
        },
      });

      await wrapper.find(EXPAND_SELECTOR).trigger("click");
      expect(wrapper.find(EXTRA_SELECTOR).classes()).toContain(
        "ant-todo-list-item-extra-motion-enter-active",
      );
      const styles = [...document.querySelectorAll("style")]
        .map(style => style.textContent ?? "")
        .join("\n");
      expect(styles).toMatch(
        /\.ant-todo-list-item-extra-motion-enter-active\s*\{[^}]*transition:[^}]*height/,
      );
    });

    it("handles empty trees and duplicate ids in expandAll", async () => {
      const empty = mountTodo({ items: [] });
      (empty.vm as unknown as TodoListRef).expandAll();
      await nextTick();
      expect((empty.vm as unknown as TodoListRef).expandedKeys).toEqual([]);

      const duplicate = mountTodo({
        items: [
          { ...todo("same"), children: [todo("child")] },
          { ...todo("same"), children: [todo("child")] },
        ],
      });
      (duplicate.vm as unknown as TodoListRef).expandAll();
      await nextTick();
      expect((duplicate.vm as unknown as TodoListRef).expandedKeys).toEqual([
        "same",
      ]);
    });

    it("does not auto-collapse while a child is still running under recursiveCount", async () => {
      const wrapper = mountTodo({
        items: [
          {
            id: "a",
            title: "a",
            status: "completed",
            children: [todo("a-1", "in-progress")],
          },
        ],
        recursiveCount: true,
      });

      await wrapper.setProps({
        items: [
          {
            id: "a",
            title: "a",
            status: "completed",
            children: [todo("a-1", "in-progress")],
          },
        ],
      });

      // 子树还有 in-progress，统计口径未全终态，因此不折叠。
      expect(wrapper.emitted("openChange")).toBeUndefined();
      expect(wrapper.find(HEADER_SELECTOR).attributes("aria-expanded")).toBe(
        "true",
      );
    });
  });
});
