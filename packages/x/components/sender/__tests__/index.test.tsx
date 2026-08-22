import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { markRaw } from "vue";

import type { SkillType, SlotConfigType } from "../interface";

import Sender from "..";

beforeEach(() => {
  document.head.innerHTML = "";
});

describe("Sender", () => {
  it("should render with default props", () => {
    const wrapper = mount(Sender);
    expect(wrapper.find(".antd-sender").exists()).toBe(true);
    expect(wrapper.find(".antd-sender-content").exists()).toBe(true);
    expect(wrapper.find(".antd-sender-input").exists()).toBe(true);
  });

  it("should render with custom prefixCls", () => {
    const wrapper = mount(Sender, {
      props: { prefixCls: "custom-sender" },
    });
    expect(wrapper.find(".custom-sender").exists()).toBe(true);
  });

  it("should render disabled state", () => {
    const wrapper = mount(Sender, {
      props: { disabled: true },
    });
    expect(wrapper.find(".antd-sender-disabled").exists()).toBe(true);
  });

  it("should handle value changes", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Sender, {
      props: { onChange },
    });

    const textarea = wrapper.find("textarea");
    await textarea.setValue("hello");
    expect(onChange).toHaveBeenCalled();
    const args = onChange.mock.calls[0]!;
    expect(args[0]).toBe("hello");
    expect(args[1]).toBeDefined();
  });

  it("emits update:value when value changes", async () => {
    const wrapper = mount(Sender);

    const textarea = wrapper.find("textarea");
    await textarea.setValue("hello");

    expect(wrapper.emitted("update:value")).toEqual([["hello"]]);
  });

  it("should support controlled value", async () => {
    const wrapper = mount(Sender, {
      props: { value: "controlled" },
    });

    const textarea = wrapper.find("textarea");
    expect(textarea.element.value).toBe("controlled");
  });

  it("should trigger onSubmit on Enter", async () => {
    const onSubmit = vi.fn();
    const wrapper = mount(Sender, {
      props: {
        defaultValue: "test message",
        onSubmit,
      },
    });

    const textarea = wrapper.find("textarea");
    await textarea.trigger("keydown", { key: "Enter" });
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0]![0]).toBe("test message");
  });

  it("should not trigger onSubmit on Shift+Enter", async () => {
    const onSubmit = vi.fn();
    const wrapper = mount(Sender, {
      props: {
        defaultValue: "test",
        onSubmit,
      },
    });

    const textarea = wrapper.find("textarea");
    await textarea.trigger("keydown", { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should trigger onSubmit on Shift+Enter when submitType is shiftEnter", async () => {
    const onSubmit = vi.fn();
    const wrapper = mount(Sender, {
      props: {
        defaultValue: "test",
        submitType: "shiftEnter",
        onSubmit,
      },
    });

    const textarea = wrapper.find("textarea");
    await textarea.trigger("keydown", {
      key: "Enter",
      shiftKey: true,
    });
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0]![0]).toBe("test");
  });

  it("should not submit when loading", async () => {
    const onSubmit = vi.fn();
    const wrapper = mount(Sender, {
      props: {
        defaultValue: "test",
        loading: true,
        onSubmit,
      },
    });

    const textarea = wrapper.find("textarea");
    await textarea.trigger("keydown", { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should render send button", () => {
    const wrapper = mount(Sender);
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("should render action presets with Flex", () => {
    const wrapper = mount(Sender, {
      props: { allowSpeech: true },
    });

    const presets = wrapper.find(".antd-sender-actions-list-presets");
    expect(presets.classes()).toContain("ant-flex");
  });

  it("should follow controlled speech recording state", async () => {
    const onRecordingChange = vi.fn();
    const wrapper = mount(Sender, {
      props: {
        allowSpeech: {
          recording: false,
          onRecordingChange,
        },
      },
    });

    await wrapper.findAll(".antd-sender-actions-btn")[0]!.trigger("click");
    expect(onRecordingChange).toHaveBeenLastCalledWith(true);

    onRecordingChange.mockClear();
    await wrapper.setProps({
      allowSpeech: {
        recording: true,
        onRecordingChange,
      },
    });

    expect(
      wrapper.find(".antd-sender-actions-btn-recording-icon").exists(),
    ).toBe(true);

    await wrapper.findAll(".antd-sender-actions-btn")[0]!.trigger("click");
    expect(onRecordingChange).toHaveBeenLastCalledWith(false);
  });

  it("should render loading button when loading", () => {
    const wrapper = mount(Sender, {
      props: { loading: true },
    });
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("should render placeholder", () => {
    const wrapper = mount(Sender, {
      props: { placeholder: "Type something..." },
    });
    const textarea = wrapper.find("textarea");
    expect(textarea.attributes("placeholder")).toBe("Type something...");
  });

  it("should render with prefix", () => {
    const wrapper = mount(Sender, {
      props: { prefix: <span class="my-prefix">P</span> },
    });
    expect(wrapper.find(".antd-sender-prefix").exists()).toBe(true);
    expect(wrapper.find(".my-prefix").exists()).toBe(true);
  });

  it("should render with footer", () => {
    const wrapper = mount(Sender, {
      props: { footer: <span class="my-footer">F</span> },
    });
    expect(wrapper.find(".antd-sender-footer").exists()).toBe(true);
    expect(wrapper.find(".my-footer").exists()).toBe(true);
  });

  it("should support prefix, header, suffix and footer slots", () => {
    const wrapper = mount(Sender, {
      props: {
        prefix: <span class="prop-prefix">prop-prefix</span>,
      },
      slots: {
        prefix: () => <span class="slot-prefix">slot-prefix</span>,
        header: () => <div class="slot-header">slot-header</div>,
        footer: () => <div class="slot-footer">slot-footer</div>,
        suffix: ({ components, defaultNode }: any) => (
          <div class="slot-suffix">
            <span class="slot-default-node">{defaultNode}</span>
            <components.ClearButton class="slot-clear-btn" />
          </div>
        ),
      },
    });

    expect(wrapper.find(".slot-prefix").exists()).toBe(true);
    expect(wrapper.find(".prop-prefix").exists()).toBe(false);
    expect(wrapper.find(".slot-header").exists()).toBe(true);
    expect(wrapper.find(".slot-footer").exists()).toBe(true);
    expect(wrapper.find(".slot-suffix").exists()).toBe(true);
    expect(wrapper.find(".slot-default-node").exists()).toBe(true);
    expect(wrapper.find(".slot-clear-btn").exists()).toBe(true);
  });

  it("should expose ref methods", () => {
    const wrapper = mount(Sender);
    const vm = wrapper.vm as any;
    expect(typeof vm.focus).toBe("function");
    expect(typeof vm.blur).toBe("function");
    expect(typeof vm.clear).toBe("function");
  });

  it("should support slotConfig and emit structured payload", async () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const wrapper = mount(Sender, {
      props: {
        slotConfig: [
          { type: "text", value: "Hello " },
          {
            type: "input",
            key: "name",
            props: { placeholder: "Enter a name" },
          },
          { type: "text", value: " !" },
        ],
        onChange,
        onSubmit,
      },
    });

    await wrapper.vm.$nextTick();

    const slotInput = wrapper.find("input.antd-sender-slot-input");
    await slotInput.setValue("Alice");

    expect(onChange).toHaveBeenCalled();
    const lastChange = onChange.mock.calls[onChange.mock.calls.length - 1]!;
    expect(lastChange[0]).toContain("Alice");
    expect(lastChange[2]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "name",
          type: "input",
          value: "Alice",
        }),
      ]),
    );

    const editable = wrapper.find(".antd-sender-input-slot");
    await editable.trigger("keydown", { key: "Enter" });
    expect(onSubmit).toHaveBeenCalled();
    const submitArgs = onSubmit.mock.calls[onSubmit.mock.calls.length - 1]!;
    expect(submitArgs[0]).toContain("Alice");
    expect(submitArgs[1]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "name",
          type: "input",
          value: "Alice",
        }),
      ]),
    );
  });

  it("should format content slots using the latest DOM text", async () => {
    const formatResult = vi.fn((value: any) => `[formatted:${value}]`);
    const wrapper = mount(Sender, {
      props: {
        slotConfig: [
          {
            type: "content",
            key: "content",
            props: { defaultValue: "Initial Value" },
            formatResult,
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();

    const contentSlot = wrapper.find<HTMLElement>(".antd-sender-slot-content");
    contentSlot.element.innerText = "Edited Value";
    await wrapper.find(".antd-sender-input-slot").trigger("input");

    expect(formatResult).toHaveBeenLastCalledWith("Edited Value");
    expect((wrapper.vm as any).getValue()).toEqual(
      expect.objectContaining({
        value: " [formatted:Edited Value] ",
        slotConfig: [
          expect.objectContaining({
            key: "content",
            type: "content",
            value: "[formatted:Edited Value]",
          }),
        ],
      }),
    );
  });

  it("should return raw content slot text without formatResult", async () => {
    const wrapper = mount(Sender, {
      props: {
        slotConfig: [
          {
            type: "content",
            key: "content",
            props: { defaultValue: "Content Value" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).getValue().value).toBe(" Content Value ");
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({
        key: "content",
        type: "content",
        value: "Content Value",
      }),
    ]);
  });

  it("should format content and other slot types together", async () => {
    const wrapper = mount(Sender, {
      props: {
        slotConfig: [
          { type: "text", value: 'Translate "' },
          {
            type: "content",
            key: "content",
            props: { defaultValue: "Hello" },
            formatResult: (value: any) => `[${value}]`,
          },
          { type: "text", value: '" from ' },
          {
            type: "select",
            key: "language",
            props: {
              defaultValue: "English",
              options: ["English", "Chinese"],
            },
            formatResult: (value: any) => `{${value}}`,
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();

    const result = (wrapper.vm as any).getValue();
    expect(result.value).toBe('Translate " [Hello] " from {English}');
    expect(result.slotConfig).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "content", value: "[Hello]" }),
        expect.objectContaining({ type: "select", value: "{English}" }),
      ]),
    );
  });

  it("should support slot insert and getValue on ref", async () => {
    const wrapper = mount(Sender, {
      props: {
        slotConfig: [{ type: "text", value: "Prefix " }],
      },
    });
    await wrapper.vm.$nextTick();

    const vm = wrapper.vm as any;
    vm.insert(
      [
        {
          type: "input",
          key: "account",
          props: { defaultValue: "test-user" },
        },
      ],
      "end",
    );
    await wrapper.vm.$nextTick();

    const value = vm.getValue();
    expect(value.value).toContain("test-user");
    expect(value.slotConfig).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "account",
          type: "input",
          value: "test-user",
        }),
      ]),
    );
  });

  it("should remove the slot before cursor when backspacing at the editor boundary", async () => {
    const onChange = vi.fn();
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "assistant1",
            props: { label: "@Travel Planner1", value: "travel1" },
          },
          {
            type: "tag",
            key: "assistant2",
            props: { label: "@Travel Planner2", value: "travel2" },
          },
          {
            type: "tag",
            key: "assistant3",
            props: { label: "@Travel Planner3", value: "travel3" },
          },
        ],
        onChange,
      },
    });
    await wrapper.vm.$nextTick();
    onChange.mockClear();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(editable.element, editable.element.childNodes.length);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("keydown", { key: "Backspace" });

    const lastChange = onChange.mock.calls[onChange.mock.calls.length - 1]!;
    expect(lastChange[2].map((item: SlotConfigType) => item.key)).toEqual([
      "assistant1",
      "assistant2",
    ]);

    wrapper.unmount();
    host.remove();
  });

  it("should clear content slot text when backspacing inside the slot", async () => {
    const onChange = vi.fn();
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "content",
            key: "content",
            props: { defaultValue: "A", placeholder: "Content" },
          },
        ],
        onChange,
      },
    });
    await wrapper.vm.$nextTick();
    onChange.mockClear();

    const editable = wrapper.find(".antd-sender-input-slot");
    const contentSlot = wrapper.find(".antd-sender-slot-content");
    if (!contentSlot.element.firstChild) {
      contentSlot.element.appendChild(document.createTextNode("A"));
    }
    const textNode = contentSlot.element.firstChild!;
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(textNode, 1);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("keydown", { key: "Backspace" });

    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({
        key: "content",
        type: "content",
        value: "",
      }),
    ]);

    wrapper.unmount();
    host.remove();
  });

  it("should keep user input when typing after removing content slot with skill", async () => {
    const onChange = vi.fn();
    const skill = {
      value: "test_skill",
      title: "Test skill",
      closable: true,
    };
    const wrapper = mount(Sender, {
      props: {
        skill,
        slotConfig: [
          { type: "content", key: "input", props: { placeholder: "Content" } },
        ],
        placeholder: "Type something...",
        onChange,
      },
    });

    await wrapper.vm.$nextTick();
    await wrapper.setProps({ slotConfig: undefined });
    await wrapper.vm.$nextTick();
    onChange.mockClear();

    const editable = wrapper.find(".antd-sender-input-slot");
    const skillNode = wrapper.find(".antd-sender-skill");

    skillNode.element.appendChild(document.createTextNode("hello"));
    await editable.trigger("input");

    expect(onChange).toHaveBeenCalled();
    const lastChange = onChange.mock.calls[onChange.mock.calls.length - 1]!;
    expect(lastChange[0]).toBe("hello");
    expect((wrapper.vm as any).getValue().value).toBe("hello");
  });

  it("should remove slot when backspacing past empty text nodes at editor boundary", async () => {
    const onChange = vi.fn();
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "a1",
            props: { label: "@A1", value: "a1" },
          },
          {
            type: "tag",
            key: "a2",
            props: { label: "@A2", value: "a2" },
          },
        ],
        onChange,
      },
    });
    await wrapper.vm.$nextTick();
    onChange.mockClear();

    const editable = wrapper.find(".antd-sender-input-slot");

    // Insert empty text nodes between the last slot and the cursor
    // to simulate DOM state after editing (browser may leave orphan text nodes)
    editable.element.appendChild(document.createTextNode(""));
    editable.element.appendChild(document.createTextNode(""));

    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(editable.element, editable.element.childNodes.length);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("keydown", { key: "Backspace" });

    const lastChange = onChange.mock.calls[onChange.mock.calls.length - 1]!;
    expect(lastChange[2].map((item: SlotConfigType) => item.key)).toEqual([
      "a1",
    ]);

    wrapper.unmount();
    host.remove();
  });

  it("should not show empty placeholder when skill has child nodes", async () => {
    const skill = {
      value: "test_skill",
      title: "Test skill",
      closable: true,
    };
    const wrapper = mount(Sender, {
      props: {
        skill,
        placeholder: "Type something...",
      },
    });
    await wrapper.vm.$nextTick();

    const skillNode = wrapper.find(".antd-sender-skill");
    // Simulate user typing into the skill area
    skillNode.element.appendChild(document.createTextNode("hello"));

    const editable = wrapper.find(".antd-sender-input-slot");
    await editable.trigger("input");
    await wrapper.vm.$nextTick();

    // The empty class should NOT be applied since the skill has child nodes
    expect(skillNode.classes()).not.toContain("antd-sender-skill-empty");
  });

  it("should replace characters when insert is called with replaceCharacters", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [{ type: "text", value: "Prefix " }],
      },
    });
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");

    // Simulate user typing "@" into the editor
    editable.element.appendChild(document.createTextNode("@"));
    await editable.trigger("input");

    // Place cursor right after "@"
    const textNode = editable.element.lastChild!;
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(textNode, 1);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Insert a slot with replaceCharacters="@"
    const vm = wrapper.vm as any;
    vm.insert(
      [
        {
          type: "input",
          key: "test_input",
          props: { placeholder: "replaced" },
        },
      ],
      "cursor",
      "@",
    );
    await wrapper.vm.$nextTick();

    // "@" should have been removed, replaced by the slot
    const value = vm.getValue();
    expect(value.value).not.toContain("@");
    expect(value.slotConfig).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "test_input", type: "input" }),
      ]),
    );

    wrapper.unmount();
    host.remove();
  });

  it("should keep cursor after restoring slotConfig and typing into skill placeholder", async () => {
    const skill = {
      value: "test_skill",
      title: "Test skill",
      closable: true,
    };
    const slotConfig: SlotConfigType[] = [
      { type: "content", key: "input", props: { placeholder: "Content" } },
    ];
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        skill,
        slotConfig,
        placeholder: "Type something...",
      },
    });

    await wrapper.vm.$nextTick();
    await wrapper.setProps({ slotConfig: undefined });
    await wrapper.vm.$nextTick();
    await wrapper.setProps({ slotConfig: [...slotConfig] });
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const skillNode = wrapper.find(".antd-sender-skill");
    const textNode = document.createTextNode("a");
    const selection = window.getSelection();
    const range = document.createRange();

    skillNode.element.appendChild(textNode);
    range.setStart(textNode, 1);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("input");

    expect((wrapper.vm as any).getValue().value).toContain("a");
    expect(selection?.anchorNode).toBe(textNode);
    expect(selection?.anchorOffset).toBe(1);

    wrapper.unmount();
    host.remove();
  });

  it("should preserve native undo for plain text when slotConfig is empty", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: { slotConfig: [] },
    });
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    editable.element.appendChild(document.createTextNode("abc"));
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    const undoEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "z",
    });
    editable.element.dispatchEvent(undoEvent);

    expect(undoEvent.defaultPrevented).toBe(false);

    const redoEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "y",
    });
    editable.element.dispatchEvent(redoEvent);

    expect(redoEvent.defaultPrevented).toBe(false);

    const beforeInputUndo = new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "historyUndo",
    });
    editable.element.dispatchEvent(beforeInputUndo);
    expect(beforeInputUndo.defaultPrevented).toBe(false);

    const beforeInputRedo = new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "historyRedo",
    });
    editable.element.dispatchEvent(beforeInputRedo);
    expect(beforeInputRedo.defaultPrevented).toBe(false);

    wrapper.unmount();
    host.remove();
  });

  it("should route beforeinput history commands through managed history", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    const undoEvent = new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "historyUndo",
    });
    editable.element.dispatchEvent(undoEvent);
    await wrapper.vm.$nextTick();
    expect(undoEvent.defaultPrevented).toBe(true);
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "tag" }),
    ]);

    const redoEvent = new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "historyRedo",
    });
    editable.element.dispatchEvent(redoEvent);
    await wrapper.vm.$nextTick();
    expect(redoEvent.defaultPrevented).toBe(true);
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    wrapper.unmount();
    host.remove();
  });

  it("should preserve existing text when undoing the first managed insert", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: { slotConfig: [] },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const textNode = document.createTextNode("typed first");
    editable.element.appendChild(textNode);
    await editable.trigger("input", { inputType: "insertText" });
    const range = document.createRange();
    range.setStartAfter(textNode);
    range.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    (wrapper.vm as any).insert(
      [
        {
          type: "tag",
          key: "tag",
          props: { label: "Slot", value: "slot" },
        },
      ],
      "cursor",
    );
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: "tag" })]),
    );

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).getValue().value).toBe("typed first");
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ type: "text", value: "typed first" }),
    ]);

    // Second undo must not fall through to the empty mount snapshot.
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toBe("typed first");
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ type: "text", value: "typed first" }),
    ]);

    wrapper.unmount();
    host.remove();
  });

  it("should restore existing text when undoing clear in slot mode", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: { slotConfig: [] },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    editable.element.appendChild(document.createTextNode("keep me"));
    await editable.trigger("input", { inputType: "insertText" });

    (wrapper.vm as any).clear();
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toBe("");

    (editable.element as HTMLElement).focus();
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).getValue().value).toBe("keep me");

    wrapper.unmount();
    host.remove();
  });

  it("should restore the last deleted slot with undo and remove it with redo", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "tag", type: "tag", value: "slot" }),
    ]);

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    wrapper.unmount();
    host.remove();
  });

  it("should write a slot selection to the clipboard before cutting", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          { type: "text", value: "Before " },
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
          { type: "text", value: " after" },
        ],
      },
    });
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    selection?.removeAllRanges();
    selection?.addRange(range);
    const selectedText = range.toString();
    const setData = vi.fn();
    const cutEvent = new Event("cut", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(cutEvent, "clipboardData", {
      value: { setData },
    });

    editable.element.dispatchEvent(cutEvent);

    expect(setData).toHaveBeenCalledWith("text/plain", selectedText);

    wrapper.unmount();
    host.remove();
  });

  it("should retain a partial content-slot deletion after redo", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "content",
            key: "content",
            props: { defaultValue: "Alpha Beta" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const contentSlot = wrapper.find<HTMLElement>(".antd-sender-slot-content");
    Object.defineProperty(contentSlot.element, "innerText", {
      configurable: true,
      get() {
        return this.textContent ?? "";
      },
      set(value: string) {
        this.textContent = value;
      },
    });
    contentSlot.element.innerText = "Alpha Beta";
    const textNode = contentSlot.element.firstChild!;
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(textNode, 6);
    range.setEnd(textNode, 10);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("Alpha ");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe(
      "Alpha Beta",
    );

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("Alpha ");

    wrapper.unmount();
    host.remove();
  });

  it("should restore orphan content-slot spacers after redo", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "content",
            key: "content",
            props: { defaultValue: "X" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const contentSlot = wrapper.find<HTMLElement>(".antd-sender-slot-content");
    const range = document.createRange();
    range.setStartBefore(contentSlot.element);
    range.setEndAfter(contentSlot.element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue()).toEqual(
      expect.objectContaining({ value: "  ", slotConfig: [] }),
    );

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "content", value: "X" }),
    ]);

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue()).toEqual(
      expect.objectContaining({ value: "  ", slotConfig: [] }),
    );

    wrapper.unmount();
    host.remove();
  });

  it("should preserve edited content-slot text after undo and redo", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "content",
            key: "content",
            props: { defaultValue: "Initial" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const contentSlot = wrapper.find<HTMLElement>(".antd-sender-slot-content");
    const selection = window.getSelection();
    const beforeRange = document.createRange();
    beforeRange.selectNodeContents(contentSlot.element);
    beforeRange.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(beforeRange);
    editable.element.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data: " edited",
        inputType: "insertText",
      }),
    );

    contentSlot.element.innerText = "Initial edited";
    editable.element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: " edited",
        inputType: "insertText",
      }),
    );

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("Initial");

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe(
      "Initial edited",
    );

    wrapper.unmount();
    host.remove();
  });

  it("should let onKeyDown veto selection deletion", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const onKeyDown = vi.fn(() => false as const);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
        onKeyDown,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    await editable.trigger("keydown", { key: "Backspace" });

    expect(onKeyDown).toHaveBeenCalledOnce();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "tag", type: "tag" }),
    ]);

    wrapper.unmount();
    host.remove();
  });

  it("should not apply managed undo while readOnly", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    await wrapper.setProps({ readOnly: true });
    (editable.element as HTMLElement).focus();
    const undoEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "z",
    });
    editable.element.dispatchEvent(undoEvent);
    await wrapper.vm.$nextTick();

    expect(undoEvent.defaultPrevented).toBe(false);
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    wrapper.unmount();
    host.remove();
  });

  it("should not close a skill while readOnly", async () => {
    const wrapper = mount(Sender, {
      props: {
        slotConfig: [],
        skill: {
          value: "translate",
          title: "Translate",
          closable: true,
        },
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.setProps({ readOnly: true });
    await wrapper.vm.$nextTick();

    const close = wrapper.find(".antd-sender-skill-close");
    expect(close.attributes("aria-disabled")).toBe("true");
    expect(close.attributes("tabindex")).toBe("-1");
    await close.trigger("click");

    expect((wrapper.vm as any).getValue().skill).toEqual(
      expect.objectContaining({ value: "translate" }),
    );
  });

  it("should not apply managed undo while disabled", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    await wrapper.setProps({ disabled: true });
    (editable.element as HTMLElement).focus();
    const undoEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "z",
    });
    editable.element.dispatchEvent(undoEvent);
    await wrapper.vm.$nextTick();

    expect(undoEvent.defaultPrevented).toBe(false);
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);
    expect(editable.attributes("contenteditable")).toBe("false");

    wrapper.unmount();
    host.remove();
  });

  it("should update manually rendered slot controls when disabled changes", async () => {
    const wrapper = mount(Sender, {
      props: {
        slotConfig: [
          {
            type: "input",
            key: "input",
            props: { defaultValue: "value" },
          },
          {
            type: "custom",
            key: "custom",
            customRender: (_value, _onChange, control) => (
              <button class="custom-slot-control" disabled={control.disabled}>
                Custom
              </button>
            ),
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(
      (wrapper.find("input.antd-sender-slot-input").element as HTMLInputElement)
        .disabled,
    ).toBe(false);
    expect(
      (wrapper.find("button.custom-slot-control").element as HTMLButtonElement)
        .disabled,
    ).toBe(false);

    await wrapper.setProps({ disabled: true });
    await wrapper.vm.$nextTick();

    expect(
      (wrapper.find("input.antd-sender-slot-input").element as HTMLInputElement)
        .disabled,
    ).toBe(true);
    expect(
      (wrapper.find("button.custom-slot-control").element as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    wrapper.unmount();
  });

  it("should not close a skill while disabled", async () => {
    const wrapper = mount(Sender, {
      props: {
        slotConfig: [],
        skill: {
          value: "translate",
          title: "Translate",
          closable: true,
        },
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.setProps({ disabled: true });
    await wrapper.vm.$nextTick();

    const close = wrapper.find(".antd-sender-skill-close");
    expect(close.attributes("aria-disabled")).toBe("true");
    expect(close.attributes("tabindex")).toBe("-1");
    await close.trigger("click");

    expect((wrapper.vm as any).getValue().skill).toEqual(
      expect.objectContaining({ value: "translate" }),
    );

    wrapper.unmount();
  });

  it("should block public mutations while readOnly or disabled", async () => {
    const wrapper = mount(Sender, {
      props: {
        readOnly: true,
        slotConfig: [],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const vm = wrapper.vm as any;
    vm.insert([
      {
        type: "tag",
        key: "tag",
        props: { label: "Slot", value: "slot" },
      },
    ]);
    vm.clear();
    await wrapper.vm.$nextTick();
    expect(vm.getValue().slotConfig).toEqual([]);

    await wrapper.setProps({ readOnly: false, disabled: true });
    vm.insert([
      {
        type: "tag",
        key: "tag",
        props: { label: "Slot", value: "slot" },
      },
    ]);
    vm.clear();
    await wrapper.vm.$nextTick();
    expect(vm.getValue().slotConfig).toEqual([]);

    wrapper.unmount();
  });

  it("should delete an entire atomic slot selected through its label", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Atomic Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const label = wrapper.find(".antd-sender-slot-tag").element.firstChild!;
    const range = document.createRange();
    range.setStart(label, 0);
    range.setEnd(label, 2);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    const editable = wrapper.find(".antd-sender-input-slot");
    await editable.trigger("keydown", { key: "Delete" });

    expect(wrapper.find(".antd-sender-slot-tag").exists()).toBe(false);
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    wrapper.unmount();
    host.remove();
  });

  it("should record custom slot value changes in managed history", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "custom",
            key: "custom",
            props: { defaultValue: "Initial" },
            customRender: (_value, onChange) => (
              <button class="custom-slot" onClick={() => onChange("Updated")}>
                Update
              </button>
            ),
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.find("button.custom-slot").trigger("click");
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("Updated");

    const editable = wrapper.find(".antd-sender-input-slot");
    (editable.element as HTMLElement).focus();
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("Initial");

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("Updated");

    wrapper.unmount();
    host.remove();
  });

  it("should isolate in-place custom object mutations between snapshots", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const initialValue = { nested: { count: 1 }, items: [1] };
    let mutateCustomValue: (() => void) | undefined;
    let renderedCustomValue: typeof initialValue | undefined;
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "custom",
            key: "custom",
            props: { defaultValue: initialValue },
            customRender: (value, onChange) => {
              renderedCustomValue = value;
              mutateCustomValue = () => {
                value.nested.count = 2;
                value.items.push(2);
                onChange(value);
              };
              return <button class="mutable-custom-slot">Mutate</button>;
            },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    mutateCustomValue?.();
    expect(renderedCustomValue).toEqual({
      nested: { count: 2 },
      items: [1, 2],
    });

    const editable = wrapper.find(".antd-sender-input-slot");
    (editable.element as HTMLElement).focus();
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect(renderedCustomValue).toEqual({
      nested: { count: 1 },
      items: [1],
    });

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect(renderedCustomValue).toEqual({
      nested: { count: 2 },
      items: [1, 2],
    });

    wrapper.unmount();
    host.remove();
  });

  it("should snapshot cyclic Map and Set custom values", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    type CyclicValue = {
      map: Map<string, number>;
      set: Set<string>;
      self?: CyclicValue;
    };
    const initialValue: CyclicValue = {
      map: new Map([["count", 1]]),
      set: new Set(["a"]),
    };
    initialValue.self = initialValue;
    let renderedValue: CyclicValue | undefined;
    let mutateValue: (() => void) | undefined;
    const customRender = (
      value: CyclicValue,
      onChange: (value: any) => void,
    ) => {
      renderedValue = value;
      mutateValue = () => {
        value.map.set("count", 2);
        value.set.add("b");
        onChange(value);
      };
      return <button class="cyclic-custom-slot">Mutate</button>;
    };
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "custom",
            key: "custom",
            props: { defaultValue: initialValue },
            customRender,
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    mutateValue?.();
    expect(renderedValue?.map.get("count")).toBe(2);
    expect(renderedValue?.set).toEqual(new Set(["a", "b"]));

    const editable = wrapper.find(".antd-sender-input-slot");
    (editable.element as HTMLElement).focus();
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect(renderedValue?.map.get("count")).toBe(1);
    expect(renderedValue?.set).toEqual(new Set(["a"]));
    expect(renderedValue?.self).toBe(renderedValue);

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect(renderedValue?.map.get("count")).toBe(2);
    expect(renderedValue?.set).toEqual(new Set(["a", "b"]));
    expect(renderedValue?.self).toBe(renderedValue);

    wrapper.unmount();
    host.remove();
  });

  it("should retain opaque custom values by identity in history", async () => {
    class OpaqueValue {
      readonly #label: string;

      constructor(label: string) {
        this.#label = label;
      }

      getLabel() {
        return this.#label;
      }
    }

    const initialValue = markRaw(new OpaqueValue("Initial"));
    let updateCustomSlot: ((value: OpaqueValue) => void) | undefined;
    let renderedValue: OpaqueValue | undefined;
    const wrapper = mount(Sender, {
      props: {
        slotConfig: [
          {
            type: "custom",
            key: "custom",
            props: { defaultValue: initialValue },
            customRender: (value: OpaqueValue, onChange) => {
              renderedValue = value;
              updateCustomSlot = onChange;
              return <span>{value.getLabel()}</span>;
            },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    updateCustomSlot?.(markRaw(new OpaqueValue("Updated")));
    const editable = wrapper.find(".antd-sender-input-slot");
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();

    expect(renderedValue).toBe(initialValue);
    expect(renderedValue?.getLabel()).toBe("Initial");

    wrapper.unmount();
  });

  it("should handle a bubbled input-slot undo only once", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const onKeyDown = vi.fn();
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "input",
            key: "input",
            props: { defaultValue: "Initial" },
          },
        ],
        onKeyDown,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.find("input.antd-sender-slot-input").setValue("First");
    await wrapper.find("input.antd-sender-slot-input").setValue("Second");
    await wrapper
      .find("input.antd-sender-slot-input")
      .trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();

    expect(onKeyDown).toHaveBeenCalledOnce();
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("First");

    wrapper.unmount();
    host.remove();
  });

  it("should leave custom-slot native history shortcuts to the consumer", async () => {
    const wrapper = mount(Sender, {
      props: {
        slotConfig: [
          {
            type: "custom",
            key: "custom",
            customRender: () => (
              <input class="custom-native-input" value="Internal" />
            ),
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const input = wrapper.find("input.custom-native-input");
    const keydown = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "z",
    });
    input.element.dispatchEvent(keydown);
    expect(keydown.defaultPrevented).toBe(false);

    const beforeInput = new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "historyUndo",
    });
    input.element.dispatchEvent(beforeInput);
    expect(beforeInput.defaultPrevented).toBe(false);

    wrapper.unmount();
  });

  it("should leave structural deletion to a nested form control", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "input",
            key: "input",
            props: { defaultValue: "Initial" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const input = wrapper.find("input.antd-sender-slot-input");
    (input.element as HTMLInputElement).focus();

    // Browsers can retain this stale outer selection after focus moves into
    // the input. It must not turn an input deletion into a slot deletion.
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    for (const key of ["Backspace", "Delete"]) {
      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key,
      });
      input.element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
      expect((wrapper.vm as any).getValue().slotConfig).toEqual([
        expect.objectContaining({ key: "input", value: "Initial" }),
      ]);
    }

    wrapper.unmount();
    host.remove();
  });

  it("should leave cut handling to a nested form control", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "input",
            key: "input",
            props: { defaultValue: "Initial" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const input = wrapper.find("input.antd-sender-slot-input");
    const inputElement = input.element as HTMLInputElement;
    inputElement.focus();
    inputElement.setSelectionRange(0, inputElement.value.length);

    // Focusing a native control does not reliably clear the document
    // selection in browsers. The stale selection must not be cut instead.
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    const event = new Event("cut", {
      bubbles: true,
      cancelable: true,
    });
    inputElement.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "input", value: "Initial" }),
    ]);

    wrapper.unmount();
    host.remove();
  });

  it("should leave paste handling to a nested form control", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const onPaste = vi.fn();
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "input",
            key: "input",
            props: { defaultValue: "Initial" },
          },
        ],
        onPaste,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const input = wrapper.find("input.antd-sender-slot-input");
    const inputElement = input.element as HTMLInputElement;
    inputElement.focus();

    const range = document.createRange();
    range.selectNodeContents(editable.element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    const event = new Event("paste", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "clipboardData", {
      value: {
        files: [],
        getData: () => "Pasted",
      },
    });
    inputElement.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(onPaste).toHaveBeenCalledOnce();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "input", value: "Initial" }),
    ]);

    wrapper.unmount();
    host.remove();
  });

  it("should keep managed undo focus inside a slot input", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "input",
            key: "input",
            props: { defaultValue: "Initial" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const input = wrapper.find("input.antd-sender-slot-input");
    await input.setValue("Edited");
    (input.element as HTMLInputElement).focus();
    const undoEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "z",
    });
    input.element.dispatchEvent(undoEvent);
    await wrapper.vm.$nextTick();

    expect(undoEvent.defaultPrevented).toBe(true);
    const restoredInput = wrapper.find("input.antd-sender-slot-input");
    expect(document.activeElement).toBe(restoredInput.element);

    await restoredInput.setValue("Continued");
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe(
      "Continued",
    );

    wrapper.unmount();
    host.remove();
  });

  it("should restore built-in input carets on undo and redo", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "input",
            key: "input",
            props: { defaultValue: "abcd" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    let input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    input.focus();
    input.setSelectionRange(2, 2);
    input.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data: "X",
        inputType: "insertText",
      }),
    );
    input.value = "abXcd";
    input.setSelectionRange(3, 3);
    input.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "X",
        inputType: "insertText",
      }),
    );
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("abXcd");

    input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    input.focus();
    input.setSelectionRange(5, 5);
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        key: "z",
      }),
    );
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    expect(input.value).toBe("abcd");
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(2);

    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        shiftKey: true,
        key: "z",
      }),
    );
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    expect(input.value).toBe("abXcd");
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(3);
    expect(input.selectionEnd).toBe(3);

    wrapper.unmount();
    host.remove();
  });

  it("should restore the selection owned by each mixed slot and outer edit", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          { type: "text", value: "abc" },
          {
            type: "input",
            key: "input",
            props: { defaultValue: "x" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    let input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    input.focus();
    input.setSelectionRange(1, 1);
    input.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data: "y",
        inputType: "insertText",
      }),
    );
    input.value = "xy";
    input.setSelectionRange(2, 2);
    input.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "y",
        inputType: "insertText",
      }),
    );
    await wrapper.vm.$nextTick();

    let editable = wrapper.find<HTMLElement>(".antd-sender-input-slot");
    const textNode = editable.element.firstChild!;
    (editable.element as HTMLElement).focus();
    const selection = window.getSelection()!;
    const range = document.createRange();
    range.setStart(textNode, 3);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    editable.element.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data: "!",
        inputType: "insertText",
      }),
    );
    textNode.textContent = "abc!";
    range.setStart(textNode, 4);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    editable.element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "!",
        inputType: "insertText",
      }),
    );

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    editable = wrapper.find<HTMLElement>(".antd-sender-input-slot");
    expect((wrapper.vm as any).getValue().value).toBe("abcxy");
    expect(document.activeElement).toBe(editable.element);
    expect(window.getSelection()?.anchorNode?.textContent).toBe("abc");
    expect(window.getSelection()?.anchorOffset).toBe(3);

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    expect(input.value).toBe("x");
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(1);

    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        shiftKey: true,
        key: "z",
      }),
    );
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    expect(input.value).toBe("xy");
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(2);

    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        shiftKey: true,
        key: "z",
      }),
    );
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    editable = wrapper.find<HTMLElement>(".antd-sender-input-slot");
    expect((wrapper.vm as any).getValue().value).toBe("abc!xy");
    expect(document.activeElement).toBe(editable.element);
    expect(window.getSelection()?.anchorNode?.textContent).toBe("abc!");
    expect(window.getSelection()?.anchorOffset).toBe(4);

    wrapper.unmount();
    host.remove();
  });

  it("should restore an input selection when undoing public clear", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "input",
            key: "input",
            props: { defaultValue: "abcd" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    let input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    input.focus();
    input.setSelectionRange(2, 2);
    (wrapper.vm as any).clear();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find<HTMLElement>(".antd-sender-input-slot");
    (editable.element as HTMLElement).focus();
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(2);

    wrapper.unmount();
    host.remove();
  });

  it("should restore an input selection when undoing public insert", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "input",
            key: "input",
            props: { defaultValue: "abcd" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    let input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    input.focus();
    input.setSelectionRange(2, 2);
    (wrapper.vm as any).insert(
      [
        {
          type: "tag",
          key: "tag",
          props: { label: "Tag", value: "tag" },
        },
      ],
      "end",
    );
    await wrapper.vm.$nextTick();

    const editable = wrapper.find<HTMLElement>(".antd-sender-input-slot");
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    input = wrapper.find("input.antd-sender-slot-input")
      .element as HTMLInputElement;
    expect((wrapper.vm as any).getValue().slotConfig).toHaveLength(1);
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(2);

    wrapper.unmount();
    host.remove();
  });

  it("should preserve line breaks when pasting in slot mode", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: { slotConfig: [] },
    });
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    const pasteEvent = new Event("paste", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: {
        files: [],
        getData: (type: string) =>
          type === "text/plain" ? "first\nsecond" : "",
      },
    });

    editable.element.dispatchEvent(pasteEvent);

    expect((wrapper.vm as any).getValue().value).toBe("first\nsecond");

    wrapper.unmount();
    host.remove();
  });

  it("should preserve edge line breaks when pasting in slot mode", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: { slotConfig: [] },
    });
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    const pasteEvent = new Event("paste", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: {
        files: [],
        getData: (type: string) =>
          type === "text/plain" ? "\nfirst\nsecond\n" : "",
      },
    });

    editable.element.dispatchEvent(pasteEvent);

    expect((wrapper.vm as any).getValue().value).toBe("\nfirst\nsecond\n");

    wrapper.unmount();
    host.remove();
  });

  it("should preserve redo when a cloned controlled slotConfig follows an undo", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    let wrapper: ReturnType<typeof mount>;
    let syncControlledValue = false;
    const onChange = vi.fn(
      (
        _value: string,
        _event: Event | undefined,
        nextSlotConfig: SlotConfigType[] | undefined,
      ) => {
        if (
          wrapper &&
          syncControlledValue &&
          JSON.stringify((wrapper as any).props("slotConfig")) !==
            JSON.stringify(nextSlotConfig)
        ) {
          void wrapper.setProps({
            slotConfig: nextSlotConfig?.map(config => ({
              ...config,
              ...(config.type !== "text" && config.props
                ? { props: { ...config.props } }
                : {}),
            })),
          });
        }
      },
    );
    wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
        onChange,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    syncControlledValue = true;

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("keydown", { key: "Backspace" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "tag", type: "tag" }),
    ]);

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    wrapper.unmount();
    host.remove();
  });

  it("should reconcile a transformed controlled slotConfig during undo", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    let wrapper: ReturnType<typeof mount>;
    let transformRestoredValue = false;
    const onChange = vi.fn(
      (
        _value: string,
        _event: Event | undefined,
        nextSlotConfig: SlotConfigType[] | undefined,
      ) => {
        if (
          wrapper &&
          transformRestoredValue &&
          nextSlotConfig?.some(config =>
            config.type === "text" ? false : config.key === "tag",
          )
        ) {
          transformRestoredValue = false;
          void wrapper.setProps({
            slotConfig: [
              {
                type: "tag",
                key: "server-tag",
                props: { label: "Server Slot", value: "server" },
              },
            ],
          });
        }
      },
    );
    wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
        onChange,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    await editable.trigger("keydown", { key: "Backspace" });

    transformRestoredValue = true;
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect((wrapper as any).props("slotConfig")).toEqual([
      expect.objectContaining({ key: "server-tag" }),
    ]);
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "server-tag" }),
    ]);

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "server-tag" }),
    ]);

    wrapper.unmount();
    host.remove();
  });

  it("should preserve history for delayed controlled slotConfig echoes", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    let wrapper: ReturnType<typeof mount>;
    let syncControlledValue = false;
    const onChange = vi.fn(
      (
        _value: string,
        _event: Event | undefined,
        nextSlotConfig: SlotConfigType[] | undefined,
      ) => {
        if (wrapper && syncControlledValue) {
          globalThis.setTimeout(() => {
            void wrapper.setProps({
              slotConfig: nextSlotConfig?.map(config => ({
                ...config,
                ...(config.type !== "text" && config.props
                  ? { props: { ...config.props } }
                  : {}),
              })),
            });
          }, 10);
        }
      },
    );
    wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
        onChange,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    syncControlledValue = true;

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    selection?.removeAllRanges();
    selection?.addRange(range);
    await editable.trigger("keydown", { key: "Backspace" });
    await new Promise(resolve => globalThis.setTimeout(resolve, 20));
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "tag" }),
    ]);
    await new Promise(resolve => globalThis.setTimeout(resolve, 20));
    await wrapper.vm.$nextTick();

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    wrapper.unmount();
    host.remove();
  });

  it("should preserve history when controlled slotConfig echoes are coalesced", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    let wrapper: ReturnType<typeof mount>;
    let syncControlledValue = false;
    let pendingTimer: ReturnType<typeof globalThis.setTimeout> | undefined;
    const onChange = vi.fn(
      (
        _value: string,
        _event: Event | undefined,
        nextSlotConfig: SlotConfigType[] | undefined,
      ) => {
        if (!wrapper || !syncControlledValue) return;
        if (pendingTimer) globalThis.clearTimeout(pendingTimer);
        pendingTimer = globalThis.setTimeout(() => {
          void wrapper.setProps({
            slotConfig: nextSlotConfig?.map(config => ({
              ...config,
              ...(config.type !== "text" && config.props
                ? { props: { ...config.props } }
                : {}),
            })),
          });
        }, 10);
      },
    );
    wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
        onChange,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    syncControlledValue = true;

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("keydown", { key: "Backspace" });
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await new Promise(resolve => globalThis.setTimeout(resolve, 20));
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "tag" }),
    ]);

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    if (pendingTimer) globalThis.clearTimeout(pendingTimer);
    wrapper.unmount();
    host.remove();
  });

  it("should apply an out-of-order controlled slotConfig update", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const initialSlot: SlotConfigType = {
      type: "tag",
      key: "tag",
      props: { label: "Slot", value: "slot" },
    };
    const wrapper = mount(Sender, {
      attachTo: host,
      props: { slotConfig: [initialSlot] },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("keydown", { key: "Backspace" });
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();

    // This is an older controlled value arriving after a newer local change.
    await wrapper.setProps({
      slotConfig: [
        {
          ...initialSlot,
          props: { label: "Slot", value: "slot" },
        },
      ],
    });
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "tag", type: "tag" }),
    ]);

    wrapper.unmount();
    host.remove();
  });

  it("should record composition input in managed history", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("compositionstart");
    editable.element.appendChild(document.createTextNode("中文"));
    await editable.trigger("input", {
      inputType: "insertCompositionText",
      isComposing: true,
    });
    await editable.trigger("compositionend");

    expect((wrapper.vm as any).getValue().value).toContain("中文");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).not.toContain("中文");
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([
      expect.objectContaining({ key: "tag", type: "tag" }),
    ]);

    wrapper.unmount();
    host.remove();
  });

  it("should not record a cancelled composition as a history entry", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection()!;
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    editable.element.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data: "a",
        inputType: "insertText",
      }),
    );
    const textNode = document.createTextNode("a");
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    editable.element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "a",
        inputType: "insertText",
      }),
    );

    await editable.trigger("compositionstart");
    await editable.trigger("compositionend");
    await wrapper.vm.$nextTick();

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).not.toContain("a");

    wrapper.unmount();
    host.remove();
  });

  it("should undo and redo native paragraph nodes in managed history", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        submitType: "shiftEnter",
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection()!;
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    editable.element.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        inputType: "insertParagraph",
      }),
    );
    const paragraph = document.createElement("div");
    paragraph.textContent = "paragraph";
    range.insertNode(paragraph);
    range.setStart(paragraph.firstChild!, "paragraph".length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    editable.element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertParagraph",
      }),
    );

    expect((wrapper.vm as any).getValue().value).toContain("paragraph");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).not.toContain("paragraph");

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toContain("paragraph");
    expect(editable.element.querySelector("div")?.textContent).toBe(
      "paragraph",
    );

    wrapper.unmount();
    host.remove();
  });

  it("should preserve an interactive slot nested in a native paragraph", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        submitType: "shiftEnter",
        slotConfig: [
          {
            type: "input",
            key: "input",
            props: { defaultValue: "initial" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const slot = editable.element.querySelector<HTMLElement>(
      '[data-slot-key="input"]',
    )!;
    const selection = window.getSelection()!;
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    editable.element.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        inputType: "insertParagraph",
      }),
    );
    const paragraph = document.createElement("div");
    editable.element.insertBefore(paragraph, slot);
    paragraph.append(slot, document.createTextNode(" tail"));
    range.selectNodeContents(paragraph);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    editable.element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertParagraph",
      }),
    );

    expect((wrapper.vm as any).getValue().slotConfig).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "input", type: "input" }),
        expect.objectContaining({ type: "text", value: " tail" }),
      ]),
    );

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect(editable.element.querySelector("div")).toBeNull();

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect(
      editable.element.querySelector("div [data-slot-key='input']"),
    ).not.toBeNull();

    const restoredInput = wrapper.find("input.antd-sender-slot-input");
    await restoredInput.setValue("updated");
    expect((wrapper.vm as any).getValue().slotConfig).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "input",
          type: "input",
          value: "updated",
        }),
      ]),
    );

    wrapper.unmount();
    host.remove();
  });

  it("should group custom slot updates during composition", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    let updateCustomSlot: ((value: string) => void) | undefined;
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "custom",
            key: "custom",
            props: { defaultValue: "initial" },
            customRender: (value: string, update: (value: string) => void) => {
              updateCustomSlot = update;
              return <input value={value} />;
            },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    await editable.trigger("compositionstart");
    updateCustomSlot?.("中");
    updateCustomSlot?.("中文");
    await editable.trigger("compositionend");
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("中文");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("initial");

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig[0].value).toBe("中文");

    wrapper.unmount();
    host.remove();
  });

  it("should restore and remove a skill according to history snapshots", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    let wrapper: ReturnType<typeof mount>;
    let syncControlledValue = false;
    const onChange = vi.fn(
      (
        _value: string,
        _event: Event | undefined,
        _slotConfig: SlotConfigType[] | undefined,
        nextSkill: { value: string } | undefined,
      ) => {
        if (wrapper && syncControlledValue) {
          void wrapper.setProps({ skill: nextSkill });
        }
      },
    );
    wrapper = mount(Sender, {
      attachTo: host,
      props: {
        skill: {
          value: "translate",
          title: "Translate",
          closable: true,
        },
        slotConfig: [],
        onChange,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    syncControlledValue = true;

    await wrapper.find(".antd-sender-skill-close").trigger("click");
    await wrapper.vm.$nextTick();
    expect((wrapper as any).props("skill")).toBeUndefined();
    expect((wrapper.vm as any).getValue().skill).toBeUndefined();

    const editable = wrapper.find(".antd-sender-input-slot");
    expect(document.activeElement).toBe(editable.element);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        key: "z",
      }),
    );
    await wrapper.vm.$nextTick();
    expect((wrapper as any).props("skill")).toEqual(
      expect.objectContaining({ value: "translate" }),
    );
    expect((wrapper.vm as any).getValue().skill).toEqual(
      expect.objectContaining({ value: "translate" }),
    );

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper as any).props("skill")).toBeUndefined();
    expect((wrapper.vm as any).getValue().skill).toBeUndefined();

    wrapper.unmount();
    host.remove();
  });

  it("should reconcile a transformed controlled skill during undo", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    let wrapper: ReturnType<typeof mount>;
    let transformRestoredValue = false;
    const onChange = vi.fn(
      (
        _value: string,
        _event: Event | undefined,
        _slotConfig: SlotConfigType[] | undefined,
        nextSkill: SkillType | undefined,
      ) => {
        if (
          wrapper &&
          transformRestoredValue &&
          nextSkill?.value === "translate"
        ) {
          transformRestoredValue = false;
          void wrapper.setProps({
            skill: {
              value: "server-skill",
              title: "Server Skill",
              closable: true,
            },
          });
        }
      },
    );
    wrapper = mount(Sender, {
      attachTo: host,
      props: {
        skill: {
          value: "translate",
          title: "Translate",
          closable: true,
        },
        slotConfig: [],
        onChange,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.find(".antd-sender-skill-close").trigger("click");
    transformRestoredValue = true;
    const editable = wrapper.find(".antd-sender-input-slot");
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect((wrapper as any).props("skill")).toEqual(
      expect.objectContaining({ value: "server-skill" }),
    );
    expect((wrapper.vm as any).getValue().skill).toEqual(
      expect.objectContaining({ value: "server-skill" }),
    );

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().skill).toEqual(
      expect.objectContaining({ value: "server-skill" }),
    );

    wrapper.unmount();
    host.remove();
  });

  it("should reset managed history after an external skill change", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        skill: {
          value: "skill-a",
          title: "Skill A",
          closable: true,
        },
        slotConfig: [],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.setProps({
      skill: {
        value: "skill-b",
        title: "Skill B",
        closable: true,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.find(".antd-sender-skill-close").trigger("click");
    const editable = wrapper.find(".antd-sender-input-slot");
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).getValue().skill).toEqual(
      expect.objectContaining({ value: "skill-b" }),
    );

    wrapper.unmount();
    host.remove();
  });

  it("should reset history for a delayed controlled skill update", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    let wrapper: ReturnType<typeof mount>;
    let syncControlledValue = false;
    const onChange = vi.fn(
      (
        _value: string,
        _event: Event | undefined,
        _slotConfig: SlotConfigType[] | undefined,
        nextSkill: SkillType | undefined,
      ) => {
        if (wrapper && syncControlledValue) {
          globalThis.setTimeout(() => {
            void wrapper.setProps({
              skill: nextSkill ? { ...nextSkill } : undefined,
            });
          }, 10);
        }
      },
    );
    wrapper = mount(Sender, {
      attachTo: host,
      props: {
        skill: {
          value: "translate",
          title: "Translate",
          closable: true,
        },
        slotConfig: [],
        onChange,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    syncControlledValue = true;

    await wrapper.find(".antd-sender-skill-close").trigger("click");
    await wrapper.vm.$nextTick();
    const editable = wrapper.find(".antd-sender-input-slot");
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    await new Promise(resolve => globalThis.setTimeout(resolve, 20));
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).getValue().skill).toEqual(
      expect.objectContaining({ value: "translate" }),
    );

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    await new Promise(resolve => globalThis.setTimeout(resolve, 20));
    await wrapper.vm.$nextTick();
    // The delayed controlled prop is authoritative and starts a new history
    // baseline, so undo cannot restore the older local state.
    expect((wrapper.vm as any).getValue().skill).toEqual(
      expect.objectContaining({ value: "translate" }),
    );

    wrapper.unmount();
    host.remove();
  });

  it("should keep synchronous paste separate from preceding typing history", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);

    editable.element.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data: "a",
        inputType: "insertText",
      }),
    );
    const typedRange = selection!.getRangeAt(0);
    const typedNode = document.createTextNode("a");
    typedRange.insertNode(typedNode);
    typedRange.setStartAfter(typedNode);
    typedRange.collapse(true);
    selection!.removeAllRanges();
    selection!.addRange(typedRange);
    editable.element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "a",
        inputType: "insertText",
      }),
    );

    const originalExecCommandDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "execCommand",
    );
    const execCommand = vi.fn(
      (_command: string, _showUi: boolean, value: string) => {
        editable.element.dispatchEvent(
          new InputEvent("beforeinput", {
            bubbles: true,
            cancelable: true,
            data: value,
            inputType: "insertText",
          }),
        );
        const currentRange = selection!.getRangeAt(0);
        const textNode = document.createTextNode(value);
        currentRange.insertNode(textNode);
        currentRange.setStartAfter(textNode);
        currentRange.collapse(true);
        selection!.removeAllRanges();
        selection!.addRange(currentRange);
        editable.element.dispatchEvent(
          new InputEvent("input", {
            bubbles: true,
            data: value,
            inputType: "insertText",
          }),
        );
        return true;
      },
    );
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });
    const pasteEvent = new Event("paste", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: {
        files: [],
        getData: (type: string) => (type === "text/plain" ? "paste" : ""),
      },
    });

    editable.element.dispatchEvent(pasteEvent);
    expect((wrapper.vm as any).getValue().value).toContain("apaste");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toContain("a");
    expect((wrapper.vm as any).getValue().value).not.toContain("paste");

    if (originalExecCommandDescriptor) {
      Object.defineProperty(
        document,
        "execCommand",
        originalExecCommandDescriptor,
      );
    } else {
      Reflect.deleteProperty(document, "execCommand");
    }
    wrapper.unmount();
    host.remove();
  });

  it("should keep typing grouped only while the caret is contiguous", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          { type: "text", value: "base" },
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection()!;
    const insertText = (value: string) => {
      editable.element.dispatchEvent(
        new InputEvent("beforeinput", {
          bubbles: true,
          cancelable: true,
          data: value,
          inputType: "insertText",
        }),
      );
      const currentRange = selection.getRangeAt(0);
      const textNode = document.createTextNode(value);
      currentRange.insertNode(textNode);
      currentRange.setStartAfter(textNode);
      currentRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(currentRange);
      editable.element.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: value,
          inputType: "insertText",
        }),
      );
    };

    const endRange = document.createRange();
    endRange.selectNodeContents(editable.element);
    endRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(endRange);
    insertText("FIRST");

    const startText = editable.element.firstChild!;
    const movedRange = document.createRange();
    movedRange.setStart(startText, 0);
    movedRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(movedRange);
    insertText("SECOND");

    expect((wrapper.vm as any).getValue().value).toContain("FIRST");
    expect((wrapper.vm as any).getValue().value).toContain("SECOND");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toContain("FIRST");
    expect((wrapper.vm as any).getValue().value).not.toContain("SECOND");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).not.toContain("FIRST");

    wrapper.unmount();
    host.remove();
  });

  it("should still group contiguous typing into one undo operation", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection()!;
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    const insertText = (value: string) => {
      editable.element.dispatchEvent(
        new InputEvent("beforeinput", {
          bubbles: true,
          cancelable: true,
          data: value,
          inputType: "insertText",
        }),
      );
      const currentRange = selection.getRangeAt(0);
      const node = document.createTextNode(value);
      currentRange.insertNode(node);
      currentRange.setStartAfter(node);
      currentRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(currentRange);
      editable.element.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: value,
          inputType: "insertText",
        }),
      );
    };

    insertText("A");
    insertText("B");
    expect((wrapper.vm as any).getValue().value).toContain("AB");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).not.toContain("A");
    expect((wrapper.vm as any).getValue().value).not.toContain("B");

    wrapper.unmount();
    host.remove();
  });

  it("should discard redo before recording typing after undo", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection()!;
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    const insertText = (value: string, inputType: string) => {
      editable.element.dispatchEvent(
        new InputEvent("beforeinput", {
          bubbles: true,
          cancelable: true,
          data: value,
          inputType,
        }),
      );
      const currentRange = selection.getRangeAt(0);
      const node = document.createTextNode(value);
      currentRange.insertNode(node);
      currentRange.setStartAfter(node);
      currentRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(currentRange);
      editable.element.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: value,
          inputType,
        }),
      );
    };

    insertText("a", "insertText");
    insertText("paste", "insertFromPaste");
    expect((wrapper.vm as any).getValue().value).toContain("apaste");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toContain("a");
    expect((wrapper.vm as any).getValue().value).not.toContain("paste");

    insertText("b", "insertText");
    expect((wrapper.vm as any).getValue().value).toContain("ab");

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toContain("ab");
    expect((wrapper.vm as any).getValue().value).not.toContain("paste");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toContain("a");
    expect((wrapper.vm as any).getValue().value).not.toContain("ab");

    wrapper.unmount();
    host.remove();
  });

  it("should keep the next typed cursor independent from paste history", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "Slot", value: "slot" },
          },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection()!;
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    const insertText = (value: string, inputType = "insertText") => {
      editable.element.dispatchEvent(
        new InputEvent("beforeinput", {
          bubbles: true,
          cancelable: true,
          data: value,
          inputType,
        }),
      );
      const currentRange = selection.getRangeAt(0);
      const textNode = document.createTextNode(value);
      currentRange.insertNode(textNode);
      currentRange.setStartAfter(textNode);
      currentRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(currentRange);
      editable.element.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: value,
          inputType,
        }),
      );
    };
    const originalExecCommandDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "execCommand",
    );
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn((_command: string, _showUi: boolean, value: string) => {
        insertText(value);
        return true;
      }),
    });
    const pasteEvent = new Event("paste", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: {
        files: [],
        getData: (type: string) => (type === "text/plain" ? "hello" : ""),
      },
    });

    editable.element.dispatchEvent(pasteEvent);
    insertText("a");
    expect((wrapper.vm as any).getValue().value).toContain("helloa");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toContain("hello");
    expect((wrapper.vm as any).getValue().value).not.toContain("helloa");
    expect(selection.anchorNode).toBe(editable.element);
    expect(selection.anchorOffset).toBe(editable.element.childNodes.length);

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toContain("helloa");

    if (originalExecCommandDescriptor) {
      Object.defineProperty(
        document,
        "execCommand",
        originalExecCommandDescriptor,
      );
    } else {
      Reflect.deleteProperty(document, "execCommand");
    }
    wrapper.unmount();
    host.remove();
  });

  it("should undo fallback paste in an otherwise plain text editor", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: { slotConfig: [] },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const selection = window.getSelection()!;
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    const originalExecCommandDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "execCommand",
    );
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => false),
    });
    const pasteEvent = new Event("paste", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: {
        files: [],
        getData: (type: string) => (type === "text/plain" ? "fallback" : ""),
      },
    });

    editable.element.dispatchEvent(pasteEvent);
    expect((wrapper.vm as any).getValue().value).toBe("fallback");

    const undoEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "z",
    });
    editable.element.dispatchEvent(undoEvent);
    await wrapper.vm.$nextTick();
    expect(undoEvent.defaultPrevented).toBe(true);
    expect((wrapper.vm as any).getValue().value).toBe("");

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toBe("fallback");

    if (originalExecCommandDescriptor) {
      Object.defineProperty(
        document,
        "execCommand",
        originalExecCommandDescriptor,
      );
    } else {
      Reflect.deleteProperty(document, "execCommand");
    }
    wrapper.unmount();
    host.remove();
  });

  it("should normalize fallback paste text typed in the skill placeholder", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        skill: {
          value: "translate",
          title: "Translate",
          closable: true,
        },
        slotConfig: [],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const skillNode = wrapper.find(".antd-sender-skill");
    const skillText = document.createTextNode("");
    skillNode.element.appendChild(skillText);
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(skillText, 0);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    const originalExecCommandDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "execCommand",
    );
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => false),
    });
    const pasteEvent = new Event("paste", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: {
        files: [],
        getData: (type: string) => (type === "text/plain" ? "pasted" : ""),
      },
    });

    editable.element.dispatchEvent(pasteEvent);
    expect((wrapper.vm as any).getValue().value).toBe("pasted");

    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toBe("");
    expect((wrapper.vm as any).getValue().skill).toEqual(
      expect.objectContaining({ value: "translate" }),
    );

    if (originalExecCommandDescriptor) {
      Object.defineProperty(
        document,
        "execCommand",
        originalExecCommandDescriptor,
      );
    } else {
      Reflect.deleteProperty(document, "execCommand");
    }
    wrapper.unmount();
    host.remove();
  });

  it("should keep history when controlled slotConfig echo contains Date", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const date = new Date("2025-01-01T00:00:00.000Z");
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: {
              label: "T",
              value: "v",
              deadline: date,
            } as unknown as Record<string, unknown>,
          } as SlotConfigType,
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const editable = wrapper.find(".antd-sender-input-slot");
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    sel?.removeAllRanges();
    sel?.addRange(range);
    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig.length).toBe(1);
    const clonedDate = new Date(date.getTime());
    await wrapper.setProps({
      slotConfig: [
        {
          type: "tag",
          key: "tag",
          props: {
            label: "T",
            value: "v",
            deadline: clonedDate,
          } as unknown as Record<string, unknown>,
        } as SlotConfigType,
      ],
    });
    await wrapper.vm.$nextTick();
    const sel2 = window.getSelection();
    const range2 = document.createRange();
    range2.selectNodeContents(editable.element);
    sel2?.removeAllRanges();
    sel2?.addRange(range2);
    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig.length).toBe(1);
    wrapper.unmount();
    host.remove();
  });

  it("should preserve redo for an equivalent cloned invalid Date", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: {
              label: "T",
              value: "v",
              deadline: new Date(Number.NaN),
            } as unknown as Record<string, unknown>,
          } as SlotConfigType,
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const editable = wrapper.find(".antd-sender-input-slot");
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    await editable.trigger("keydown", { key: "Backspace" });
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    await wrapper.setProps({
      slotConfig: [
        {
          type: "tag",
          key: "tag",
          value: "v",
          props: {
            label: "T",
            value: "v",
            deadline: new Date(Number.NaN),
          } as unknown as Record<string, unknown>,
        } as unknown as SlotConfigType,
      ],
    });
    await wrapper.vm.$nextTick();

    await editable.trigger("keydown", {
      ctrlKey: true,
      key: "z",
      shiftKey: true,
    });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);

    wrapper.unmount();
    host.remove();
  });

  it("should apply an authoritative RegExp lastIndex change", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const initialPattern = /a/g;
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: {
              label: "T",
              value: "v",
              pattern: initialPattern,
            } as unknown as Record<string, unknown>,
          } as SlotConfigType,
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const nextPattern = /a/g;
    nextPattern.lastIndex = 2;
    await wrapper.setProps({
      slotConfig: [
        {
          type: "tag",
          key: "tag",
          props: {
            label: "T",
            value: "v",
            pattern: nextPattern,
          } as unknown as Record<string, unknown>,
        } as SlotConfigType,
      ],
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const actualPattern = (wrapper.vm as any).getValue().slotConfig[0].props
      .pattern as RegExp;
    expect(actualPattern.lastIndex).toBe(2);

    wrapper.unmount();
    host.remove();
  });

  it("should apply authoritative complex values with different observable structure", async () => {
    const shared = { value: 1 };
    const offsetBuffer = new Uint8Array([7, 7]).buffer;
    const dataViewBuffer = new Uint8Array([9, 9]).buffer;
    const sparse: unknown[] = [];
    sparse.length = 1;
    const cases: Array<{
      name: string;
      initial: unknown;
      next: unknown;
      assertValue: (value: any) => void;
    }> = [
      {
        name: "shared-reference topology",
        initial: { first: shared, second: shared },
        next: { first: { value: 1 }, second: { value: 1 } },
        assertValue: value => expect(value.first).not.toBe(value.second),
      },
      {
        name: "bijective Map entries",
        initial: new Map([
          [{ id: 1 }, "a"],
          [{ id: 1 }, "a"],
        ]),
        next: new Map([
          [{ id: 1 }, "a"],
          [{ id: 2 }, "b"],
        ]),
        assertValue: value => {
          expect(Array.from(value.keys(), (key: any) => key.id)).toEqual([
            1, 2,
          ]);
          expect(Array.from(value.values())).toEqual(["a", "b"]);
        },
      },
      {
        name: "bijective Set members",
        initial: new Set([{ id: 1 }, { id: 1 }]),
        next: new Set([{ id: 1 }, { id: 2 }]),
        assertValue: value =>
          expect(Array.from(value, (entry: any) => entry.id)).toEqual([1, 2]),
      },
      {
        name: "typed-array byteOffset",
        initial: new Uint8Array(offsetBuffer, 0, 1),
        next: new Uint8Array(offsetBuffer, 1, 1),
        assertValue: value => expect(value.byteOffset).toBe(1),
      },
      {
        name: "DataView byteOffset",
        initial: new DataView(dataViewBuffer, 0, 1),
        next: new DataView(dataViewBuffer, 1, 1),
        assertValue: value => expect(value.byteOffset).toBe(1),
      },
      {
        name: "sparse array holes",
        initial: [undefined],
        next: sparse,
        assertValue: value =>
          expect(Object.prototype.hasOwnProperty.call(value, 0)).toBe(false),
      },
    ];

    for (const testCase of cases) {
      const host = document.createElement("div");
      document.body.appendChild(host);
      const wrapper = mount(Sender, {
        attachTo: host,
        props: {
          slotConfig: [
            {
              type: "tag",
              key: "tag",
              props: {
                label: "T",
                value: "v",
                payload: testCase.initial,
              } as unknown as Record<string, unknown>,
            } as SlotConfigType,
          ],
        },
      });
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      await wrapper.setProps({
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: {
              label: "T",
              value: "v",
              payload: testCase.next,
            } as unknown as Record<string, unknown>,
          } as SlotConfigType,
        ],
      });
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      const actual = (wrapper.vm as any).getValue().slotConfig[0].props.payload;
      try {
        testCase.assertValue(actual);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed complex-value case: ${testCase.name}: ${detail}`,
        );
      }
      wrapper.unmount();
      host.remove();
    }
  });

  it("should keep history when controlled slotConfig echo contains Map/Set/Symbol", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const sym = Symbol("s");
    const map = new Map([["k", 1]]);
    const set = new Set([1, 2]);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: {
              label: "T",
              value: "v",
              map,
              set,
              [sym]: 123,
            } as unknown as Record<string, unknown>,
          } as SlotConfigType,
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const editable = wrapper.find(".antd-sender-input-slot");
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    sel?.removeAllRanges();
    sel?.addRange(range);
    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig.length).toBe(1);
    const clonedMap = new Map([["k", 1]]);
    const clonedSet = new Set([1, 2]);
    await wrapper.setProps({
      slotConfig: [
        {
          type: "tag",
          key: "tag",
          props: {
            label: "T",
            value: "v",
            map: clonedMap,
            set: clonedSet,
            [sym]: 123,
          } as unknown as Record<string, unknown>,
        } as SlotConfigType,
      ],
    });
    await wrapper.vm.$nextTick();
    const sel2 = window.getSelection();
    const range2 = document.createRange();
    range2.selectNodeContents(editable.element);
    sel2?.removeAllRanges();
    sel2?.addRange(range2);
    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig.length).toBe(1);
    wrapper.unmount();
    host.remove();
  });

  it("should not swallow native undo after redo branch is discarded (slice fix)", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        slotConfig: [
          {
            type: "tag",
            key: "tag",
            props: { label: "T", value: "v" },
          } as SlotConfigType,
        ],
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const editable = wrapper.find(".antd-sender-input-slot");
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editable.element);
    sel?.removeAllRanges();
    sel?.addRange(range);
    await editable.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as any).getValue().slotConfig).toEqual([]);
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().slotConfig.length).toBe(1);
    // redo branch exists here (empty). Now type new plain text to discard redo branch
    const sel2 = window.getSelection();
    const range2 = document.createRange();
    range2.selectNodeContents(editable.element);
    range2.collapse(false);
    sel2?.removeAllRanges();
    sel2?.addRange(range2);
    // simulate typing "a" as plain text (managed after slot)
    editable.element.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data: "a",
        inputType: "insertText",
      }),
    );
    const node = document.createTextNode("a");
    range2.insertNode(node);
    range2.setStartAfter(node);
    range2.collapse(true);
    sel2?.removeAllRanges();
    sel2?.addRange(range2);
    editable.element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "a",
        inputType: "insertText",
      }),
    );
    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).getValue().value).toContain("a");
    // redo should now be discarded (history slice), but undo should still work for the new typing
    await editable.trigger("keydown", { ctrlKey: true, key: "z" });
    await wrapper.vm.$nextTick();
    // after undo, "a" should be gone but tag should remain
    expect((wrapper.vm as any).getValue().value).not.toContain("a");
    expect((wrapper.vm as any).getValue().slotConfig.length).toBe(1);
    wrapper.unmount();
    host.remove();
  });

  it("should expose disabled skill close with aria-disabled and keyboard guard", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const onClose = vi.fn();
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        disabled: true,
        skill: {
          value: "s",
          title: "S",
          closable: { closeIcon: "x", onClose },
        } as SkillType,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const close = document.body.querySelector(
      ".antd-sender-skill-close",
    ) as HTMLElement | null;
    expect(close).not.toBeNull();
    expect(close!.getAttribute("aria-disabled")).toBe("true");
    expect(close!.getAttribute("tabindex")).toBe("-1");
    expect(close!.classList.contains("antd-sender-skill-close-disabled")).toBe(
      true,
    );
    close!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(onClose).not.toHaveBeenCalled();
    expect((wrapper.vm as any).getValue().skill).toBeTruthy();
    // keyboard Enter should also be blocked when disabled
    close!.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );
    await wrapper.vm.$nextTick();
    expect(onClose).not.toHaveBeenCalled();
    wrapper.unmount();
    host.remove();
  });

  it("should pass a MouseEvent to onClose for keyboard activation", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const onClose = vi.fn();
    const wrapper = mount(Sender, {
      attachTo: host,
      props: {
        skill: {
          value: "s",
          title: "S",
          closable: { closeIcon: "x", onClose },
        } as SkillType,
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const close = wrapper.find(".antd-sender-skill-close");
    await close.trigger("keydown", { key: "Enter" });
    await wrapper.vm.$nextTick();

    expect(onClose).toHaveBeenCalledOnce();
    const closeEvent = onClose.mock.calls[0]![0] as MouseEvent;
    expect(closeEvent).toBeInstanceOf(MouseEvent);
    expect(closeEvent.button).toBe(0);
    expect(closeEvent.clientX).toBe(0);
    expect(closeEvent.target).toBe(close.element);
    expect((wrapper.vm as any).getValue().skill).toBeUndefined();

    wrapper.unmount();
    host.remove();
  });
});

describe("Sender.Header", () => {
  it("should use sender default prefix class", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true },
    });
    expect(wrapper.find(".antd-sender-header").exists()).toBe(true);
  });

  it("should inherit prefix class from Sender context", () => {
    const wrapper = mount(Sender, {
      props: {
        prefixCls: "custom-sender",
        header: () => <Sender.Header open title="Header Title" />,
      },
    });
    expect(wrapper.find(".custom-sender-header").exists()).toBe(true);
  });

  it("should render when open", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true, title: "Header Title" },
    });
    expect(wrapper.text()).toContain("Header Title");
  });

  it("should support title slot", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true, title: "Prop Title" },
      slots: {
        title: () => <span class="header-slot-title">Slot Title</span>,
      },
    });
    expect(wrapper.find(".header-slot-title").exists()).toBe(true);
    expect(wrapper.text()).toContain("Slot Title");
    expect(wrapper.text()).not.toContain("Prop Title");
  });

  it("should not render content when closed", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: false, title: "Hidden" },
    });
    expect(wrapper.text()).not.toContain("Hidden");
  });

  it("should call onOpenChange when close clicked", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(Sender.Header, {
      props: { open: true, title: "Test", onOpenChange },
    });

    const closeBtn = wrapper.find("button");
    await closeBtn.trigger("click");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should hide close button when closable is false", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true, title: "Test", closable: false },
    });
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("should render slot content", () => {
    const wrapper = mount(Sender.Header, {
      props: { open: true },
      slots: {
        default: () => <div class="custom-content">Content</div>,
      },
    });
    expect(wrapper.find(".custom-content").exists()).toBe(true);
  });
});

describe("Sender.Switch", () => {
  it("should render unchecked by default", () => {
    const wrapper = mount(Sender.Switch, {
      props: {
        checkedChildren: "On",
        unCheckedChildren: "Off",
      },
    });
    expect(wrapper.text()).toContain("Off");
  });

  it("should toggle on click", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Sender.Switch, {
      props: {
        checkedChildren: "On",
        unCheckedChildren: "Off",
        onChange,
      },
    });

    await wrapper.find("button").trigger("click");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should support controlled value", () => {
    const wrapper = mount(Sender.Switch, {
      props: {
        value: true,
        checkedChildren: "On",
        unCheckedChildren: "Off",
      },
    });
    expect(wrapper.text()).toContain("On");
  });

  it("should render icon", () => {
    const wrapper = mount(Sender.Switch, {
      props: {
        icon: <span class="my-icon">I</span>,
      },
    });
    expect(wrapper.find(".my-icon").exists()).toBe(true);
  });

  it("should support icon and checked state slots", () => {
    const wrapper = mount(Sender.Switch, {
      props: {
        value: true,
        icon: <span class="prop-icon">P</span>,
        checkedChildren: "Prop Checked",
        unCheckedChildren: "Prop Unchecked",
      },
      slots: {
        icon: () => <span class="slot-icon">S</span>,
        checkedChildren: () => (
          <span class="slot-checked-children">Slot Checked</span>
        ),
        unCheckedChildren: () => (
          <span class="slot-unchecked-children">Slot Unchecked</span>
        ),
      },
    });

    expect(wrapper.find(".slot-icon").exists()).toBe(true);
    expect(wrapper.find(".prop-icon").exists()).toBe(false);
    expect(wrapper.find(".slot-checked-children").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Prop Checked");
  });

  it("should support uncheckedChildren slot", () => {
    const wrapper = mount(Sender.Switch, {
      slots: {
        unCheckedChildren: () => (
          <span class="slot-unchecked-children">Slot Unchecked</span>
        ),
      },
    });

    expect(wrapper.find(".slot-unchecked-children").exists()).toBe(true);
  });

  it("should apply checked class", () => {
    const wrapper = mount(Sender.Switch, {
      props: { value: true },
    });
    expect(wrapper.find("[class*='switch-checked']").exists()).toBe(true);
  });
});
