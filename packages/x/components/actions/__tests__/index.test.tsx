import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vite-plus/test";
import { h } from "vue";

import { findItem } from "../ActionsMenu";
import Actions from "../index";

describe("Actions", () => {
  it("supports expose ref", () => {
    const wrapper = mount(Actions, {
      props: {
        items: [{ key: "1", label: "Action 1", icon: h("span", "icon1") }],
      },
    });

    expect((wrapper.vm as any).nativeElement).toBeInstanceOf(HTMLElement);
  });

  it("renders action icons", () => {
    const wrapper = mount(Actions, {
      props: {
        items: [
          {
            key: "1",
            label: "Action 1",
            icon: h("span", { class: "icon-1" }, "icon1"),
          },
          {
            key: "2",
            label: "Action 2",
            icon: h("span", { class: "icon-2" }, "icon2"),
          },
        ],
      },
    });

    expect(wrapper.find(".icon-1").exists()).toBe(true);
    expect(wrapper.find(".icon-2").exists()).toBe(true);
  });

  it("calls onClick when an action item is clicked", async () => {
    const onClick = vi.fn();

    const wrapper = mount(Actions, {
      props: {
        items: [
          {
            key: "1",
            label: "Action 1",
            icon: h("span", { class: "icon-1" }, "icon1"),
          },
        ],
        onClick,
      },
    });

    await wrapper.find(".icon-1").trigger("click");

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "1",
        keyPath: ["1"],
        item: expect.objectContaining({ key: "1", label: "Action 1" }),
      }),
    );
  });

  it("prefers item onItemClick over onClick", async () => {
    const onClick = vi.fn();
    const onItemClick = vi.fn();

    const wrapper = mount(Actions, {
      props: {
        items: [
          {
            key: "2",
            label: "Action 2",
            icon: h("span", { class: "icon-2" }, "icon2"),
            onItemClick,
          },
        ],
        onClick,
      },
    });

    await wrapper.find(".icon-2").trigger("click");

    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders danger item class", () => {
    const wrapper = mount(Actions, {
      props: {
        items: [
          {
            key: "danger",
            label: "Danger Action",
            icon: h("span", "danger-icon"),
            danger: true,
          },
        ],
      },
    });

    expect(wrapper.find(".antd-actions-list-danger").exists()).toBe(true);
  });

  it("renders custom actionRender", () => {
    const actionRender = vi.fn(() =>
      h("div", { class: "custom-action-render" }, "Custom"),
    );

    const wrapper = mount(Actions, {
      props: {
        items: [
          {
            key: "custom",
            label: "Custom Action",
            actionRender,
          },
        ],
      },
    });

    expect(actionRender).toHaveBeenCalledTimes(1);
    expect(wrapper.find(".custom-action-render").exists()).toBe(true);
  });

  it("renders sub item trigger when subItems are provided", () => {
    const wrapper = mount(Actions, {
      props: {
        items: [
          {
            key: "menu",
            label: "Menu",
            subItems: [{ key: "sub-1", label: "Sub Item" }],
          },
        ],
      },
    });

    expect(wrapper.find(".antd-actions-sub-item").exists()).toBe(true);
  });
});

describe("ActionsMenu.findItem", () => {
  const items = [
    { key: "1", label: "Action 1" },
    {
      key: "2",
      label: "Action 2",
      subItems: [
        { key: "2-1", label: "Sub Action 1" },
        { key: "2-2", label: "Sub Action 2" },
      ],
    },
    { key: "3", label: "Action 3" },
  ];

  it("returns root item", () => {
    expect(findItem(["1"], items as any)).toEqual(items[0]);
  });

  it("returns nested item", () => {
    expect(findItem(["2", "2-1"], items as any)).toEqual(
      items[1]?.subItems?.[0],
    );
  });

  it("returns null for unknown key", () => {
    expect(findItem(["4"], items as any)).toBeNull();
  });

  it("returns null for unknown nested key", () => {
    expect(findItem(["2", "2-3"], items as any)).toBeNull();
  });

  it("returns null for empty keyPath", () => {
    expect(findItem([], items as any)).toBeNull();
  });
});
