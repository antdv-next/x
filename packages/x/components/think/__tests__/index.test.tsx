import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vite-plus/test";
import { h, nextTick } from "vue";

import Think from "../Think";

describe("Think", () => {
  it("renders with default props", () => {
    const wrapper = mount(Think, {
      slots: { default: () => "Thinking content" },
    });

    expect(wrapper.find(".antd-think").exists()).toBe(true);
    expect(wrapper.find(".antd-think-status-wrapper").exists()).toBe(true);
    expect(wrapper.find(".antd-think-content").exists()).toBe(true);
    expect(wrapper.text()).toContain("Thinking content");
  });

  it("renders custom prefixCls, rootClassName, class, style", () => {
    const wrapper = mount(Think, {
      props: {
        prefixCls: "custom-think",
        rootClass: "root-class",
        class: "extra-class",
        style: { margin: "8px" },
      },
      slots: { default: () => "Content" },
    });

    expect(wrapper.find(".custom-think").exists()).toBe(true);
    expect(wrapper.find(".root-class").exists()).toBe(true);
    expect(wrapper.find(".extra-class").exists()).toBe(true);
  });

  it("renders semantic classes and styles", () => {
    const wrapper = mount(Think, {
      props: {
        classes: { status: "status-cls", content: "content-cls" },
        styles: {
          status: { color: "red" },
          content: { color: "blue" },
        },
      },
      slots: { default: () => "Content" },
    });

    expect(wrapper.find(".status-cls").exists()).toBe(true);
    expect(wrapper.find(".content-cls").exists()).toBe(true);
  });

  it("renders title prop", () => {
    const wrapper = mount(Think, {
      props: { title: "Deep Thinking" },
      slots: { default: () => "Content" },
    });

    expect(wrapper.find(".antd-think-status-text").text()).toBe(
      "Deep Thinking",
    );
  });

  it("renders title slot over prop", () => {
    const wrapper = mount(Think, {
      props: { title: "Prop Title" },
      slots: {
        default: () => "Content",
        title: () => "Slot Title",
      },
    });

    expect(wrapper.find(".antd-think-status-text").text()).toBe("Slot Title");
  });

  it("shows default ThinkIcon when not loading", () => {
    const wrapper = mount(Think, {
      slots: { default: () => "Content" },
    });

    const iconEl = wrapper.find(".antd-think-status-icon");
    expect(iconEl.exists()).toBe(true);
    expect(iconEl.find("svg").exists()).toBe(true);
  });

  it("shows LoadingOutlined when loading=true", () => {
    const wrapper = mount(Think, {
      props: { loading: true },
      slots: { default: () => "Content" },
    });

    const iconEl = wrapper.find(".antd-think-status-icon");
    expect(iconEl.exists()).toBe(true);
    // LoadingOutlined renders a span with role="img"
    expect(
      iconEl.find("[role='img']").exists() ||
        iconEl.find(".anticon-loading").exists() ||
        iconEl.find("svg").exists(),
    ).toBe(true);
  });

  it("shows custom icon prop", () => {
    const wrapper = mount(Think, {
      props: { icon: h("span", { class: "custom-icon" }, "★") },
      slots: { default: () => "Content" },
    });

    expect(wrapper.find(".custom-icon").exists()).toBe(true);
  });

  it("applies blink class when blink=true", () => {
    const wrapper = mount(Think, {
      props: { blink: true },
      slots: { default: () => "Content" },
    });

    expect(wrapper.find(".antd-think-motion-blink").exists()).toBe(true);
  });

  it("does not apply blink class by default", () => {
    const wrapper = mount(Think, {
      slots: { default: () => "Content" },
    });

    expect(wrapper.find(".antd-think-motion-blink").exists()).toBe(false);
  });

  it("is expanded by default (defaultExpanded=true)", () => {
    const wrapper = mount(Think, {
      slots: { default: () => "Visible content" },
    });

    expect(wrapper.find(".antd-think-content").exists()).toBe(true);
    expect(wrapper.text()).toContain("Visible content");
  });

  it("respects defaultExpanded=false", () => {
    const wrapper = mount(Think, {
      props: { defaultExpanded: false },
      slots: { default: () => "Hidden content" },
    });

    expect(wrapper.find(".antd-think-content").exists()).toBe(false);
  });

  it("toggles expanded on status click", async () => {
    const wrapper = mount(Think, {
      slots: { default: () => "Toggle me" },
    });

    expect(wrapper.find(".antd-think-content").exists()).toBe(true);

    await wrapper.find(".antd-think-status-wrapper").trigger("click");
    await nextTick();

    expect(wrapper.find(".antd-think-content").exists()).toBe(false);

    await wrapper.find(".antd-think-status-wrapper").trigger("click");
    await nextTick();

    expect(wrapper.find(".antd-think-content").exists()).toBe(true);
  });

  it("emits expand and update:expanded on toggle", async () => {
    const wrapper = mount(Think, {
      slots: { default: () => "Content" },
    });

    await wrapper.find(".antd-think-status-wrapper").trigger("click");

    expect(wrapper.emitted("expand")).toBeTruthy();
    expect(wrapper.emitted("expand")![0]).toEqual([false]);
    expect(wrapper.emitted("update:expanded")).toBeTruthy();
    expect(wrapper.emitted("update:expanded")![0]).toEqual([false]);
  });

  it("supports controlled expanded prop", async () => {
    const wrapper = mount(Think, {
      props: { expanded: true },
      slots: { default: () => "Content" },
    });

    expect(wrapper.find(".antd-think-content").exists()).toBe(true);

    await wrapper.setProps({ expanded: false });
    await nextTick();

    expect(wrapper.find(".antd-think-content").exists()).toBe(false);
  });

  it("rotates chevron when expanded", () => {
    const expanded = mount(Think, {
      props: { expanded: true },
      slots: { default: () => "Content" },
    });

    const chevron = expanded.find(".antd-think-status-down-icon");
    expect(chevron.attributes("style")).toContain("rotate(90deg)");
  });

  it("does not rotate chevron when collapsed", () => {
    const collapsed = mount(Think, {
      props: { expanded: false },
      slots: { default: () => "Content" },
    });

    const chevron = collapsed.find(".antd-think-status-down-icon");
    expect(chevron.attributes("style")).toContain("rotate(0deg)");
  });

  it("destroys the content node on collapse by default", async () => {
    const wrapper = mount(Think, {
      slots: { default: () => "Toggle me" },
    });

    expect(wrapper.find(".antd-think-content").exists()).toBe(true);

    await wrapper.find(".antd-think-status-wrapper").trigger("click");
    await nextTick();

    expect(wrapper.find(".antd-think-content").exists()).toBe(false);
  });

  it("keeps the content node mounted and toggles its visibility when destroyOnHidden is false", async () => {
    const wrapper = mount(Think, {
      props: { destroyOnHidden: false, defaultExpanded: false },
      slots: { default: () => "Hidden but mounted" },
    });

    const content = wrapper.find(".antd-think-content");
    expect(content.exists()).toBe(true);
    expect(wrapper.text()).toContain("Hidden but mounted");
    expect(content.element.parentElement?.getAttribute("style")).toContain(
      "display: none",
    );

    await wrapper.find(".antd-think-status-wrapper").trigger("click");
    await nextTick();

    expect(
      content.element.parentElement?.getAttribute("style") ?? "",
    ).not.toContain("display: none");

    await wrapper.find(".antd-think-status-wrapper").trigger("click");
    await nextTick();

    expect(content.element.parentElement?.getAttribute("style")).toContain(
      "display: none",
    );
  });

  it("preserves inner state across collapse when destroyOnHidden is false", async () => {
    const wrapper = mount(Think, {
      props: { destroyOnHidden: false },
      slots: { default: () => h("input", { class: "inner-input" }) },
    });

    const input = wrapper.find<HTMLInputElement>(".inner-input");
    expect(input.exists()).toBe(true);
    const inputEl = input.element;
    inputEl.value = "streaming";

    await wrapper.find(".antd-think-status-wrapper").trigger("click");
    await nextTick();

    const afterCollapse = wrapper.find<HTMLInputElement>(".inner-input");
    expect(afterCollapse.exists()).toBe(true);
    // Same DOM node, so the value typed before collapsing survives.
    expect(afterCollapse.element).toBe(inputEl);
    expect(afterCollapse.element.value).toBe("streaming");
  });

  it("keeps toggling after destroyOnHidden changes at runtime", async () => {
    const wrapper = mount(Think, {
      props: { destroyOnHidden: false },
      slots: { default: () => "Dynamic content" },
    });

    await wrapper.setProps({ destroyOnHidden: true });
    await wrapper.find(".antd-think-status-wrapper").trigger("click");
    await nextTick();
    expect(wrapper.find(".antd-think-content").exists()).toBe(false);

    await wrapper.find(".antd-think-status-wrapper").trigger("click");
    await nextTick();
    expect(wrapper.find(".antd-think-content").exists()).toBe(true);

    await wrapper.setProps({ destroyOnHidden: false });
    const content = wrapper.find(".antd-think-content");

    await wrapper.find(".antd-think-status-wrapper").trigger("click");
    await nextTick();
    expect(content.exists()).toBe(true);
    expect(content.element.parentElement?.getAttribute("style")).toContain(
      "display: none",
    );

    await wrapper.find(".antd-think-status-wrapper").trigger("click");
    await nextTick();
    expect(
      content.element.parentElement?.getAttribute("style") ?? "",
    ).not.toContain("display: none");
  });

  it("keeps the content node mounted for controlled expanded when destroyOnHidden is false", async () => {
    const wrapper = mount(Think, {
      props: { destroyOnHidden: false, expanded: true },
      slots: { default: () => "Controlled content" },
    });

    expect(wrapper.find(".antd-think-content").exists()).toBe(true);

    await wrapper.setProps({ expanded: false });
    await nextTick();

    expect(wrapper.find(".antd-think-content").exists()).toBe(true);
    expect(wrapper.text()).toContain("Controlled content");
  });

  it("exposes nativeElement ref", () => {
    const wrapper = mount(Think, {
      slots: { default: () => "Content" },
    });

    expect((wrapper.vm as any).nativeElement).toBeInstanceOf(HTMLElement);
  });
});
