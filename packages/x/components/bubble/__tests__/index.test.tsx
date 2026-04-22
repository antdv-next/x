import { mount } from "@vue/test-utils";
import zhCN from "antdv-next/dist/locale/zh_CN";
import { describe, expect, it, vi } from "vite-plus/test";
import { h, nextTick, ref } from "vue";

import XProvider from "../../x-provider";
import Bubble from "../Bubble";

describe("Bubble", () => {
  it("handles common props and expose ref", () => {
    const wrapper = mount(Bubble, {
      props: {
        prefixCls: "custom-bubble",
        rootClass: "root-class",
        class: "custom-class",
        style: { margin: "10px" },
        classes: { content: "content-class" },
        styles: { content: { color: "red" } },
        placement: "end",
        content: "测试内容",
        variant: "outlined",
        shape: "round",
        loading: false,
        typing: false,
        editable: false,
        streaming: false,
        footerPlacement: "inner-start",
        avatar: h("div", { class: "custom-avatar" }, "头像"),
        header: h("div", { class: "custom-header" }, "头部"),
        footer: h("div", { class: "custom-footer" }, "底部"),
        extra: h("div", { class: "custom-extra" }, "附加"),
      },
    });

    expect(wrapper.find(".custom-bubble").exists()).toBe(true);
    expect(wrapper.find(".root-class").exists()).toBe(true);
    expect(wrapper.find(".custom-class").exists()).toBe(true);
    expect(wrapper.find(".content-class").exists()).toBe(true);
    expect(wrapper.find(".custom-avatar").exists()).toBe(true);
    expect(wrapper.find(".custom-header").exists()).toBe(true);
    expect(wrapper.find(".custom-footer").exists()).toBe(true);
    expect(wrapper.find(".custom-extra").exists()).toBe(true);
    expect((wrapper.vm as any).nativeElement).toBeInstanceOf(HTMLElement);
  });

  it("supports function slot props", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Test",
        header: content =>
          h("div", { class: "header-fn" }, `Header: ${content}`),
      },
    });

    expect(wrapper.find(".header-fn").exists()).toBe(true);
    expect(wrapper.text()).toContain("Header: Test");
  });

  it("supports avatar/header/footer/extra named slots", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "SlotContent",
        info: { key: "slot-key", status: "success" as any },
      },
      slots: {
        avatar: ({ content, info }: any) => (
          <div class="avatar-slot">{`${content}-${info.key}`}</div>
        ),
        header: ({ content, info }: any) => (
          <div class="header-slot">{`${content}-${info.status}`}</div>
        ),
        footer: ({ content }: any) => (
          <div class="footer-slot">{`footer-${content}`}</div>
        ),
        extra: ({ info }: any) => (
          <div class="extra-slot">{`extra-${info.key}`}</div>
        ),
      },
    });

    expect(wrapper.find(".avatar-slot").exists()).toBe(true);
    expect(wrapper.find(".header-slot").exists()).toBe(true);
    expect(wrapper.find(".footer-slot").exists()).toBe(true);
    expect(wrapper.find(".extra-slot").exists()).toBe(true);
    expect(wrapper.text()).toContain("SlotContent-slot-key");
    expect(wrapper.text()).toContain("SlotContent-success");
    expect(wrapper.text()).toContain("footer-SlotContent");
    expect(wrapper.text()).toContain("extra-slot-key");
  });

  it("prefers named slots over avatar/header/footer/extra props", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Test",
        avatar: h("div", { class: "avatar-prop" }, "avatar-prop"),
        header: h("div", { class: "header-prop" }, "header-prop"),
        footer: h("div", { class: "footer-prop" }, "footer-prop"),
        extra: h("div", { class: "extra-prop" }, "extra-prop"),
      },
      slots: {
        avatar: () => <div class="avatar-slot-priority">avatar-slot</div>,
        header: () => <div class="header-slot-priority">header-slot</div>,
        footer: () => <div class="footer-slot-priority">footer-slot</div>,
        extra: () => <div class="extra-slot-priority">extra-slot</div>,
      },
    });

    expect(wrapper.find(".avatar-slot-priority").exists()).toBe(true);
    expect(wrapper.find(".header-slot-priority").exists()).toBe(true);
    expect(wrapper.find(".footer-slot-priority").exists()).toBe(true);
    expect(wrapper.find(".extra-slot-priority").exists()).toBe(true);

    expect(wrapper.find(".avatar-prop").exists()).toBe(false);
    expect(wrapper.find(".header-prop").exists()).toBe(false);
    expect(wrapper.find(".footer-prop").exists()).toBe(false);
    expect(wrapper.find(".extra-prop").exists()).toBe(false);
  });

  it("supports content slot", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "SlotContent",
        info: { key: "content-key", status: "success" as any },
      },
      slots: {
        content: ({ content, info }: any) => (
          <div class="content-render-slot">{`${content}-${info.key}-${info.status}`}</div>
        ),
      },
    });

    expect(wrapper.find(".content-render-slot").exists()).toBe(true);
    expect(wrapper.text()).toContain("SlotContent-content-key-success");
  });

  it("refreshes content when slot turns renderable after initial empty", async () => {
    const slotText = ref("");
    const wrapper = mount({
      setup() {
        return () => (
          <Bubble content="fallback-content">
            {{
              content: () =>
                slotText.value ? (
                  <div class="dynamic-content-slot">{slotText.value}</div>
                ) : null,
            }}
          </Bubble>
        );
      },
    });

    expect(wrapper.text()).toContain("fallback-content");
    expect(wrapper.find(".dynamic-content-slot").exists()).toBe(false);

    slotText.value = "slot-now-visible";
    await nextTick();

    expect(wrapper.find(".dynamic-content-slot").exists()).toBe(true);
    expect(wrapper.text()).toContain("slot-now-visible");
    expect(wrapper.text()).not.toContain("fallback-content");
  });

  it("refreshes content when slot output changes", async () => {
    const slotText = ref("slot-v1");
    const wrapper = mount({
      setup() {
        return () => (
          <Bubble content="fallback-content">
            {{
              content: () => (
                <div class="dynamic-content-slot">{slotText.value}</div>
              ),
            }}
          </Bubble>
        );
      },
    });

    expect(wrapper.text()).toContain("slot-v1");

    slotText.value = "slot-v2";
    await nextTick();

    expect(wrapper.text()).toContain("slot-v2");
    expect(wrapper.text()).not.toContain("slot-v1");
  });

  it("falls back to contentRender when content slot becomes empty", async () => {
    const showSlot = ref(true);
    const wrapper = mount({
      setup() {
        return () => (
          <Bubble
            content="source-content"
            contentRender={content => (
              <div class="content-render-fallback">{`render-${content}`}</div>
            )}
          >
            {{
              content: () =>
                showSlot.value ? (
                  <div class="dynamic-content-slot">slot-render</div>
                ) : null,
            }}
          </Bubble>
        );
      },
    });

    expect(wrapper.text()).toContain("slot-render");
    expect(wrapper.find(".content-render-fallback").exists()).toBe(false);

    showSlot.value = false;
    await nextTick();

    expect(wrapper.find(".dynamic-content-slot").exists()).toBe(false);
    expect(wrapper.find(".content-render-fallback").exists()).toBe(true);
    expect(wrapper.text()).toContain("render-source-content");
  });

  it("supports contentRender prop", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "PropContent",
        info: { key: "prop-key", status: "success" as any },
        contentRender: (content, info) => (
          <div class="content-render-prop">{`${content}-${info.key}-${info.status}`}</div>
        ),
      },
    });

    expect(wrapper.find(".content-render-prop").exists()).toBe(true);
    expect(wrapper.text()).toContain("PropContent-prop-key-success");
  });

  it("prefers content slot over contentRender prop", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "PropContent",
        contentRender: content => (
          <div class="content-render-prop">{`render-${content}`}</div>
        ),
      },
      slots: {
        content: () => (
          <div class="content-render-slot-priority">slot-render</div>
        ),
      },
    });

    expect(wrapper.find(".content-render-slot-priority").exists()).toBe(true);
    expect(wrapper.find(".content-render-prop").exists()).toBe(false);
    expect(wrapper.text()).toContain("slot-render");
  });

  it("renders original content when contentRender is absent", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "PlainContent",
      },
    });

    expect(wrapper.text()).toContain("PlainContent");
  });

  it("supports loading slot", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Loading content",
        loading: true,
      },
      slots: {
        loading: ({ content, info }: any) => (
          <div class="loading-render-slot">{`loading-${content}-${String(info?.status)}`}</div>
        ),
      },
    });

    expect(wrapper.find(".loading-render-slot").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-dot").exists()).toBe(false);
    expect(wrapper.text()).toContain("loading-Loading content-undefined");
  });

  it("supports loadingRender prop", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Loading content",
        loading: true,
        loadingRender: content => (
          <div class="loading-render-prop">{`loading-${content}`}</div>
        ),
      },
    });

    expect(wrapper.find(".loading-render-prop").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-dot").exists()).toBe(false);
    expect(wrapper.text()).toContain("loading-Loading content");
  });

  it("prefers loading slot over loadingRender prop", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Loading content",
        loading: true,
        loadingRender: content => (
          <div class="loading-render-prop">{`loading-${content}`}</div>
        ),
      },
      slots: {
        loading: () => (
          <div class="loading-render-slot-priority">slot-loading</div>
        ),
      },
    });

    expect(wrapper.find(".loading-render-slot-priority").exists()).toBe(true);
    expect(wrapper.find(".loading-render-prop").exists()).toBe(false);
    expect(wrapper.find(".antd-bubble-dot").exists()).toBe(false);
    expect(wrapper.text()).toContain("slot-loading");
  });

  it("supports footer placement", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Test",
        footerPlacement: "inner-start",
        footer: h("div", "Footer"),
      },
    });

    expect(wrapper.find(".antd-bubble-footer-start").exists()).toBe(true);
  });

  it("shows loading state and custom loading render slot", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Test",
        loading: true,
      },
    });

    expect(wrapper.find(".antd-bubble-loading").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-dot").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-body").exists()).toBe(false);
    expect(wrapper.find(".antd-bubble-content").exists()).toBe(false);

    const customLoading = mount(Bubble, {
      props: {
        content: "Test",
        loading: true,
      },
      slots: {
        loading: () => <div class="custom-loading">Loading...</div>,
      },
    });

    expect(customLoading.find(".custom-loading").exists()).toBe(true);
    expect(customLoading.find(".antd-bubble-body").exists()).toBe(false);
    expect(customLoading.find(".antd-bubble-content").exists()).toBe(false);
  });

  it("applies variants and shapes", async () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Test",
        variant: "filled",
        shape: "default",
      },
    });

    expect(wrapper.find(".antd-bubble-content-filled").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-content-default").exists()).toBe(true);

    await wrapper.setProps({ variant: "outlined", shape: "round" });
    expect(wrapper.find(".antd-bubble-content-outlined").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-content-round").exists()).toBe(true);

    await wrapper.setProps({ variant: "shadow", shape: "corner" });
    expect(wrapper.find(".antd-bubble-content-shadow").exists()).toBe(true);
    expect(wrapper.find(".antd-bubble-content-corner").exists()).toBe(true);

    await wrapper.setProps({ variant: "borderless" });
    expect(wrapper.find(".antd-bubble-content-borderless").exists()).toBe(true);
  });

  it("applies placement", async () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Test",
        placement: "start",
      },
    });

    expect(wrapper.find(".antd-bubble-start").exists()).toBe(true);

    await wrapper.setProps({ placement: "end" });
    expect(wrapper.find(".antd-bubble-end").exists()).toBe(true);
  });

  it("supports content slot with object content", () => {
    const complexContent = {
      type: "message",
      text: "Complex",
    };

    const wrapper = mount(Bubble, {
      props: {
        content: complexContent as any,
      },
      slots: {
        content: ({ content }: any) => (
          <div class="complex-render">{`${content.type}: ${content.text}`}</div>
        ),
      },
    });

    expect(wrapper.find(".complex-render").exists()).toBe(true);
    expect(wrapper.text()).toContain("message: Complex");
  });

  it("calls onTypingComplete when typing is disabled", async () => {
    const onTypingComplete = vi.fn();

    mount(Bubble, {
      props: {
        content: "Hello",
        onTypingComplete,
      },
    });

    await nextTick();
    expect(onTypingComplete).toHaveBeenCalledWith("Hello");
  });

  it("keeps fade-in chunks before finish and folds to plain text after finish", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mount(Bubble, {
        props: {
          content: "Hello",
          typing: {
            effect: "fade-in",
            interval: 200,
            step: 2,
          },
        },
      });

      await nextTick();

      const fadeInChunk = wrapper.find(".fade-in");
      expect(fadeInChunk.exists()).toBe(true);
      expect(wrapper.text()).toBe("He");

      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(wrapper.find(".fade-in").exists()).toBe(false);
      expect(wrapper.text()).toBe("Hello");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not restart animation when typing config changes without content change", async () => {
    vi.useFakeTimers();
    try {
      const onTyping = vi.fn();
      const wrapper = mount(Bubble, {
        props: {
          content: "Hello",
          typing: {
            effect: "fade-in",
            interval: 200,
            step: 2,
          },
          onTyping,
        },
      });

      await nextTick();
      vi.advanceTimersByTime(1000);
      await nextTick();

      const callsBeforeSwitch = onTyping.mock.calls.length;

      await wrapper.setProps({
        typing: {
          effect: "typing",
          interval: 50,
          step: 1,
        },
      });
      await nextTick();
      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(onTyping.mock.calls.length).toBe(callsBeforeSwitch);
      expect(wrapper.text()).toBe("Hello");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not force immediate rerun when typing config changes during animation", async () => {
    vi.useFakeTimers();
    try {
      const onTyping = vi.fn();
      const wrapper = mount(Bubble, {
        props: {
          content: "Hello world, this is a long sentence for animation test.",
          typing: {
            effect: "typing",
            interval: 200,
            step: 1,
          },
          onTyping,
        },
      });

      await nextTick();
      vi.advanceTimersByTime(200);
      await nextTick();
      const callsBeforeSwitch = onTyping.mock.calls.length;

      await wrapper.setProps({
        typing: {
          effect: "fade-in",
          interval: 200,
          step: 1,
        },
      });
      await nextTick();

      expect(onTyping.mock.calls.length).toBe(callsBeforeSwitch);
      expect(wrapper.find(".antd-bubble-fade-in").exists()).toBe(true);

      vi.advanceTimersByTime(200);
      await nextTick();
      expect(onTyping.mock.calls.length).toBe(callsBeforeSwitch + 1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not rerun for effect-only switch, then uses latest effect on next content change", async () => {
    vi.useFakeTimers();
    try {
      const onTyping = vi.fn();
      const wrapper = mount(Bubble, {
        props: {
          content: "data-1: This is a long typing message for scenario one.",
          typing: {
            effect: "typing",
            interval: 50,
            step: 1,
          },
          onTyping,
        },
      });

      await nextTick();
      vi.advanceTimersByTime(3000);
      await nextTick();
      const callsAfterFirstContentDone = onTyping.mock.calls.length;

      await wrapper.setProps({
        typing: {
          effect: "fade-in",
          interval: 50,
          step: 1,
        },
      });
      await nextTick();
      vi.advanceTimersByTime(500);
      await nextTick();

      expect(onTyping.mock.calls.length).toBe(callsAfterFirstContentDone);
      expect(wrapper.text()).toContain("data-1:");

      await wrapper.setProps({
        content:
          "data-2: This is another long typing message for scenario two.",
      });
      await nextTick();

      expect(wrapper.find(".antd-bubble-fade-in").exists()).toBe(true);
      expect(wrapper.find(".fade-in").exists()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("uses new effect when content and typing change together", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mount(Bubble, {
        props: {
          content: "data-1: hello world",
          typing: {
            effect: "typing",
            interval: 200,
            step: 2,
          },
        },
      });

      await nextTick();
      vi.advanceTimersByTime(2000);
      await nextTick();

      await wrapper.setProps({
        content: "data-2: hello world",
        typing: {
          effect: "fade-in",
          interval: 200,
          step: 2,
        },
      });
      await nextTick();

      expect(wrapper.find(".fade-in").exists()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("adds info status class", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Status content",
        info: { status: "error" as any },
      },
    });

    expect(wrapper.find(".antd-bubble-error").exists()).toBe(true);
  });

  it("throws for non-string content in editable mode", () => {
    expect(() => {
      mount(Bubble, {
        props: {
          content: h("div", "Not string") as any,
          editable: { editing: true },
          onEditConfirm: vi.fn(),
        },
      });
    }).toThrow("[Bubble] Editable mode only supports string content.");
  });

  it("renders contentEditable for editable mode", () => {
    const wrapper = mount(Bubble, {
      props: {
        content: "Editable text",
        editable: { editing: true },
      },
    });

    expect(
      wrapper.find(".antd-bubble-content-editing [contenteditable]").exists(),
    ).toBe(true);
    expect(wrapper.find("textarea").exists()).toBe(false);
  });

  it("triggers editable callbacks", async () => {
    const onEditConfirm = vi.fn();
    const onEditCancel = vi.fn();

    const wrapper = mount(Bubble, {
      props: {
        content: "Editable text",
        editable: { editing: true },
        onEditConfirm,
        onEditCancel,
      },
    });

    const editable = wrapper.find(
      ".antd-bubble-content-editing [contenteditable]",
    );
    (editable.element as HTMLDivElement).textContent = "Changed text";

    await wrapper
      .find(".antd-bubble-editing-opts .ant-btn-primary")
      .trigger("click");
    await wrapper
      .find(".antd-bubble-editing-opts .ant-btn-text")
      .trigger("click");

    expect(onEditConfirm).toHaveBeenCalledWith("Changed text");
    expect(onEditCancel).toHaveBeenCalledTimes(1);
  });

  it("uses zh locale fallback text in editable mode", () => {
    const wrapper = mount({
      render() {
        return (
          <XProvider locale={zhCN}>
            <Bubble content="Editable text" editable={{ editing: true }} />
          </XProvider>
        );
      },
    });

    expect(
      wrapper
        .find(".antd-bubble-editing-opts .ant-btn-primary")
        .text()
        .replace(/\s+/g, ""),
    ).toBe("确认");
    expect(
      wrapper
        .find(".antd-bubble-editing-opts .ant-btn-text")
        .text()
        .replace(/\s+/g, ""),
    ).toBe("取消");
  });

  it("supports custom Bubble locale texts", () => {
    const wrapper = mount({
      render() {
        return (
          <XProvider
            locale={
              {
                ...zhCN,
                Bubble: {
                  editableOk: "保存",
                  editableCancel: "放弃",
                },
              } as any
            }
          >
            <Bubble content="Editable text" editable={{ editing: true }} />
          </XProvider>
        );
      },
    });

    expect(
      wrapper
        .find(".antd-bubble-editing-opts .ant-btn-primary")
        .text()
        .replace(/\s+/g, ""),
    ).toBe("保存");
    expect(
      wrapper
        .find(".antd-bubble-editing-opts .ant-btn-text")
        .text()
        .replace(/\s+/g, ""),
    ).toBe("放弃");
  });
});
