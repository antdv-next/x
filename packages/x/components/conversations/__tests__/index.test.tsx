import { mount, VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { h } from "vue";

import Conversations from "../index";

const items = [
  {
    key: "demo1",
    label: "What is Ant Design X ?",
    icon: h("div", { class: "conversation-icon" }, "icon"),
    group: "pinned",
  },
  {
    key: "demo2",
    label: "Getting Started",
  },
  {
    key: "demo4",
    label: "In Docker, use Ollama and initialize",
  },
  {
    key: "demo5",
    label: "Expired, please go to the recycle bin to check",
    disabled: true,
  },
] as const;

const wrappers: VueWrapper[] = [];

function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper);
  return wrapper;
}

function dispatchKeyboardEvent(
  type: "keydown" | "keyup",
  init: KeyboardEventInit & { keyCode: number },
) {
  const event = new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    ...init,
  });

  Object.defineProperty(event, "keyCode", {
    configurable: true,
    get: () => init.keyCode,
  });

  document.dispatchEvent(event);
}

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
});

describe("Conversations", () => {
  it("supports expose ref", () => {
    const wrapper = track(
      mount(Conversations, {
        props: {
          items: [...items],
        },
      }),
    );

    expect((wrapper.vm as any).nativeElement).toBeInstanceOf(HTMLUListElement);
  });

  it("handles defaultActiveKey", () => {
    const wrapper = track(
      mount(Conversations, {
        props: {
          items: [...items],
          defaultActiveKey: "demo1",
        },
      }),
    );

    const active = wrapper.find(".antd-conversations-item-active");
    expect(active.exists()).toBe(true);
    expect(active.text()).toContain("What is Ant Design X ?");
  });

  it("handles controlled activeKey", async () => {
    const wrapper = track(
      mount(Conversations, {
        props: {
          items: [...items],
          activeKey: "demo1",
        },
      }),
    );

    expect(wrapper.find(".antd-conversations-item-active").text()).toContain(
      "What is Ant Design X ?",
    );

    await wrapper.setProps({ activeKey: "demo4" });
    expect(wrapper.find(".antd-conversations-item-active").text()).toContain(
      "In Docker, use Ollama and initialize",
    );
  });

  it("triggers onActiveChange and ignores disabled item click", async () => {
    const onActiveChange = vi.fn();

    const wrapper = track(
      mount(Conversations, {
        props: {
          items: [...items],
          onActiveChange,
        },
      }),
    );

    const listItems = wrapper.findAll(".antd-conversations-item");

    await listItems[0]!.trigger("click");
    expect(onActiveChange).toHaveBeenCalledWith(
      "demo1",
      expect.objectContaining({
        key: "demo1",
        label: "What is Ant Design X ?",
      }),
    );

    await listItems[3]!.trigger("click");
    expect(onActiveChange).toHaveBeenCalledTimes(1);
  });

  it("renders menu icon and calls menu function", () => {
    const menu = vi.fn().mockReturnValue({
      items: [
        { label: "Rename", key: "rename" },
        { label: "Delete", key: "delete" },
      ],
    });

    const wrapper = track(
      mount(Conversations, {
        props: {
          items: [...items],
          menu,
        },
      }),
    );

    expect(menu).toHaveBeenCalled();
    expect(wrapper.find(".antd-conversations-menu-icon").exists()).toBe(true);
  });

  it("supports custom menu trigger node", () => {
    const wrapper = track(
      mount(Conversations, {
        props: {
          items: [...items],
          menu: {
            trigger: h("span", { class: "menu-trigger-node" }, "trigger-node"),
            items: [],
          },
        },
      }),
    );

    expect(wrapper.find(".menu-trigger-node").exists()).toBe(true);
    expect(wrapper.find(".antd-conversations-menu-icon").exists()).toBe(false);
  });

  it("supports custom menu trigger function", () => {
    const wrapper = track(
      mount(Conversations, {
        props: {
          items: [...items],
          menu: {
            trigger: (conversation: any) =>
              h(
                "span",
                { class: "menu-trigger-fn" },
                `trigger-${conversation.key}`,
              ),
            items: [],
          },
        },
      }),
    );

    expect(wrapper.find(".menu-trigger-fn").exists()).toBe(true);
    expect(wrapper.find(".antd-conversations-menu-icon").exists()).toBe(false);
  });

  it("supports grouping and custom group label", () => {
    const grouped = track(
      mount(Conversations, {
        props: {
          items: [...items],
          groupable: true,
        },
      }),
    );

    expect(grouped.text()).toContain("pinned");

    const customLabel = track(
      mount(Conversations, {
        props: {
          items: [...items],
          groupable: {
            label: group =>
              h("div", { class: "custom-group-label" }, `group-${group}`),
          },
        },
      }),
    );

    expect(customLabel.find(".custom-group-label").text()).toContain(
      "group-pinned",
    );

    const noGroup = track(
      mount(Conversations, {
        props: {
          items: [...items],
          groupable: false,
        },
      }),
    );

    expect(noGroup.text()).not.toContain("group-pinned");
  });

  it("supports collapsible groups", async () => {
    const wrapper = track(
      mount(Conversations, {
        props: {
          items: [...items],
          groupable: {
            collapsible: true,
            defaultExpandedKeys: ["pinned"],
          },
        },
      }),
    );

    expect(wrapper.find(".antd-conversations-content-hidden").exists()).toBe(
      false,
    );

    await wrapper.find(".antd-conversations-group-title").trigger("click");
    expect(wrapper.find(".antd-conversations-content-hidden").exists()).toBe(
      true,
    );
  });

  it("supports creation click and disabled state", async () => {
    const onClick = vi.fn();

    const wrapper = track(
      mount(Conversations, {
        props: {
          items: [...items],
          creation: {
            onClick,
          },
        },
      }),
    );

    const creationButton = wrapper.get(".antd-conversations-creation");
    expect(creationButton.text()).toContain("New chat");

    await creationButton.trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);

    await wrapper.setProps({
      creation: {
        onClick,
        disabled: true,
      },
    });

    await wrapper.get(".antd-conversations-creation").trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("supports shortcut keys for items", async () => {
    const onActiveChange = vi.fn();

    track(
      mount(Conversations, {
        props: {
          items: [...items],
          onActiveChange,
          defaultActiveKey: "demo1",
          shortcutKeys: {
            items: ["Alt", "number"],
          },
        },
      }),
    );

    dispatchKeyboardEvent("keydown", {
      key: "3",
      code: "Digit3",
      altKey: true,
      keyCode: 51,
    });
    dispatchKeyboardEvent("keyup", {
      key: "3",
      code: "Digit3",
      altKey: true,
      keyCode: 51,
    });

    expect(onActiveChange).toHaveBeenCalledWith(
      "demo4",
      expect.objectContaining({ key: "demo4" }),
    );
  });

  it("supports shortcut keys for fixed item list", () => {
    const onActiveChange = vi.fn();

    track(
      mount(Conversations, {
        props: {
          items: [...items],
          onActiveChange,
          defaultActiveKey: "demo1",
          shortcutKeys: {
            items: [
              ["Alt", 49],
              ["Alt", 50],
              ["Alt", 51],
            ],
          },
        },
      }),
    );

    dispatchKeyboardEvent("keydown", {
      key: "3",
      code: "Digit3",
      altKey: true,
      keyCode: 51,
    });
    dispatchKeyboardEvent("keyup", {
      key: "3",
      code: "Digit3",
      altKey: true,
      keyCode: 51,
    });

    expect(onActiveChange).toHaveBeenCalledWith(
      "demo4",
      expect.objectContaining({ key: "demo4" }),
    );
  });

  it("supports shortcut key for creation", () => {
    const onClick = vi.fn();

    track(
      mount(Conversations, {
        props: {
          items: [...items],
          shortcutKeys: {
            creation: ["Meta", 75],
          },
          creation: {
            onClick,
          },
        },
      }),
    );

    dispatchKeyboardEvent("keydown", {
      key: "k",
      code: "KeyK",
      metaKey: true,
      keyCode: 75,
    });
    dispatchKeyboardEvent("keyup", {
      key: "k",
      code: "KeyK",
      metaKey: true,
      keyCode: 75,
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
