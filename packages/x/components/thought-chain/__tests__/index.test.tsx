import { mount } from "@vue/test-utils";
import { ConfigProvider } from "antdv-next";
import { describe, expect, it } from "vite-plus/test";
import { createTextVNode, h, nextTick } from "vue";

import ThoughtChain from "../ThoughtChain";

describe("ThoughtChain", () => {
  const basicItems = [
    { key: "1", title: "Step 1" },
    { key: "2", title: "Step 2" },
    { key: "3", title: "Step 3" },
  ];

  it("renders with default props", () => {
    const wrapper = mount(ThoughtChain, {
      props: { items: basicItems },
    });

    expect(wrapper.find(".antd-thought-chain").exists()).toBe(true);
    expect(wrapper.findAll(".antd-thought-chain-node").length).toBe(3);
  });

  it.each([
    ["solid", "antd-thought-chain-node-icon-solid"],
    ["dashed", "antd-thought-chain-node-icon-dashed"],
    ["dotted", "antd-thought-chain-node-icon-dotted"],
  ] as const)("applies the %s line style", (line, expectedClass) => {
    const wrapper = mount(ThoughtChain, {
      props: { items: basicItems, line },
    });

    wrapper.findAll(".antd-thought-chain-node-icon").forEach(icon => {
      expect(icon.classes()).toContain(expectedClass);
    });
  });

  it("uses the base solid style when line is true", () => {
    const wrapper = mount(ThoughtChain, {
      props: { items: basicItems, line: true },
    });

    expect(wrapper.find(".antd-thought-chain-node-icon-solid").exists()).toBe(
      false,
    );
  });

  it("hides connector lines when line is false", () => {
    const wrapper = mount(ThoughtChain, {
      props: { items: basicItems, line: false },
    });

    wrapper.findAll(".antd-thought-chain-node-icon").forEach(icon => {
      expect(icon.classes()).toContain("antd-thought-chain-node-icon-none");
    });
  });

  it("renders custom prefixCls, rootClassName, class", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: basicItems,
        prefixCls: "custom-chain",
        rootClass: "root-cls",
        class: "extra-cls",
      },
    });

    expect(wrapper.find(".custom-chain").exists()).toBe(true);
    expect(wrapper.find(".root-cls").exists()).toBe(true);
    expect(wrapper.find(".extra-cls").exists()).toBe(true);
  });

  it("renders items with titles", () => {
    const wrapper = mount(ThoughtChain, {
      props: { items: basicItems },
    });

    const titles = wrapper.findAll(".antd-thought-chain-node-title");
    expect(titles.length).toBe(3);
    expect(titles[0]!.text()).toBe("Step 1");
    expect(titles[1]!.text()).toBe("Step 2");
    expect(titles[2]!.text()).toBe("Step 3");
  });

  it("renders default index icons (numbered)", () => {
    const wrapper = mount(ThoughtChain, {
      props: { items: basicItems },
    });

    const icons = wrapper.findAll(".antd-thought-chain-node-index-icon");
    expect(icons.length).toBe(3);
    expect(icons[0]!.text()).toBe("1");
    expect(icons[1]!.text()).toBe("2");
    expect(icons[2]!.text()).toBe("3");
  });

  it("hides icon when icon=false", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [{ key: "1", title: "No Icon", icon: false }],
      },
    });

    expect(wrapper.find(".antd-thought-chain-node-icon").exists()).toBe(false);
  });

  it("renders custom icon", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Custom",
            icon: h("span", { class: "my-icon" }, "★"),
          },
        ],
      },
    });

    expect(wrapper.find(".my-icon").exists()).toBe(true);
  });

  it("renders status icons", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          { key: "1", title: "Loading", status: "loading" },
          { key: "2", title: "Success", status: "success" },
          { key: "3", title: "Error", status: "error" },
          { key: "4", title: "Abort", status: "abort" },
        ],
      },
    });

    expect(wrapper.find(".antd-thought-chain-status-loading").exists()).toBe(
      true,
    );
    expect(wrapper.find(".antd-thought-chain-status-success").exists()).toBe(
      true,
    );
    expect(wrapper.find(".antd-thought-chain-status-error").exists()).toBe(
      true,
    );
    expect(wrapper.find(".antd-thought-chain-status-abort").exists()).toBe(
      true,
    );
  });

  it("renders description", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Step",
            description: "Some description",
          },
        ],
      },
    });

    expect(wrapper.find(".antd-thought-chain-node-description").text()).toBe(
      "Some description",
    );
  });

  it("renders content", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Step",
            content: h("div", { class: "step-content" }, "Content here"),
          },
        ],
      },
    });

    expect(wrapper.find(".step-content").exists()).toBe(true);
    expect(wrapper.text()).toContain("Content here");
  });

  it("renders footer", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Step",
            footer: h("div", { class: "step-footer" }, "Footer"),
          },
        ],
      },
    });

    expect(wrapper.find(".step-footer").exists()).toBe(true);
  });

  it("supports scoped slots and slot-driven expand control", async () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Prop Title",
            description: "Prop Description",
            content: "Prop Content",
            footer: "Prop Footer",
            status: "success",
            collapsible: true,
            icon: false,
          },
        ],
        defaultExpandedKeys: ["1"],
      },
      slots: {
        iconRender: ({ index, status, originNode }: any) => (
          <span class="slot-icon">{`${index}-${status}-${originNode ? "origin" : "none"}`}</span>
        ),
        title: ({ originNode, expanded }: any) => (
          <span class="slot-title">{`${originNode}-${expanded ? "open" : "closed"}`}</span>
        ),
        description: ({ originNode, item }: any) => (
          <span class="slot-description">{`${originNode}-${item.key}`}</span>
        ),
        content: ({ originNode, expanded, toggleExpand }: any) => (
          <button class="slot-content" onClick={toggleExpand}>
            {`${originNode}-${expanded ? "open" : "closed"}`}
          </button>
        ),
        footer: ({ originNode, collapsible }: any) => (
          <span class="slot-footer">{`${originNode}-${collapsible}`}</span>
        ),
      },
    });

    expect(wrapper.find(".slot-icon").text()).toBe("0-success-none");
    expect(wrapper.find(".slot-title").text()).toBe("Prop Title-open");
    expect(wrapper.find(".slot-description").text()).toBe("Prop Description-1");
    expect(wrapper.find(".slot-content").text()).toBe("Prop Content-open");
    expect(wrapper.find(".slot-footer").text()).toBe("Prop Footer-true");

    await wrapper.find(".slot-content").trigger("click");
    await nextTick();

    expect(wrapper.find(".slot-content").exists()).toBe(false);
    expect(wrapper.emitted("expand")).toBeTruthy();
    expect(wrapper.emitted("update:expandedKeys")).toBeTruthy();
  });

  it("renders the default collapse icon only for collapsible items with content", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          // Collapsible item with content
          {
            key: "1",
            title: "Collapsible",
            content: "Content",
            collapsible: true,
          },
          // Collapsible without content: nothing to collapse
          { key: "2", title: "No content", collapsible: true },
          // Content but not collapsible
          { key: "3", title: "Not collapsible", content: "Content" },
        ],
      },
    });

    expect(
      wrapper.findAll(".antd-thought-chain-node-collapse-icon").length,
    ).toBe(1);
  });

  it("supports a collapseIcon slot with expand info and all slot fields", async () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Collapsible",
            content: "Content",
            collapsible: true,
          },
        ],
        defaultExpandedKeys: ["1"],
      },
      slots: {
        collapseIcon: ({
          item,
          index,
          expanded,
          collapsible,
          originNode,
        }: any) => (
          <span class="slot-collapse-icon">
            {`${item.key}-${index}-${expanded ? "open" : "closed"}-${collapsible ? "yes" : "no"}-${originNode ? "origin" : "none"}`}
          </span>
        ),
      },
    });

    expect(wrapper.find(".slot-collapse-icon").text()).toBe(
      "1-0-open-yes-origin",
    );

    await wrapper.find(".slot-collapse-icon").trigger("click");
    await nextTick();

    expect(wrapper.find(".slot-collapse-icon").text()).toBe(
      "1-0-closed-yes-origin",
    );
  });

  it("hides the collapse icon when the collapseIcon slot returns nothing", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Collapsible",
            content: "Content",
            collapsible: true,
          },
        ],
      },
      slots: {
        collapseIcon: () => null,
      },
    });

    expect(
      wrapper.find(".antd-thought-chain-node-collapse-icon").exists(),
    ).toBe(false);
  });

  it("supports item-level custom and hidden collapse icons", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Custom",
            content: "Content",
            collapsible: true,
            collapseIcon: h("span", { class: "my-collapse-icon" }, "▾"),
          },
          {
            key: "2",
            title: "Hidden",
            content: "Content",
            collapsible: true,
            collapseIcon: false,
          },
        ],
      },
    });

    expect(wrapper.find(".my-collapse-icon").exists()).toBe(true);
    expect(
      wrapper.findAll(".antd-thought-chain-node-collapse-icon").length,
    ).toBe(1);
  });

  it("supports itemCollapseIcon semantic classes and styles", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Collapsible",
            content: "Content",
            collapsible: true,
          },
        ],
        classes: { itemCollapseIcon: "custom-collapse-icon" },
        styles: { itemCollapseIcon: { color: "red" } },
      },
    });

    const icon = wrapper.find<HTMLElement>(
      ".antd-thought-chain-node-collapse-icon",
    );
    expect(icon.classes()).toContain("custom-collapse-icon");
    expect(icon.element.style.color).toBe("red");
  });

  it("rotates the default collapse icon correctly in RTL direction", async () => {
    const wrapper = mount({
      render() {
        return (
          <ConfigProvider direction="rtl">
            <ThoughtChain
              items={[
                {
                  key: "1",
                  title: "Collapsible",
                  content: "Content",
                  collapsible: true,
                },
              ]}
            />
          </ConfigProvider>
        );
      },
    });

    const getSvgStyle = () =>
      wrapper
        .find(".antd-thought-chain-node-collapse-icon svg")
        .attributes("style") ?? "";

    // Collapsed in RTL: LeftOutlined points left (rotate 0)
    expect(getSvgStyle()).not.toContain("rotate(-90deg)");
    expect(getSvgStyle()).not.toContain("rotate(90deg)");

    // Expanded in RTL: LeftOutlined rotates -90deg to point down
    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");
    await nextTick();
    expect(getSvgStyle()).toContain("rotate(-90deg)");
  });

  it("does not double-toggle when toggleExpand is called inside collapseIcon slot", async () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Collapsible",
            content: "Content",
            collapsible: true,
          },
        ],
      },
      slots: {
        collapseIcon: ({ toggleExpand }: any) => (
          <button class="slot-toggle-btn" onClick={toggleExpand}>
            toggle
          </button>
        ),
      },
    });

    await wrapper.find(".slot-toggle-btn").trigger("click");
    await nextTick();

    expect(wrapper.emitted("expand")).toEqual([[["1"]]]);
    expect(wrapper.find(".antd-thought-chain-node-content").exists()).toBe(
      true,
    );
  });

  it("keeps the slot flag until the event finishes bubbling in a real browser", async () => {
    let toggleExpand: ((event?: Event) => void) | undefined;
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Collapsible",
            content: "Content",
            collapsible: true,
          },
        ],
      },
      slots: {
        collapseIcon: (info: any) => {
          toggleExpand = info.toggleExpand;
          return <button class="slot-toggle-btn">toggle</button>;
        },
      },
    });

    // 模拟真实点击：按钮监听器里调用 toggleExpand 后浏览器会跑一次 microtask
    // checkpoint，之后事件才冒泡到标题容器。trigger('click') 是同步派发，测不到。
    toggleExpand!();
    await Promise.resolve();
    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");

    expect(wrapper.emitted("expand")).toHaveLength(1);

    // 宏任务复位后，下一次普通点击仍能正常切换。
    await new Promise(resolve => setTimeout(resolve));
    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");
    expect(wrapper.emitted("expand")).toHaveLength(2);
  });

  it("does not render an empty wrapper when collapseIcon is empty text", () => {
    const propWrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Empty String",
            content: "Content",
            collapsible: true,
            collapseIcon: "",
          },
        ],
      },
    });

    expect(
      propWrapper.find(".antd-thought-chain-node-collapse-icon").exists(),
    ).toBe(false);

    const slotWrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Empty Text VNode",
            content: "Content",
            collapsible: true,
          },
        ],
      },
      slots: {
        collapseIcon: () => [createTextVNode("   ")],
      },
    });

    expect(
      slotWrapper.find(".antd-thought-chain-node-collapse-icon").exists(),
    ).toBe(false);
  });

  it("supports collapsible items with toggle", async () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Collapsible",
            content: h("span", "Hidden content"),
            collapsible: true,
          },
        ],
        defaultExpandedKeys: ["1"],
      },
    });

    // Initially expanded
    expect(wrapper.find(".antd-thought-chain-node-content").exists()).toBe(
      true,
    );

    // Click to collapse
    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");
    await nextTick();

    expect(wrapper.find(".antd-thought-chain-node-content").exists()).toBe(
      false,
    );
  });

  it("emits expand and update:expandedKeys on toggle", async () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Collapsible",
            content: h("span", "Content"),
            collapsible: true,
          },
        ],
      },
    });

    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");

    expect(wrapper.emitted("expand")).toBeTruthy();
    expect(wrapper.emitted("update:expandedKeys")).toBeTruthy();
  });

  it("supports controlled expandedKeys", async () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Item",
            content: h("span", "Content"),
            collapsible: true,
          },
        ],
        expandedKeys: ["1"],
      },
    });

    expect(wrapper.find(".antd-thought-chain-node-content").exists()).toBe(
      true,
    );

    await wrapper.setProps({ expandedKeys: [] });
    await nextTick();

    expect(wrapper.find(".antd-thought-chain-node-content").exists()).toBe(
      false,
    );
  });

  it("applies blink class on item title", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [{ key: "1", title: "Blinking", blink: true }],
      },
    });

    expect(wrapper.find(".antd-thought-chain-motion-blink").exists()).toBe(
      true,
    );
  });

  it("auto-generates keys from index when not provided", () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [{ title: "No Key 1" }, { title: "No Key 2" }],
      },
    });

    expect(wrapper.findAll(".antd-thought-chain-node").length).toBe(2);
  });

  it("keeps the item content mounted and toggles its visibility when destroyOnHidden is false", async () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Step 1",
            content: h("span", "Hidden but mounted"),
            collapsible: true,
            destroyOnHidden: false,
          },
        ],
        defaultExpandedKeys: [],
      },
    });

    const content = wrapper.find(".antd-thought-chain-node-content");
    expect(content.exists()).toBe(true);
    expect(wrapper.text()).toContain("Hidden but mounted");
    expect(content.element.parentElement?.getAttribute("style")).toContain(
      "display: none",
    );

    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");
    await nextTick();

    expect(
      content.element.parentElement?.getAttribute("style") ?? "",
    ).not.toContain("display: none");

    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");
    await nextTick();

    expect(content.element.parentElement?.getAttribute("style")).toContain(
      "display: none",
    );
  });

  it("preserves item content across collapse when destroyOnHidden is false", async () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Step 1",
            content: h("input", { class: "inner-input" }),
            collapsible: true,
            destroyOnHidden: false,
          },
        ],
        defaultExpandedKeys: ["1"],
      },
    });

    const inputEl = wrapper.find<HTMLInputElement>(".inner-input").element;
    inputEl.value = "streaming";

    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");
    await nextTick();

    const afterCollapse = wrapper.find<HTMLInputElement>(".inner-input");
    expect(afterCollapse.exists()).toBe(true);
    // Same DOM node, so the value typed before collapsing survives.
    expect(afterCollapse.element).toBe(inputEl);
    expect(afterCollapse.element.value).toBe("streaming");
  });

  it("keeps toggling after destroyOnHidden changes at runtime", async () => {
    const createItems = (destroyOnHidden: boolean) => [
      {
        key: "1",
        title: "Step 1",
        content: h("span", "Dynamic content"),
        collapsible: true,
        destroyOnHidden,
      },
    ];
    const wrapper = mount(ThoughtChain, {
      props: {
        items: createItems(false),
        defaultExpandedKeys: ["1"],
      },
    });

    await wrapper.setProps({ items: createItems(true) });
    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");
    await nextTick();
    expect(wrapper.find(".antd-thought-chain-node-content").exists()).toBe(
      false,
    );

    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");
    await nextTick();
    expect(wrapper.find(".antd-thought-chain-node-content").exists()).toBe(
      true,
    );

    await wrapper.setProps({ items: createItems(false) });
    const content = wrapper.find(".antd-thought-chain-node-content");

    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");
    await nextTick();
    expect(content.exists()).toBe(true);
    expect(content.element.parentElement?.getAttribute("style")).toContain(
      "display: none",
    );

    await wrapper.find(".antd-thought-chain-node-collapsible").trigger("click");
    await nextTick();
    expect(
      content.element.parentElement?.getAttribute("style") ?? "",
    ).not.toContain("display: none");
  });

  it("keeps the item content mounted for controlled expandedKeys when destroyOnHidden is false", async () => {
    const wrapper = mount(ThoughtChain, {
      props: {
        items: [
          {
            key: "1",
            title: "Step 1",
            content: h("span", "Controlled content"),
            collapsible: true,
            destroyOnHidden: false,
          },
        ],
        expandedKeys: ["1"],
      },
    });

    expect(wrapper.find(".antd-thought-chain-node-content").exists()).toBe(
      true,
    );

    await wrapper.setProps({ expandedKeys: [] });
    await nextTick();

    expect(wrapper.find(".antd-thought-chain-node-content").exists()).toBe(
      true,
    );
    expect(wrapper.text()).toContain("Controlled content");
  });

  it("exposes nativeElement ref", () => {
    const wrapper = mount(ThoughtChain, {
      props: { items: basicItems },
    });

    expect((wrapper.vm as any).nativeElement).toBeInstanceOf(HTMLElement);
  });
});
