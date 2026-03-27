import { mount, VueWrapper } from "@vue/test-utils";
import { ConfigProvider } from "antdv-next";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { h, nextTick } from "vue";

import type { SuggestionItem } from "../interface";

import Suggestion from "../index";

const wrappers: VueWrapper[] = [];

function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper);
  return wrapper;
}

async function flush() {
  await nextTick();
  await Promise.resolve();
}

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
});

const items: SuggestionItem[] = [
  { label: "Write a report", value: "report" },
  {
    label: "Check some knowledge",
    value: "knowledge",
    children: [
      { label: "About Vue", value: "vue" },
      { label: "About Antdv Next", value: "antdv-next" },
    ],
  },
];

function createSlot() {
  return {
    default: ({ onTrigger, onKeyDown }: any) =>
      h("input", {
        class: "trigger-input",
        onKeydown: (event: KeyboardEvent) => {
          if (event.key === "@") {
            onTrigger("@");
          } else if (event.key === "Delete") {
            onTrigger(false);
          }
          return onKeyDown(event);
        },
      }),
  };
}

describe("Suggestion", () => {
  it("opens and closes by trigger, and calls onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const wrapper = track(
      mount(Suggestion, {
        attachTo: document.body,
        props: {
          items,
          onOpenChange,
        },
        slots: createSlot(),
      }),
    );

    await wrapper.find(".trigger-input").trigger("keydown", { key: "@" });
    await flush();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.textContent).toContain("Write a report");

    onOpenChange.mockReset();
    await wrapper.find(".trigger-input").trigger("keydown", { key: "Delete" });
    await flush();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onSelect with value and selected path", async () => {
    const onSelect = vi.fn();
    const wrapper = track(
      mount(Suggestion, {
        attachTo: document.body,
        props: {
          items,
          onSelect,
        },
        slots: createSlot(),
      }),
    );

    await wrapper.find(".trigger-input").trigger("keydown", { key: "@" });
    await flush();

    const firstItem = Array.from(
      document.querySelectorAll<HTMLElement>(".ant-cascader-menu-item"),
    ).find(node => node.textContent?.includes("Write a report"));

    expect(firstItem).toBeTruthy();
    firstItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flush();

    expect(onSelect).toHaveBeenCalledWith(
      "report",
      expect.arrayContaining([expect.objectContaining({ value: "report" })]),
    );
  });

  it("supports controlled open state", async () => {
    const wrapper = track(
      mount(Suggestion, {
        attachTo: document.body,
        props: {
          items,
          open: false,
        },
        slots: createSlot(),
      }),
    );

    expect(document.body.textContent?.includes("Write a report")).toBe(false);

    await wrapper.setProps({ open: true });
    await flush();

    expect(document.body.textContent).toContain("Write a report");
  });

  it("supports keyboard navigation", async () => {
    const wrapper = track(
      mount(Suggestion, {
        attachTo: document.body,
        props: {
          items,
        },
        slots: createSlot(),
      }),
    );

    await wrapper.find(".trigger-input").trigger("keydown", { key: "@" });
    await wrapper
      .find(".trigger-input")
      .trigger("keydown", { key: "ArrowDown" });
    await wrapper.find(".trigger-input").trigger("keydown", {
      key: "ArrowRight",
    });
    await flush();

    const activeItem = document.querySelector<HTMLElement>(
      ".ant-cascader-menu-item-active:not(.ant-cascader-menu-item-expand)",
    );

    expect(activeItem?.textContent).toContain("About Vue");
  });

  it("reverses horizontal navigation under RTL", async () => {
    const wrapper = track(
      mount(
        {
          render() {
            return (
              <ConfigProvider direction="rtl">
                <Suggestion items={items}>
                  {({ onTrigger, onKeyDown }: any) => (
                    <input
                      class="trigger-input"
                      onKeydown={(event: KeyboardEvent) => {
                        if (event.key === "@") {
                          onTrigger("@");
                        } else if (event.key === "Delete") {
                          onTrigger(false);
                        }
                        return onKeyDown(event);
                      }}
                    />
                  )}
                </Suggestion>
              </ConfigProvider>
            );
          },
        },
        { attachTo: document.body },
      ),
    );

    await wrapper.find(".trigger-input").trigger("keydown", { key: "@" });
    await wrapper
      .find(".trigger-input")
      .trigger("keydown", { key: "ArrowDown" });
    await wrapper
      .find(".trigger-input")
      .trigger("keydown", { key: "ArrowLeft" });
    await flush();

    const activeItem = document.querySelector<HTMLElement>(
      ".ant-cascader-menu-item-active:not(.ant-cascader-menu-item-expand)",
    );

    expect(activeItem?.textContent).toContain("About Vue");
  });

  it("supports block mode and semantic classes", async () => {
    track(
      mount(Suggestion, {
        attachTo: document.body,
        props: {
          items,
          open: true,
          block: true,
          classes: {
            root: "custom-root",
            content: "custom-content",
            popup: "custom-popup",
          },
        },
        slots: createSlot(),
      }),
    );

    await flush();
    expect(document.querySelector(".custom-root")).toBeTruthy();
    expect(document.querySelector(".custom-content")).toBeTruthy();
    expect(document.querySelector(".custom-popup")).toBeTruthy();
    expect(document.querySelector(".antd-suggestion-block")).toBeTruthy();
  });
});
