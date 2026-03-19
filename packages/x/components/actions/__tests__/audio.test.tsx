import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vite-plus/test";

import ActionsAudio from "../ActionsAudio";
import { ACTIONS_ITEM_STATUS } from "../ActionsItem";

describe("ActionsAudio", () => {
  it("renders default status", () => {
    const wrapper = mount(ActionsAudio);
    expect(wrapper.find(".antd-actions-audio").exists()).toBe(true);
  });

  it("renders loading status", () => {
    const wrapper = mount(ActionsAudio, {
      props: {
        status: ACTIONS_ITEM_STATUS.LOADING,
      },
    });

    expect(wrapper.find(".antd-actions-audio-loading").exists()).toBe(true);
  });

  it("renders running status", () => {
    const wrapper = mount(ActionsAudio, {
      props: {
        status: ACTIONS_ITEM_STATUS.RUNNING,
      },
    });

    expect(wrapper.find(".antd-actions-audio-running").exists()).toBe(true);
  });

  it("renders error status", () => {
    const wrapper = mount(ActionsAudio, {
      props: {
        status: ACTIONS_ITEM_STATUS.ERROR,
      },
    });

    expect(wrapper.find(".antd-actions-audio-error").exists()).toBe(true);
  });

  it("supports custom class and prefixCls", () => {
    const wrapper = mount(ActionsAudio, {
      props: {
        class: "my-audio",
        prefixCls: "my-prefix",
      },
    });

    expect(wrapper.find(".my-audio").exists()).toBe(true);
    expect(wrapper.find(".my-prefix-audio").exists()).toBe(true);
  });

  it("supports rootClass", () => {
    const wrapper = mount(ActionsAudio, {
      props: {
        rootClass: "root-audio",
      },
    });

    expect(wrapper.find(".root-audio").exists()).toBe(true);
  });
});
