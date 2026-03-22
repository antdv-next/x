import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import Sender from "..";

describe("Sender", () => {
  it("should render with default props", () => {
    const wrapper = mount(Sender);
    expect(wrapper.find(".antd-sender").exists()).toBe(true);
    expect(wrapper.find(".antd-sender-content").exists()).toBe(true);
    expect(wrapper.find(".antd-sender-input").exists()).toBe(true);
  });

  it("should render with custom prefixCls", () => {
    const wrapper = mount(Sender, {
      props: { prefixCls: "custom-sender" },
    });
    expect(wrapper.find(".custom-sender").exists()).toBe(true);
  });

  it("should render disabled state", () => {
    const wrapper = mount(Sender, {
      props: { disabled: true },
    });
    expect(wrapper.find(".antd-sender-disabled").exists()).toBe(true);
  });

  it("should handle value changes", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Sender, {
      props: { onChange },
    });

    const textarea = wrapper.find("textarea");
    await textarea.setValue("hello");
    expect(onChange).toHaveBeenCalledWith("hello", expect.anything());
  });

  it("should support controlled value", async () => {
    const wrapper = mount(Sender, {
      props: { value: "controlled" },
    });

    const textarea = wrapper.find("textarea");
    expect(textarea.element.value).toBe("controlled");
  });

  it("should trigger onSubmit on Enter", async () => {
    const onSubmit = vi.fn();
    const wrapper = mount(Sender, {
      props: {
        defaultValue: "test message",
        onSubmit,
      },
    });

    const textarea = wrapper.find("textarea");
    await textarea.trigger("keydown", { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("test message");
  });

  it("should not trigger onSubmit on Shift+Enter", async () => {
    const onSubmit = vi.fn();
    const wrapper = mount(Sender, {
      props: {
        defaultValue: "test",
        onSubmit,
      },
    });

    const textarea = wrapper.find("textarea");
    await textarea.trigger("keydown", { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should trigger onSubmit on Shift+Enter when submitType is shiftEnter", async () => {
    const onSubmit = vi.fn();
    const wrapper = mount(Sender, {
      props: {
        defaultValue: "test",
        submitType: "shiftEnter",
        onSubmit,
      },
    });

    const textarea = wrapper.find("textarea");
    await textarea.trigger("keydown", {
      key: "Enter",
      shiftKey: true,
    });
    expect(onSubmit).toHaveBeenCalledWith("test");
  });

  it("should not submit when loading", async () => {
    const onSubmit = vi.fn();
    const wrapper = mount(Sender, {
      props: {
        defaultValue: "test",
        loading: true,
        onSubmit,
      },
    });

    const textarea = wrapper.find("textarea");
    await textarea.trigger("keydown", { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should render send button", () => {
    const wrapper = mount(Sender);
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("should render loading button when loading", () => {
    const wrapper = mount(Sender, {
      props: { loading: true },
    });
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("should render placeholder", () => {
    const wrapper = mount(Sender, {
      props: { placeholder: "Type something..." },
    });
    const textarea = wrapper.find("textarea");
    expect(textarea.attributes("placeholder")).toBe("Type something...");
  });

  it("should render with prefix", () => {
    const wrapper = mount(Sender, {
      props: { prefix: h("span", { class: "my-prefix" }, "P") },
    });
    expect(wrapper.find(".antd-sender-prefix").exists()).toBe(true);
    expect(wrapper.find(".my-prefix").exists()).toBe(true);
  });

  it("should render with footer", () => {
    const wrapper = mount(Sender, {
      props: { footer: h("span", { class: "my-footer" }, "F") },
    });
    expect(wrapper.find(".antd-sender-footer").exists()).toBe(true);
    expect(wrapper.find(".my-footer").exists()).toBe(true);
  });

  it("should expose ref methods", () => {
    const wrapper = mount(Sender);
    const vm = wrapper.vm as any;
    expect(typeof vm.focus).toBe("function");
    expect(typeof vm.blur).toBe("function");
    expect(typeof vm.clear).toBe("function");
  });
});

describe("Sender.Header", () => {
  it("should render when open", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true, title: "Header Title" },
    });
    expect(wrapper.text()).toContain("Header Title");
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
        default: () => h("div", { class: "custom-content" }, "Content"),
      },
    });
    expect(wrapper.find(".custom-content").exists()).toBe(true);
  });
});

describe("Sender.Switch", () => {
  it("should render unchecked by default", () => {
    const wrapper = mount(Sender.Switch, {
      props: {
        checkedChildren: "On",
        unCheckedChildren: "Off",
      },
    });
    expect(wrapper.text()).toContain("Off");
  });

  it("should toggle on click", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Sender.Switch, {
      props: {
        checkedChildren: "On",
        unCheckedChildren: "Off",
        onChange,
      },
    });

    await wrapper.find("button").trigger("click");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should support controlled value", () => {
    const wrapper = mount(Sender.Switch, {
      props: {
        value: true,
        checkedChildren: "On",
        unCheckedChildren: "Off",
      },
    });
    expect(wrapper.text()).toContain("On");
  });

  it("should render icon", () => {
    const wrapper = mount(Sender.Switch, {
      props: {
        icon: h("span", { class: "my-icon" }, "I"),
      },
    });
    expect(wrapper.find(".my-icon").exists()).toBe(true);
  });

  it("should apply checked class", () => {
    const wrapper = mount(Sender.Switch, {
      props: { value: true },
    });
    expect(
      wrapper.find("[class*='switch-checked']").exists(),
    ).toBe(true);
  });
});
