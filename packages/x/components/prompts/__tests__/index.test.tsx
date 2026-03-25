import { mount, VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { h, nextTick } from "vue";

import Prompts from "../index";

const wrappers: VueWrapper[] = [];

function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper);
  return wrapper;
}

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
});

const items = [
  {
    key: "1",
    label: "Label 1",
    description: "Description 1",
    icon: h("span", { class: "prompt-icon-1" }, "Icon 1"),
  },
  {
    key: "2",
    label: "Label 2",
    description: "Description 2",
    icon: h("span", { class: "prompt-icon-2" }, "Icon 2"),
    disabled: true,
  },
];

const nestedItems = [
  {
    key: "parent",
    label: "Parent Label",
    description: "Parent Description",
    children: [
      {
        key: "child-1",
        label: "Child Label 1",
        description: "Child Description 1",
      },
      {
        key: "child-2",
        label: "Child Label 2",
        description: "Child Description 2",
        disabled: true,
      },
    ],
  },
];

describe("Prompts", () => {
  it("supports expose ref", () => {
    const wrapper = track(
      mount(Prompts, {
        props: {
          items,
        },
      }),
    );

    expect((wrapper.vm as any).nativeElement).toBeInstanceOf(HTMLDivElement);
  });

  it("renders title, labels, descriptions and icons", () => {
    const wrapper = track(
      mount(Prompts, {
        props: {
          title: "Test Title",
          items,
        },
      }),
    );

    expect(wrapper.find(".antd-prompts-title").text()).toBe("Test Title");
    expect(wrapper.findAll(".antd-prompts-item")).toHaveLength(2);
    expect(wrapper.text()).toContain("Label 1");
    expect(wrapper.text()).toContain("Description 1");
    expect(wrapper.find(".prompt-icon-1").exists()).toBe(true);
    expect(wrapper.find(".prompt-icon-2").exists()).toBe(true);
  });

  it("emits itemClick when a clickable item is clicked", async () => {
    const wrapper = track(
      mount(Prompts, {
        props: {
          items,
        },
      }),
    );

    await wrapper.findAll(".antd-prompts-item")[0]!.trigger("click");

    expect(wrapper.emitted("itemClick")).toBeTruthy();
    expect(wrapper.emitted("itemClick")).toHaveLength(1);
    expect(wrapper.emitted("itemClick")![0]).toEqual([
      {
        data: expect.objectContaining({
          key: "1",
          label: "Label 1",
        }),
      },
    ]);
  });

  it("does not emit itemClick for disabled items", async () => {
    const wrapper = track(
      mount(Prompts, {
        props: {
          items,
        },
      }),
    );

    await wrapper.findAll(".antd-prompts-item")[1]!.trigger("click");

    expect(wrapper.emitted("itemClick")).toBeFalsy();
    expect(wrapper.find(".antd-prompts-item-disabled").exists()).toBe(true);
  });

  it("supports vertical and wrap layout classes", () => {
    const wrapper = track(
      mount(Prompts, {
        props: {
          items,
          vertical: true,
          wrap: true,
        },
      }),
    );

    const list = wrapper.get(".antd-prompts-list");
    expect(list.classes()).toContain("antd-prompts-list-vertical");
    expect(list.classes()).toContain("antd-prompts-list-wrap");
  });

  it("renders nested items and ignores parent click", async () => {
    const wrapper = track(
      mount(Prompts, {
        props: {
          items: nestedItems,
        },
      }),
    );

    const promptItems = wrapper.findAll(".antd-prompts-item");

    expect(wrapper.text()).toContain("Parent Label");
    expect(wrapper.text()).toContain("Child Label 1");
    expect(wrapper.find(".antd-prompts-item-has-nest").exists()).toBe(true);
    expect(wrapper.find(".antd-prompts-nested").exists()).toBe(true);

    await promptItems[0]!.trigger("click");
    expect(wrapper.emitted("itemClick")).toBeFalsy();

    await promptItems[1]!.trigger("click");
    expect(wrapper.emitted("itemClick")).toHaveLength(1);
    expect(wrapper.emitted("itemClick")![0]).toEqual([
      {
        data: expect.objectContaining({
          key: "child-1",
          label: "Child Label 1",
        }),
      },
    ]);
  });

  it("supports custom semantic classes", () => {
    const wrapper = track(
      mount(Prompts, {
        props: {
          title: "Styled Title",
          items,
          classes: {
            root: "custom-root",
            list: "custom-list",
            item: "custom-item",
            itemContent: "custom-content",
            title: "custom-title",
            subList: "custom-sub-list",
            subItem: "custom-sub-item",
          },
        },
      }),
    );

    expect(wrapper.find(".custom-root").exists()).toBe(true);
    expect(wrapper.find(".custom-list").exists()).toBe(true);
    expect(wrapper.find(".custom-item").exists()).toBe(true);
    expect(wrapper.find(".custom-content").exists()).toBe(true);
    expect(wrapper.find(".custom-title").exists()).toBe(true);
  });

  it("applies fadeIn motion classes on mount", async () => {
    const wrapper = track(
      mount(Prompts, {
        props: {
          items,
          fadeIn: true,
        },
      }),
    );

    await nextTick();

    expect(wrapper.classes().some(cls => cls.includes("ant-x-fade"))).toBe(
      true,
    );
  });

  it("applies fadeInLeft motion classes on mount", async () => {
    const wrapper = track(
      mount(Prompts, {
        props: {
          items,
          fadeInLeft: true,
        },
      }),
    );

    await nextTick();

    expect(wrapper.classes().some(cls => cls.includes("ant-x-fade-left"))).toBe(
      true,
    );
  });
});
