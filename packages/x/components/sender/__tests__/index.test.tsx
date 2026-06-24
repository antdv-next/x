import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SlotConfigType } from "../interface";

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

  it("should remove the slot after cursor when deleting at the editor boundary", async () => {
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
    range.setStart(editable.element, 0);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    await editable.trigger("keydown", { key: "Delete" });

    const lastChange = onChange.mock.calls[onChange.mock.calls.length - 1]!;
    expect(lastChange[2].map((item: SlotConfigType) => item.key)).toEqual([
      "assistant2",
      "assistant3",
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
