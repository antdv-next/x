import { mount } from "@vue/test-utils";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { nextTick } from "vue";

import BubbleList from "../BubbleList";

const mockItems = [
  {
    key: "item1",
    role: "user",
    content: "用户消息1",
  },
  {
    key: "item2",
    role: "ai",
    content: "AI回复1",
  },
] as any;

let scrollToMock: ReturnType<typeof vi.fn>;
let scrollIntoViewMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollToMock = vi.fn();
  scrollIntoViewMock = vi.fn();

  Object.defineProperty(Element.prototype, "scrollTo", {
    configurable: true,
    value: scrollToMock,
  });
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoViewMock,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Bubble.List", () => {
  it("renders basic list and supports expose ref", () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
      },
    });

    expect(wrapper.find(".antd-bubble-list").exists()).toBe(true);
    expect(wrapper.findAll(".antd-bubble")).toHaveLength(2);
    expect((wrapper.vm as any).nativeElement).toBeInstanceOf(HTMLElement);
    expect(typeof (wrapper.vm as any).scrollTo).toBe("function");
  });

  it("supports custom prefixCls", () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        prefixCls: "custom-bubble",
      },
    });

    expect(wrapper.find(".custom-bubble-list").exists()).toBe(true);
  });

  it("supports custom class and style", () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        class: "custom-class",
        style: { backgroundColor: "red" },
        rootClass: "root-class",
      },
    });

    const list = wrapper.find(".antd-bubble-list");
    expect(list.classes()).toContain("custom-class");
    expect(list.classes()).toContain("root-class");
    expect((list.element as HTMLElement).style.backgroundColor).toBe("red");
  });

  it("supports role configuration", () => {
    const role = {
      user: {
        placement: "end",
      },
      ai: {
        placement: "start",
      },
    } as const;

    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        role,
      },
    });

    const bubbles = wrapper.findAll(".antd-bubble");
    expect(bubbles[0]?.classes()).toContain("antd-bubble-end");
    expect(bubbles[1]?.classes()).toContain("antd-bubble-start");
  });

  it("supports role function configuration", () => {
    const role = {
      user: () => ({ placement: "end" as const }),
      ai: () => ({ placement: "start" as const }),
    };

    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        role,
      },
    });

    const bubbles = wrapper.findAll(".antd-bubble");
    expect(bubbles[0]?.classes()).toContain("antd-bubble-end");
    expect(bubbles[1]?.classes()).toContain("antd-bubble-start");
  });

  it("lets item props override role config", () => {
    const role = {
      user: {
        placement: "end",
      },
    } as const;

    const items = [
      {
        key: "item1",
        role: "user",
        content: "用户消息",
        placement: "start",
      },
    ] as any;

    const wrapper = mount(BubbleList, {
      props: {
        items,
        role,
      },
    });

    expect(wrapper.find(".antd-bubble-start").exists()).toBe(true);
  });

  it("renders divider and system roles by default", () => {
    const wrapper = mount(BubbleList, {
      props: {
        autoScroll: false,
        items: [
          {
            key: "d1",
            role: "divider",
            content: "分割线",
          },
          {
            key: "s1",
            role: "system",
            content: "系统消息",
          },
        ] as any,
      },
    });

    expect(wrapper.find(".antd-bubble-divider").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-system").exists()).toBe(true);
  });

  it("triggers onScroll callback", async () => {
    const onScroll = vi.fn();

    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        onScroll,
      },
    });

    await wrapper.find(".antd-bubble-list-scroll-box").trigger("scroll");
    expect(onScroll).toHaveBeenCalledTimes(1);
  });

  it("supports toggling autoScroll class", async () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        autoScroll: true,
      },
    });

    expect(wrapper.find(".antd-bubble-list-autoscroll").exists()).toBe(true);

    await wrapper.setProps({ autoScroll: false });
    expect(wrapper.find(".antd-bubble-list-autoscroll").exists()).toBe(false);
  });

  it("supports scrollTo by top and alias positions", () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        autoScroll: false,
      },
    });

    const scrollBox = wrapper.find(".antd-bubble-list-scroll-box")
      .element as HTMLDivElement;
    Object.defineProperty(scrollBox, "scrollHeight", {
      configurable: true,
      value: 1000,
    });

    scrollToMock.mockClear();

    (wrapper.vm as any).scrollTo({ top: 100, behavior: "auto" });
    expect(scrollToMock).toHaveBeenCalledWith({ top: 100, behavior: "auto" });

    (wrapper.vm as any).scrollTo({ top: "bottom", behavior: "smooth" });
    expect(scrollToMock).toHaveBeenCalledWith({
      top: 1000,
      behavior: "smooth",
    });

    (wrapper.vm as any).scrollTo({ top: "top", behavior: "smooth" });
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("supports scrollTo mapping when autoScroll is enabled", () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        autoScroll: true,
      },
    });

    const scrollBox = wrapper.find(".antd-bubble-list-scroll-box")
      .element as HTMLDivElement;
    Object.defineProperty(scrollBox, "scrollHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(scrollBox, "clientHeight", {
      configurable: true,
      value: 300,
    });

    scrollToMock.mockClear();

    (wrapper.vm as any).scrollTo({ top: 100, behavior: "auto" });
    expect(scrollToMock).toHaveBeenCalledWith({ top: -600, behavior: "auto" });

    (wrapper.vm as any).scrollTo({ top: "bottom", behavior: "smooth" });
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    (wrapper.vm as any).scrollTo({ top: "top", behavior: "smooth" });
    expect(scrollToMock).toHaveBeenCalledWith({
      top: -1000,
      behavior: "smooth",
    });
  });

  it("supports scrollTo by key", async () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        autoScroll: false,
      },
    });

    await nextTick();
    scrollIntoViewMock.mockClear();

    (wrapper.vm as any).scrollTo({
      key: "item2",
      behavior: "smooth",
      block: "center",
    });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
  });

  it("supports scrollTo by key when autoScroll is enabled", async () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        autoScroll: true,
      },
    });

    await nextTick();
    scrollIntoViewMock.mockClear();

    (wrapper.vm as any).scrollTo({
      key: "item1",
      behavior: "smooth",
      block: "end",
    });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "end",
    });
  });

  it("forwards instant behavior in scrollTo", () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
        autoScroll: true,
      },
    });

    const scrollBox = wrapper.find(".antd-bubble-list-scroll-box")
      .element as HTMLDivElement;
    Object.defineProperty(scrollBox, "scrollHeight", {
      configurable: true,
      value: 1000,
    });

    scrollToMock.mockClear();
    (wrapper.vm as any).scrollTo({ top: "bottom", behavior: "instant" });

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: "instant",
    });
  });

  it("handles non-existent key and empty scroll options", () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: mockItems,
      },
    });

    scrollToMock.mockClear();
    scrollIntoViewMock.mockClear();

    (wrapper.vm as any).scrollTo({ key: "not-exists", behavior: "smooth" });
    (wrapper.vm as any).scrollTo({ behavior: "smooth" });

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it("handles empty items", () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: [],
      },
    });

    expect(wrapper.find(".antd-bubble-list").exists()).toBe(true);
    expect(wrapper.findAll(".antd-bubble")).toHaveLength(0);
  });
});
