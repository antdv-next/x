import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Sender from "..";

beforeEach(() => {
  document.head.innerHTML = "";
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
