import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { nextTick } from "vue";

import CodeHighlighter from "../CodeHighlighter";

const shikiMock = vi.hoisted(() => ({
  codeToHtml: vi.fn(),
}));

vi.mock("../shiki", () => ({
  codeToHtml: (...args: any[]) => shikiMock.codeToHtml(...args),
}));

const content = "const a = 1;";

function flushPromises(wait = 0) {
  return new Promise(resolve => setTimeout(resolve, wait));
}

describe("CodeHighlighter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shikiMock.codeToHtml.mockResolvedValue(
      "<pre><code>const a = 1;</code></pre>",
    );
  });

  it("renders the default header with copy button", async () => {
    const wrapper = mount(CodeHighlighter, {
      props: {
        content,
        language: "typescript",
      },
    });

    await flushPromises();

    expect(wrapper.find(".antd-code-highlighter").exists()).toBe(true);
    expect(wrapper.find(".antd-code-highlighter-header").exists()).toBe(true);
    expect(wrapper.find(".antd-code-highlighter-copy-btn").exists()).toBe(true);
    expect(wrapper.find(".antd-code-highlighter-lang").text()).toBe(
      "typescript",
    );
  });

  it("renders the header slot and exposes the scope", async () => {
    const wrapper = mount(CodeHighlighter, {
      props: {
        content,
        language: "typescript",
        theme: "light",
      },
      slots: {
        header: (scope: any) =>
          `${scope.language}-${scope.theme}-${scope.copied}`,
      },
    });

    await flushPromises();

    // default header is fully replaced by the slot
    expect(wrapper.find(".antd-code-highlighter-header").exists()).toBe(false);
    expect(wrapper.find(".antd-code-highlighter-copy-btn").exists()).toBe(
      false,
    );
    expect(wrapper.text()).toContain("typescript-light-false");
  });

  it("invokes copy from the header slot scope", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });
    const onCopy = vi.fn();

    const wrapper = mount(CodeHighlighter, {
      props: {
        content,
        onCopy,
      },
      slots: {
        header: (scope: any) => (
          <button class="slot-copy" onClick={() => scope.copy()}>
            copy
          </button>
        ),
      },
    });

    await flushPromises();
    await wrapper.find(".slot-copy").trigger("click");
    await nextTick();

    expect(writeText).toHaveBeenCalledWith(content);
    expect(onCopy).toHaveBeenCalledWith(content);
  });

  it("toggles theme from the header slot scope", async () => {
    const wrapper = mount(CodeHighlighter, {
      props: {
        content,
        theme: "light",
      },
      slots: {
        header: (scope: any) => (
          <button class="slot-theme" onClick={() => scope.toggleTheme()}>
            theme
          </button>
        ),
      },
    });

    await flushPromises();
    await wrapper.find(".slot-theme").trigger("click");

    expect(wrapper.emitted("update:theme")?.[0]).toEqual(["dark"]);
  });
});
