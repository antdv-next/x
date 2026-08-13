import { mount, VueWrapper } from "@vue/test-utils";
import { ConfigProvider } from "antdv-next";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { nextTick, ref } from "vue";

import type { SuggestionItem } from "../interface";

import Sender from "../../sender";
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
    default: ({ onTrigger, onKeyDown }: any) => (
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
    ),
  };
}

function dispatchKey(
  element: Element,
  key: string,
  init: KeyboardEventInit = {},
) {
  const { isComposing, ...rest } = init;
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...rest,
  });
  // Cascader's option list still reads the legacy `which`, which jsdom leaves at 0.
  Object.defineProperty(event, "which", { value: key === "Enter" ? 13 : 0 });
  if (isComposing) {
    Object.defineProperty(event, "isComposing", { value: true });
  }
  element.dispatchEvent(event);
  return event;
}

describe("Suggestion", () => {
  it("opens and closes by trigger, and emits openChange listener", async () => {
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

  it("emits update:open when open state changes", async () => {
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
    await flush();

    expect(wrapper.emitted("update:open")).toEqual([[true]]);

    await wrapper.find(".trigger-input").trigger("keydown", { key: "Delete" });
    await flush();

    expect(wrapper.emitted("update:open")).toEqual([[true], [false]]);
  });

  it("emits select with value and selected path", async () => {
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

  it("keeps vertical navigation within the second level after entering it", async () => {
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
    await wrapper
      .find(".trigger-input")
      .trigger("keydown", { key: "ArrowDown" });
    await flush();

    const activeItem = document.querySelector<HTMLElement>(
      ".ant-cascader-menu-item-active:not(.ant-cascader-menu-item-expand)",
    );
    const firstLevelActiveItem = document
      .querySelectorAll<HTMLElement>(".ant-cascader-menu")[0]
      ?.querySelector<HTMLElement>(".ant-cascader-menu-item-active");

    expect(activeItem?.textContent).toContain("About Antdv Next");
    expect(firstLevelActiveItem?.textContent).toContain("Check some knowledge");
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

  it("supports labelRender, iconRender and extraRender slots", async () => {
    track(
      mount(Suggestion, {
        attachTo: document.body,
        props: {
          open: true,
          items: [
            {
              label: "Write a report",
              value: "report",
              icon: "default-icon",
              extra: "default-extra",
            },
          ],
        },
        slots: {
          ...createSlot(),
          labelRender: ({ item, originNode }: any) => (
            <span class="custom-label">{`${originNode}-${item.value}`}</span>
          ),
          iconRender: ({ item }: any) => (
            <span class="custom-icon">{`icon-${item.value}`}</span>
          ),
          extraRender: ({ item }: any) => (
            <span class="custom-extra">{`extra-${item.value}`}</span>
          ),
        },
      }),
    );

    await flush();

    expect(document.querySelector(".custom-label")?.textContent).toBe(
      "Write a report-report",
    );
    expect(document.querySelector(".custom-icon")?.textContent).toBe(
      "icon-report",
    );
    expect(document.querySelector(".custom-extra")?.textContent).toBe(
      "extra-report",
    );
    expect(document.body.textContent).not.toContain("default-icon");
    expect(document.body.textContent).not.toContain("default-extra");
  });

  it("treats empty slot output as explicit override", async () => {
    track(
      mount(Suggestion, {
        attachTo: document.body,
        props: {
          open: true,
          items: [
            {
              label: "Write a report",
              value: "report",
              icon: "default-icon",
              extra: "default-extra",
            },
          ],
        },
        slots: {
          ...createSlot(),
          iconRender: () => null,
          extraRender: () => null,
        },
      }),
    );

    await flush();

    expect(document.body.textContent).toContain("Write a report");
    expect(document.body.textContent).not.toContain("default-icon");
    expect(document.body.textContent).not.toContain("default-extra");
  });

  it("does not let Cascader swallow Space / Enter typed in the trigger", async () => {
    const wrapper = track(
      mount(Suggestion, {
        attachTo: document.body,
        props: { items },
        slots: createSlot(),
      }),
    );

    const input = wrapper.find(".trigger-input");

    // Closed: neither key may be prevented nor may it open the popup.
    for (const key of [" ", "Enter"]) {
      const event = dispatchKey(input.element, key);
      await flush();

      expect(event.defaultPrevented).toBe(false);
      expect(wrapper.emitted("update:open")).toBeUndefined();
    }

    // Open: Space still types, Enter is reserved for selecting the active option.
    await input.trigger("keydown", { key: "@" });
    await flush();

    const spaceEvent = dispatchKey(input.element, " ");
    await flush();

    expect(spaceEvent.defaultPrevented).toBe(false);
  });

  it("selects the active option with Enter while the popup is open", async () => {
    const onSelect = vi.fn();
    const wrapper = track(
      mount(Suggestion, {
        attachTo: document.body,
        props: { items, onSelect },
        slots: createSlot(),
      }),
    );

    await wrapper.find(".trigger-input").trigger("keydown", { key: "@" });
    await flush();

    dispatchKey(wrapper.find(".trigger-input").element, "Enter");
    await flush();

    expect(onSelect).toHaveBeenCalledWith(
      "report",
      expect.arrayContaining([expect.objectContaining({ value: "report" })]),
    );
  });

  it("keeps unrelated keys bubbling to the app around it", async () => {
    const onWindowKeyDown = vi.fn();
    window.addEventListener("keydown", onWindowKeyDown);

    try {
      const wrapper = track(
        mount(Suggestion, {
          attachTo: document.body,
          props: { items },
          slots: createSlot(),
        }),
      );

      const input = wrapper.find(".trigger-input");

      // Closed: Escape belongs to the app, e.g. a Modal wrapping the Sender.
      dispatchKey(input.element, "Escape");
      await flush();

      expect(onWindowKeyDown).toHaveBeenCalled();

      await input.trigger("keydown", { key: "@" });
      await flush();
      onWindowKeyDown.mockClear();

      // Open: application shortcuts still get through...
      dispatchKey(input.element, "k", { metaKey: true });
      await flush();

      expect(onWindowKeyDown).toHaveBeenCalledTimes(1);

      // ...but Escape stops at the popup it just closed.
      onWindowKeyDown.mockClear();
      dispatchKey(input.element, "Escape");
      await flush();

      expect(onWindowKeyDown).not.toHaveBeenCalled();
      expect(wrapper.emitted("update:open")).toEqual([[true], [false]]);
    } finally {
      window.removeEventListener("keydown", onWindowKeyDown);
    }
  });

  it("expands a parent item with Enter instead of swallowing the key", async () => {
    const onSelect = vi.fn();
    const wrapper = track(
      mount(Suggestion, {
        attachTo: document.body,
        props: { items, onSelect },
        slots: createSlot(),
      }),
    );

    const input = wrapper.find(".trigger-input");
    await input.trigger("keydown", { key: "@" });
    await input.trigger("keydown", { key: "ArrowDown" });
    await flush();

    // "Check some knowledge" has children, so it cannot be selected yet.
    dispatchKey(input.element, "Enter");
    await flush();

    expect(onSelect).not.toHaveBeenCalled();
    expect(
      document.querySelector<HTMLElement>(
        ".ant-cascader-menu-item-active:not(.ant-cascader-menu-item-expand)",
      )?.textContent,
    ).toContain("About Vue");

    dispatchKey(input.element, "Enter");
    await flush();

    expect(onSelect).toHaveBeenCalledWith(
      "vue",
      expect.arrayContaining([expect.objectContaining({ value: "vue" })]),
    );
  });

  it("leaves Enter to the trigger when there is nothing to select", async () => {
    const onSelect = vi.fn();
    const wrapper = track(
      mount(Suggestion, {
        attachTo: document.body,
        props: { items: [], onSelect },
        slots: createSlot(),
      }),
    );

    const input = wrapper.find(".trigger-input");
    await input.trigger("keydown", { key: "@" });
    await flush();

    const event = dispatchKey(input.element, "Enter");
    await flush();

    expect(event.defaultPrevented).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("does not hijack Enter from an IME composition or a modifier combo", async () => {
    const onSelect = vi.fn();
    const wrapper = track(
      mount(Suggestion, {
        attachTo: document.body,
        props: { items, onSelect },
        slots: createSlot(),
      }),
    );

    const input = wrapper.find(".trigger-input");
    await input.trigger("keydown", { key: "@" });
    await flush();

    const composingEnter = dispatchKey(input.element, "Enter", {
      isComposing: true,
    });
    const shiftEnter = dispatchKey(input.element, "Enter", { shiftKey: true });
    await flush();

    expect(composingEnter.defaultPrevented).toBe(false);
    expect(shiftEnter.defaultPrevented).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("keeps the popup open while backspacing in the trigger", async () => {
    const wrapper = track(
      mount(Suggestion, {
        attachTo: document.body,
        props: { items },
        slots: createSlot(),
      }),
    );

    const input = wrapper.find(".trigger-input");
    await input.trigger("keydown", { key: "@" });
    await flush();

    dispatchKey(input.element, "Backspace");
    await flush();

    expect(wrapper.emitted("update:open")).toEqual([[true]]);
    expect(document.body.textContent).toContain("Write a report");
  });

  it("keeps a Sender trigger usable while the popup is open", async () => {
    const submits: string[] = [];
    const value = ref("");
    const wrapper = track(
      mount(
        {
          render() {
            return (
              <Suggestion
                items={items}
                onSelect={(nextValue: string) => {
                  value.value = `[${nextValue}]:`;
                }}
              >
                {({ onTrigger, onKeyDown }: any) => (
                  <Sender
                    value={value.value}
                    onChange={(next: string) => {
                      if (next.endsWith("/")) {
                        onTrigger("/");
                      } else if (!next) {
                        onTrigger(false);
                      }
                      value.value = next;
                    }}
                    onKeyDown={onKeyDown}
                    onSubmit={(content: string) => {
                      submits.push(content);
                      value.value = "";
                    }}
                  />
                )}
              </Suggestion>
            );
          },
        },
        { attachTo: document.body },
      ),
    );

    const textarea = wrapper.find("textarea");
    await textarea.setValue("/");
    await flush();

    expect(document.body.textContent).toContain("Write a report");

    // The popup must not steal the space bar from the textarea (#171).
    expect(dispatchKey(textarea.element, " ").defaultPrevented).toBe(false);

    // Enter picks the active suggestion instead of sending the message.
    dispatchKey(textarea.element, "Enter");
    await flush();

    expect(submits).toEqual([]);
    expect(value.value).toBe("[report]:");

    // With the popup closed, Enter sends again.
    await textarea.setValue("hello");
    await flush();
    dispatchKey(textarea.element, "Enter");
    await flush();

    expect(submits).toEqual(["hello"]);
  });

  it("keeps the trigger info when items is an inline function", async () => {
    const version = ref(0);
    const wrapper = track(
      mount(
        {
          render() {
            return (
              <Suggestion
                items={(info?: string) => [
                  { label: `Trigger by '${info}'`, value: String(info) },
                ]}
              >
                {({ onTrigger, onKeyDown }: any) => (
                  <input
                    class="trigger-input"
                    data-version={version.value}
                    onKeydown={(event: KeyboardEvent) => {
                      if (event.key === "@") {
                        onTrigger("@");
                      }
                      return onKeyDown(event);
                    }}
                  />
                )}
              </Suggestion>
            );
          },
        },
        { attachTo: document.body },
      ),
    );

    await wrapper.find(".trigger-input").trigger("keydown", { key: "@" });
    await flush();

    expect(document.body.textContent).toContain("Trigger by '@'");

    // The inline `items` gets a new identity on every render of the parent.
    version.value += 1;
    await flush();

    expect(document.body.textContent).toContain("Trigger by '@'");
  });

  it("keeps every option reachable inside the scrollable popup for long lists", async () => {
    const longItems: SuggestionItem[] = Array.from(
      { length: 30 },
      (_, index) => ({
        label: `Option ${index + 1}`,
        value: `option-${index + 1}`,
      }),
    );

    track(
      mount(Suggestion, {
        attachTo: document.body,
        props: { open: true, items: longItems },
        slots: createSlot(),
      }),
    );

    await flush();

    const menu = document.querySelector(".ant-cascader-menu");
    expect(menu).not.toBeNull();

    const options = document.querySelectorAll(".ant-cascader-menu-item");
    expect(options.length).toBe(longItems.length);
    expect(options[0]?.textContent).toContain("Option 1");
    expect(options[options.length - 1]?.textContent).toContain("Option 30");
  });
});
