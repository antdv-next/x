import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vite-plus/test";
import { h } from "vue";

import Item from "../Item";

describe("ThoughtChain.Item", () => {
  it("renders with default variant (solid)", () => {
    const wrapper = mount(Item, {
      props: { title: "Task" },
    });

    const el = wrapper.find(".antd-thought-chain-item");
    expect(el.exists()).toBe(true);
    expect(el.classes()).toContain("antd-thought-chain-item-solid");
  });

  it("renders outlined variant", () => {
    const wrapper = mount(Item, {
      props: { title: "Task", variant: "outlined" },
    });

    expect(wrapper.find(".antd-thought-chain-item-outlined").exists()).toBe(
      true,
    );
  });

  it("renders text variant", () => {
    const wrapper = mount(Item, {
      props: { title: "Task", variant: "text" },
    });

    expect(wrapper.find(".antd-thought-chain-item-text").exists()).toBe(true);
  });

  it("renders title and description", () => {
    const wrapper = mount(Item, {
      props: { title: "Title", description: "Desc" },
    });

    expect(wrapper.find(".antd-thought-chain-item-title").text()).toBe("Title");
    expect(wrapper.find(".antd-thought-chain-item-description").text()).toBe(
      "Desc",
    );
  });

  it("applies title-with-description class when description exists", () => {
    const wrapper = mount(Item, {
      props: { title: "Title", description: "Desc" },
    });

    expect(
      wrapper.find(".antd-thought-chain-item-title-with-description").exists(),
    ).toBe(true);
  });

  it("renders custom icon", () => {
    const wrapper = mount(Item, {
      props: {
        title: "Task",
        icon: h("span", { class: "my-icon" }, "⚡"),
      },
    });

    expect(wrapper.find(".my-icon").exists()).toBe(true);
  });

  it("supports iconRender, title and description slots", () => {
    const wrapper = mount(Item, {
      props: {
        title: "Prop Title",
        description: "Prop Description",
        icon: h("span", { class: "prop-icon" }, "⚡"),
        status: "success",
      },
      slots: {
        iconRender: ({ originNode, status }: any) => (
          <span class="slot-icon">{`${status}-${originNode ? "origin" : "none"}`}</span>
        ),
        title: ({ originNode }: any) => (
          <span class="slot-title">{`${originNode}-slot`}</span>
        ),
        description: ({ originNode }: any) => (
          <span class="slot-description">{`${originNode}-slot`}</span>
        ),
      },
    });

    expect(wrapper.find(".slot-icon").text()).toBe("success-origin");
    expect(wrapper.find(".slot-title").text()).toBe("Prop Title-slot");
    expect(wrapper.find(".slot-description").text()).toBe(
      "Prop Description-slot",
    );
    expect(wrapper.find(".prop-icon").exists()).toBe(false);
  });

  it("renders status icon instead of custom icon", () => {
    const wrapper = mount(Item, {
      props: {
        title: "Task",
        icon: h("span", { class: "custom" }),
        status: "success",
      },
    });

    expect(wrapper.find(".custom").exists()).toBe(false);
    expect(wrapper.find(".antd-thought-chain-status-success").exists()).toBe(
      true,
    );
  });

  it("applies click class when onClick is provided", () => {
    const wrapper = mount(Item, {
      props: { title: "Task", onClick: vi.fn() },
    });

    expect(wrapper.find(".antd-thought-chain-item-click").exists()).toBe(true);
  });

  it("calls onClick handler", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Item, {
      props: { title: "Task", onClick },
    });

    await wrapper.find(".antd-thought-chain-item").trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Item, {
      props: { title: "Task", onClick, disabled: true },
    });

    await wrapper.find(".antd-thought-chain-item").trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies disabled class", () => {
    const wrapper = mount(Item, {
      props: { title: "Task", disabled: true },
    });

    expect(wrapper.find(".antd-thought-chain-item-disabled").exists()).toBe(
      true,
    );
  });

  it("applies error class when status=error", () => {
    const wrapper = mount(Item, {
      props: { title: "Task", status: "error" },
    });

    expect(wrapper.find(".antd-thought-chain-item-error").exists()).toBe(true);
  });

  it("applies blink class when blink=true", () => {
    const wrapper = mount(Item, {
      props: { title: "Task", blink: true },
    });

    expect(wrapper.find(".antd-thought-chain-motion-blink").exists()).toBe(
      true,
    );
  });

  it("renders semantic classes and styles", () => {
    const wrapper = mount(Item, {
      props: {
        title: "Task",
        description: "Desc",
        icon: h("span", "⚡"),
        classes: {
          root: "root-cls",
          icon: "icon-cls",
          title: "title-cls",
          description: "desc-cls",
        },
        styles: {
          root: { padding: "4px" },
          title: { color: "red" },
        },
      },
    });

    expect(wrapper.find(".root-cls").exists()).toBe(true);
    expect(wrapper.find(".icon-cls").exists()).toBe(true);
    expect(wrapper.find(".title-cls").exists()).toBe(true);
    expect(wrapper.find(".desc-cls").exists()).toBe(true);
  });
});
