import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vite-plus/test";
import { h } from "vue";

import SystemBubble from "../System";

describe("Bubble.System", () => {
  it("renders basic system bubble", () => {
    const wrapper = mount(SystemBubble, {
      props: {
        content: "系统消息",
      },
    });

    expect(wrapper.find(".antd-bubble").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-system").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-content").text()).toContain("系统消息");
  });

  it("supports empty and node content", () => {
    const emptyWrapper = mount(SystemBubble, {
      props: {
        content: "",
      },
    });

    expect(emptyWrapper.find(".antd-bubble-content").exists()).toBe(true);

    const nodeWrapper = mount(SystemBubble, {
      props: {
        content: h("div", { class: "custom-content" }, "自定义内容") as any,
      },
    });

    expect(nodeWrapper.find(".custom-content").exists()).toBe(true);
  });

  it("supports custom prefix", () => {
    const wrapper = mount(SystemBubble, {
      props: {
        prefixCls: "custom-bubble",
        content: "测试内容",
      },
    });

    expect(wrapper.find(".custom-bubble").exists()).toBe(true);
  });

  it("supports different variants", async () => {
    const wrapper = mount(SystemBubble, {
      props: {
        content: "测试",
        variant: "shadow",
      },
    });

    expect(wrapper.find(".antd-bubble-content-shadow").exists()).toBe(true);

    await wrapper.setProps({ variant: "filled" });
    expect(wrapper.find(".antd-bubble-content-filled").exists()).toBe(true);

    await wrapper.setProps({ variant: "outlined" });
    expect(wrapper.find(".antd-bubble-content-outlined").exists()).toBe(true);

    await wrapper.setProps({ variant: "borderless" });
    expect(wrapper.find(".antd-bubble-content-borderless").exists()).toBe(true);
  });

  it("supports different shapes", async () => {
    const wrapper = mount(SystemBubble, {
      props: {
        content: "测试",
        shape: "default",
      },
    });

    expect(wrapper.find(".antd-bubble-content-default").exists()).toBe(true);

    await wrapper.setProps({ shape: "round" });
    expect(wrapper.find(".antd-bubble-content-round").exists()).toBe(true);

    await wrapper.setProps({ shape: "corner" });
    expect(wrapper.find(".antd-bubble-content-corner").exists()).toBe(true);
  });

  it("supports class, style and rootClass", () => {
    const wrapper = mount(SystemBubble, {
      props: {
        content: "测试",
        class: "custom-class",
        style: { padding: "10px" },
        rootClass: "root-class",
      },
    });

    const bubble = wrapper.find(".antd-bubble");
    expect(bubble.classes()).toContain("custom-class");
    expect(bubble.classes()).toContain("root-class");
    expect((bubble.element as HTMLElement).style.padding).toBe("10px");
  });
});
