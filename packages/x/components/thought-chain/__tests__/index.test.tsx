import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vite-plus/test";
import { h, nextTick } from "vue";

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

  it("exposes nativeElement ref", () => {
    const wrapper = mount(ThoughtChain, {
      props: { items: basicItems },
    });

    expect((wrapper.vm as any).nativeElement).toBeInstanceOf(HTMLElement);
  });
});
