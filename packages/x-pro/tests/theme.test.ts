import { mount } from "@vue/test-utils";
import { ConfigProvider, StyleProvider } from "antdv-next";
import { describe, expect, it } from "vitest";
import { h } from "vue";

import { MessageScroller } from "../src";

const VIEWPORT_SELECTOR = ".ant-message-scroller-viewport";

function collectStyleText() {
  return [...document.querySelectorAll("style")]
    .map(style => style.textContent ?? "")
    .join("\n");
}

function mountScrollerIn(container: (children: unknown) => unknown) {
  return mount({
    render: () =>
      container(
        h(
          MessageScroller,
          { style: { height: "200px" } },
          { default: () => h("div", "message") },
        ),
      ),
  });
}

describe("x-pro theme registration", () => {
  /**
   * `zeroRuntime` 只覆盖 antdv-next 预构建的 `antd.css`，其中没有 x-pro 的组件样式；
   * 跟随它会让组件在文档站这类宿主里完全失去样式（滚动、导轨全部失效）。
   */
  it("keeps registering runtime styles when the host enables zeroRuntime", () => {
    mountScrollerIn(children =>
      h(
        ConfigProvider,
        { theme: { zeroRuntime: true } },
        { default: () => children },
      ),
    );

    const css = collectStyleText();
    expect(css).toContain(VIEWPORT_SELECTOR);
    expect(css).toMatch(
      new RegExp(`${VIEWPORT_SELECTOR}\\s*\\{[^}]*overflow-y:\\s*auto`),
    );
  });

  /**
   * 层名与 x 组件一致：宿主声明 `@layer ... antd, antdx ...` 时，x-pro 样式跟在 x 之后。
   */
  it("registers its styles in the antdx layer", () => {
    mountScrollerIn(children =>
      h(StyleProvider, { layer: true }, { default: () => children }),
    );

    expect(collectStyleText()).toContain("@layer antdx");
  });
});
