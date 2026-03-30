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

  it("supports Bubble-compatible slots on BubbleList", () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: [
          {
            key: "slot-item",
            role: "ai",
            content: "Slot content",
            status: "success",
            extraInfo: { trace: "trace-id" },
          },
          {
            key: "slot-loading",
            role: "ai",
            content: "Loading content",
            loading: true,
            status: "loading",
          },
        ] as any,
      },
      slots: {
        avatar: ({ info, index, role }: any) => (
          <div class="list-avatar-slot">{`avatar-${info.key}-${index}-${role}`}</div>
        ),
        header: ({ content, info, item, index, role }: any) => (
          <div class="list-header-slot">
            {`${content}-${info.key}-${item.key}-${index}-${role}`}
          </div>
        ),
        footer: ({ info, item }: any) => (
          <div class="list-footer-slot">{`footer-${info.key}-${item.key}`}</div>
        ),
        extra: ({ item }: any) => (
          <div class="list-extra-slot">{`extra-${item.extraInfo?.trace}`}</div>
        ),
        contentRender: ({ content, info, item, index, role }: any) => (
          <div class="list-content-slot">
            {`${content}-${info.key}-${item.key}-${index}-${role}`}
          </div>
        ),
        loadingRender: ({ content, info, item, index, role }: any) => (
          <div class="list-loading-slot">
            {`${content}-${info.key}-${item.key}-${index}-${role}`}
          </div>
        ),
      },
    });

    expect(wrapper.find(".list-avatar-slot").exists()).toBe(true);
    expect(wrapper.find(".list-header-slot").exists()).toBe(true);
    expect(wrapper.find(".list-footer-slot").exists()).toBe(true);
    expect(wrapper.find(".list-extra-slot").exists()).toBe(true);
    expect(wrapper.find(".list-content-slot").exists()).toBe(true);
    expect(wrapper.find(".list-loading-slot").exists()).toBe(true);
    expect(wrapper.text()).toContain("Slot content-slot-item-slot-item-0-ai");
    expect(wrapper.text()).toContain(
      "Loading content-slot-loading-slot-loading-1-ai",
    );
  });

  it("prefers BubbleList slots over item render props", () => {
    const wrapper = mount(BubbleList, {
      props: {
        items: [
          {
            key: "priority-normal",
            role: "ai",
            content: "Priority content",
            avatar: () => <div class="item-avatar-priority">item-avatar</div>,
            header: () => <div class="item-header-priority">item-header</div>,
            footer: () => <div class="item-footer-priority">item-footer</div>,
            extra: () => <div class="item-extra-priority">item-extra</div>,
            contentRender: () => (
              <div class="item-content-priority">item-content</div>
            ),
          },
          {
            key: "priority-loading",
            role: "ai",
            content: "Priority loading",
            loading: true,
            loadingRender: () => (
              <div class="item-loading-priority">item-loading</div>
            ),
          },
        ] as any,
      },
      slots: {
        avatar: ({ info }: any) => (
          <div class="list-avatar-priority">{`slot-avatar-${info.key}`}</div>
        ),
        header: ({ info }: any) => (
          <div class="list-header-priority">{`slot-header-${info.key}`}</div>
        ),
        footer: ({ info }: any) => (
          <div class="list-footer-priority">{`slot-footer-${info.key}`}</div>
        ),
        extra: ({ info }: any) => (
          <div class="list-extra-priority">{`slot-extra-${info.key}`}</div>
        ),
        contentRender: ({ info }: any) => (
          <div class="list-content-priority">{`slot-content-${info.key}`}</div>
        ),
        loadingRender: ({ info }: any) => (
          <div class="list-loading-priority">{`slot-loading-${info.key}`}</div>
        ),
      },
    });

    expect(wrapper.find(".list-avatar-priority").exists()).toBe(true);
    expect(wrapper.find(".list-header-priority").exists()).toBe(true);
    expect(wrapper.find(".list-footer-priority").exists()).toBe(true);
    expect(wrapper.find(".list-extra-priority").exists()).toBe(true);
    expect(wrapper.find(".list-content-priority").exists()).toBe(true);
    expect(wrapper.find(".list-loading-priority").exists()).toBe(true);

    expect(wrapper.find(".item-avatar-priority").exists()).toBe(false);
    expect(wrapper.find(".item-header-priority").exists()).toBe(false);
    expect(wrapper.find(".item-footer-priority").exists()).toBe(false);
    expect(wrapper.find(".item-extra-priority").exists()).toBe(false);
    expect(wrapper.find(".item-content-priority").exists()).toBe(false);
    expect(wrapper.find(".item-loading-priority").exists()).toBe(false);
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
