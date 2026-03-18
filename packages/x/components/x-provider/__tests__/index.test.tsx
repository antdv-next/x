import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vite-plus/test";

import { Bubble, Conversations, FileCard } from "../../index";
import XProvider from "../index";

describe("XProvider", () => {
  it("injects bubble component config", () => {
    const wrapper = mount({
      render() {
        return (
          <XProvider
            bubble={{
              className: "test-bubble",
            }}
          >
            <Bubble content="test" />
          </XProvider>
        );
      },
    });

    expect(wrapper.find(".test-bubble").exists()).toBe(true);
  });

  it("injects conversations component config", async () => {
    const onClick = vi.fn();

    const wrapper = mount({
      render() {
        return (
          <XProvider
            conversations={{
              className: "test-conversations",
            }}
          >
            <Conversations creation={{ onClick }} />
          </XProvider>
        );
      },
    });

    expect(wrapper.find(".test-conversations").exists()).toBe(true);

    await wrapper.get(".antdx-conversations-creation").trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("injects file-card component config", () => {
    const wrapper = mount({
      render() {
        return (
          <XProvider
            fileCard={{
              className: "test-file-card",
            }}
          >
            <FileCard name="test.pdf" byte={1024} />
          </XProvider>
        );
      },
    });

    expect(wrapper.find(".test-file-card").exists()).toBe(true);
  });

  it("passes iconPrefixCls and theme config to ConfigProvider", () => {
    const wrapper = mount({
      render() {
        return (
          <XProvider
            iconPrefixCls="tom-icon"
            theme={{ token: { motion: false } }}
          >
            <Conversations creation={{}} />
          </XProvider>
        );
      },
    });

    expect(wrapper.find(".tom-icon").exists()).toBe(true);
  });
});
