import { createCache, StyleProvider } from "@antdv-next/cssinjs";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import { nextTick } from "vue";

import { Bubble } from "../../index";
import XProvider from "../index";

beforeEach(() => {
  document.head.innerHTML = "";
});

describe("XProvider cssVar", () => {
  it("works without XProvider", async () => {
    const wrapper = mount({
      render() {
        return (
          <StyleProvider cache={createCache()}>
            <Bubble content="test" />
          </StyleProvider>
        );
      },
    });

    await nextTick();

    const styleList = Array.from(document.head.querySelectorAll("style"));
    const bubbleStyle = styleList.find(style =>
      style.innerHTML.includes("bubble"),
    );

    expect(bubbleStyle).toBeTruthy();
    expect(bubbleStyle?.innerHTML.includes("var(--ant-")).toBe(true);
    expect(wrapper.get(".antd-bubble").attributes("class")).toContain(
      "css-var-",
    );
  });

  it("works with XProvider", async () => {
    const wrapper = mount({
      render() {
        return (
          <StyleProvider cache={createCache()}>
            <XProvider>
              <Bubble content="test" />
            </XProvider>
          </StyleProvider>
        );
      },
    });

    await nextTick();

    const styleList = Array.from(document.head.querySelectorAll("style"));
    const bubbleStyle = styleList.find(style =>
      style.innerHTML.includes("bubble"),
    );

    expect(bubbleStyle).toBeTruthy();
    expect(bubbleStyle?.innerHTML.includes("var(--ant-")).toBe(true);
    expect(wrapper.get(".antd-bubble").attributes("class")).toContain(
      "css-var-",
    );
  });
});
