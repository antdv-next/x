import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vite-plus/test";
import { h } from "vue";

import DividerBubble from "../Divider";

describe("Bubble.Divider", () => {
  it("renders basic divider bubble", () => {
    const wrapper = mount(DividerBubble, {
      props: {
        content: "分割线内容",
      },
    });

    expect(wrapper.find(".antd-bubble").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-divider").exists()).toBe(true);
    expect(wrapper.find(".ant-divider").exists()).toBe(true);
    expect(wrapper.text()).toContain("分割线内容");
  });

  it("supports empty content", () => {
    const wrapper = mount(DividerBubble);
    expect(wrapper.find(".ant-divider").exists()).toBe(true);
  });

  it("supports custom prefixCls and node content", () => {
    const wrapper = mount(DividerBubble, {
      props: {
        prefixCls: "custom-bubble",
        content: h("span", { class: "custom-content" }, "自定义内容") as any,
      },
    });

    expect(wrapper.find(".custom-bubble").exists()).toBe(true);
    expect(wrapper.find(".custom-content").exists()).toBe(true);
  });

  it("passes dividerProps", () => {
    const wrapper = mount(DividerBubble, {
      props: {
        content: "分割线",
        dividerProps: {
          dashed: true,
          plain: true,
        },
      },
    });

    const divider = wrapper.find(".ant-divider");
    expect(divider.exists()).toBe(true);
    expect(divider.classes()).toContain("ant-divider-dashed");
    expect(divider.classes()).toContain("ant-divider-plain");
  });

  it("supports custom class and style", () => {
    const wrapper = mount(DividerBubble, {
      props: {
        content: "测试",
        class: "custom-class",
        style: { backgroundColor: "red" },
      },
    });

    const bubble = wrapper.find(".antd-bubble-divider");
    expect(bubble.classes()).toContain("custom-class");
    expect((bubble.element as HTMLElement).style.backgroundColor).toBe("red");
  });
});
