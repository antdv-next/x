import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import CarouselCard from "../components/CarouselCard";
import Sources from "../index";

describe("Sources", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const items = [
    {
      key: "1",
      title: "First source",
      description: "First description",
      icon: <span class="default-icon">I1</span>,
      url: "https://example.com/1",
    },
    {
      key: "2",
      title: "Second source",
      description: "Second description",
      icon: <span class="default-icon">I2</span>,
      url: "https://example.com/2",
    },
  ];

  it("supports title slot", () => {
    const wrapper = mount(Sources, {
      props: {
        title: "Used 2 sources",
        items,
      },
      slots: {
        title: ({ originNode }: any) => (
          <span class="custom-title">{`${originNode}-slot`}</span>
        ),
      },
    });

    expect(wrapper.find(".custom-title").text()).toBe("Used 2 sources-slot");
  });

  it("supports item slots in expand mode", () => {
    const wrapper = mount(Sources, {
      props: {
        title: "Used 2 sources",
        items,
      },
      slots: {
        iconRender: ({ item, index }: any) => (
          <span class={`slot-icon-${index}`}>{item.key}</span>
        ),
        titleRender: ({ item, originNode }: any) => (
          <span class="slot-item-title">{`${originNode}-${item.key}`}</span>
        ),
        description: ({ item }: any) => (
          <span class="slot-description">{`desc-${item.key}`}</span>
        ),
      },
    });

    expect(wrapper.find(".slot-icon-0").text()).toBe("1");
    expect(wrapper.findAll(".slot-item-title")[0]?.text()).toBe(
      "First source-1",
    );
    expect(wrapper.findAll(".slot-description")[0]?.text()).toBe("desc-1");
  });

  it("emits update:expanded when title is clicked", async () => {
    const wrapper = mount(Sources, {
      props: {
        title: "Used 2 sources",
        items,
        defaultExpanded: true,
      },
    });

    await wrapper.find(".antdx-sources-title-wrapper").trigger("click");

    expect(wrapper.emitted("update:expanded")).toEqual([[false]]);
    expect(wrapper.emitted("expand")).toEqual([[false]]);
  });

  it("supports item slots in carousel card", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    const wrapper = mount(CarouselCard, {
      props: {
        prefixCls: "antdx-sources",
        items,
        activeKey: "1",
        iconRenderSlot: ({ item }: any) => (
          <span class="inline-slot-icon">{item.key}</span>
        ),
        titleRenderSlot: ({ item }: any) => (
          <span class="inline-slot-title">{item.title}</span>
        ),
        descriptionSlot: ({ item }: any) => (
          <span class="inline-slot-description">{item.description}</span>
        ),
      } as any,
    });

    expect(wrapper.find(".inline-slot-icon").text()).toBe("1");
    expect(wrapper.find(".inline-slot-title").text()).toBe("First source");
    expect(wrapper.find(".inline-slot-description").text()).toBe(
      "First description",
    );

    openSpy.mockRestore();
  });
});
