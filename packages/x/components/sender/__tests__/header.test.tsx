import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Sender from "..";

beforeEach(() => {
  document.head.innerHTML = "";
});

describe("Sender.Header", () => {
  it("should use sender default prefix class", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true },
    });
    expect(wrapper.find(".antd-sender-header").exists()).toBe(true);
  });

  it("should inherit prefix class from Sender context", () => {
    const wrapper = mount(Sender, {
      props: {
        prefixCls: "custom-sender",
        header: () => <Sender.Header open title="Header Title" />,
      },
    });
    expect(wrapper.find(".custom-sender-header").exists()).toBe(true);
  });

  it("should render when open", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true, title: "Header Title" },
    });
    expect(wrapper.text()).toContain("Header Title");
  });

  it("should support title slot", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true, title: "Prop Title" },
      slots: {
        title: () => <span class="header-slot-title">Slot Title</span>,
      },
    });
    expect(wrapper.find(".header-slot-title").exists()).toBe(true);
    expect(wrapper.text()).toContain("Slot Title");
    expect(wrapper.text()).not.toContain("Prop Title");
  });

  it("should not render content when closed", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: false, title: "Hidden" },
    });
    expect(wrapper.text()).not.toContain("Hidden");
  });

  it("should call onOpenChange when close clicked", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(Sender.Header, {
      props: { open: true, title: "Test", onOpenChange },
    });

    const closeBtn = wrapper.find("button");
    await closeBtn.trigger("click");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should hide close button when closable is false", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true, title: "Test", closable: false },
    });
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("should render slot content", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true },
      slots: {
        default: () => <div class="custom-content">Content</div>,
      },
    });
    expect(wrapper.find(".custom-content").exists()).toBe(true);
  });
});
