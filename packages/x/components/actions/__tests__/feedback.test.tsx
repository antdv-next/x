import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vite-plus/test";

import ActionsFeedback from "../ActionsFeedback";

describe("ActionsFeedback", () => {
  it("renders feedback component", () => {
    const wrapper = mount(ActionsFeedback);
    expect(wrapper.find(".antd-actions-feedback").exists()).toBe(true);
  });

  it("toggles like value", async () => {
    const onChange = vi.fn();

    const wrapper = mount(ActionsFeedback, {
      props: {
        value: "default",
        onChange,
      },
    });

    await wrapper.find(".antd-actions-feedback-item-like").trigger("click");
    expect(onChange).toHaveBeenCalledWith("like");

    await wrapper.setProps({ value: "like" });
    await wrapper
      .find(".antd-actions-feedback-item-like-active")
      .trigger("click");
    expect(onChange).toHaveBeenCalledWith("default");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("toggles dislike value", async () => {
    const onChange = vi.fn();

    const wrapper = mount(ActionsFeedback, {
      props: {
        value: "default",
        onChange,
      },
    });

    await wrapper.find(".antd-actions-feedback-item-dislike").trigger("click");
    expect(onChange).toHaveBeenCalledWith("dislike");

    await wrapper.setProps({ value: "dislike" });
    await wrapper
      .find(".antd-actions-feedback-item-dislike-active")
      .trigger("click");
    expect(onChange).toHaveBeenCalledWith("default");
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
