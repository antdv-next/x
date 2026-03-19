import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vite-plus/test";
import { h } from "vue";

import ActionsCopy from "../ActionsCopy";

describe("ActionsCopy", () => {
  it("renders with text", () => {
    const wrapper = mount(ActionsCopy, {
      props: {
        text: "hello",
      },
    });

    expect(wrapper.find(".antd-actions-copy").exists()).toBe(true);
  });

  it("renders with no text", () => {
    const wrapper = mount(ActionsCopy);
    expect(wrapper.find(".antd-actions-copy").exists()).toBe(true);
  });

  it("accepts icon prop", () => {
    const wrapper = mount(ActionsCopy, {
      props: {
        text: "copy",
        icon: h("span", { class: "copy-icon" }, "copy-icon"),
      },
    });

    expect(wrapper.find(".antd-actions-copy").exists()).toBe(true);
  });

  it("supports custom class and prefixCls", () => {
    const wrapper = mount(ActionsCopy, {
      props: {
        text: "test",
        class: "my-class",
        prefixCls: "my-prefix",
      },
    });

    expect(wrapper.find(".my-class").exists()).toBe(true);
    expect(wrapper.find(".my-prefix-copy").exists()).toBe(true);
  });

  it("supports rootClass", () => {
    const wrapper = mount(ActionsCopy, {
      props: {
        text: "test",
        rootClass: "root-class",
      },
    });

    expect(wrapper.find(".root-class").exists()).toBe(true);
  });
});
