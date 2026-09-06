import { OpenAIOutlined } from "@antdv-next/icons";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, type VNodeChild } from "vue";

import type { ActionsComponents } from "../interface";

import Sender from "..";

const ARROW_PATH = "M868 545.5L536.1 163";

const Host = defineComponent({
  name: "Host",
  setup(_, { slots }) {
    return () => <Sender>{{ suffix: slots.suffix }}</Sender>;
  },
});

type SenderLayoutSlotInfo = {
  defaultNode: VNodeChild;
  components: ActionsComponents;
};

const withIconSlot =
  (name: keyof ActionsComponents) =>
  ({ components }: SenderLayoutSlotInfo) => {
    const Button = components[name];
    return <Button>{{ icon: () => h(OpenAIOutlined) }}</Button>;
  };

describe("Sender action button icon customization (#202)", () => {
  it("SendButton icon slot overrides the default arrow", () => {
    const wrapper = mount(Host, {
      slots: { suffix: withIconSlot("SendButton") },
    });

    const btn = wrapper.find(".antd-sender-actions-btn");
    expect(btn.exists()).toBe(true);
    expect(btn.html()).toContain("anticon-open-a-i");
    expect(btn.html()).not.toContain(ARROW_PATH);
  });
  it("SendButton icon prop still overrides the default arrow", () => {
    const iconPropRender = ({ components }: SenderLayoutSlotInfo) => (
      <components.SendButton type="primary" icon={h(OpenAIOutlined)} />
    );
    const wrapper = mount(Host, { slots: { suffix: iconPropRender } });

    const btn = wrapper.find(".antd-sender-actions-btn");
    expect(btn.html()).toContain("anticon-open-a-i");
    expect(btn.html()).not.toContain(ARROW_PATH);
  });

  it("SendButton without icon slot keeps the default arrow", () => {
    const plainRender = ({ components }: SenderLayoutSlotInfo) => (
      <components.SendButton type="primary" />
    );
    const wrapper = mount(Host, { slots: { suffix: plainRender } });

    const btn = wrapper.find(".antd-sender-actions-btn");
    expect(btn.html()).toContain(ARROW_PATH);
  });

  it("ClearButton icon slot overrides the default clear icon", () => {
    const wrapper = mount(Host, {
      slots: { suffix: withIconSlot("ClearButton") },
    });

    const btn = wrapper.find(".antd-sender-actions-btn");
    expect(btn.html()).toContain("anticon-open-a-i");
    expect(btn.html()).not.toContain("anticon-clear");
  });

  it("LoadingButton icon slot overrides the default stop icon", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () => (
            <Sender loading>{{ suffix: withIconSlot("LoadingButton") }}</Sender>
          );
        },
      }),
    );

    const btn = wrapper.find(".antd-sender-actions-btn-loading-button");
    expect(btn.exists()).toBe(true);
    expect(btn.html()).toContain("anticon-open-a-i");
  });

  it("SpeechButton icon slot overrides the default audio icon", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () => (
            <Sender allowSpeech>
              {{ suffix: withIconSlot("SpeechButton") }}
            </Sender>
          );
        },
      }),
    );

    const btn = wrapper.find(".antd-sender-actions-btn");
    expect(btn.html()).toContain("anticon-open-a-i");
    expect(btn.html()).not.toContain("anticon-audio");
  });
});
