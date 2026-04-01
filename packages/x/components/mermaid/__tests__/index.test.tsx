import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { nextTick } from "vue";

import Mermaid from "../Mermaid";

const mermaidMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  parse: vi.fn(),
  render: vi.fn(),
}));

vi.mock("../loader", () => ({
  initializeMermaid: (config: any) => mermaidMock.initialize(config),
  parseMermaid: (...args: any[]) => mermaidMock.parse(...args),
  renderMermaid: (...args: any[]) => mermaidMock.render(...args),
}));

const content = "graph TD; A-->B;";

function flushPromises(wait = 0) {
  return new Promise(resolve => setTimeout(resolve, wait));
}

function readScale(transform: string) {
  const matched = transform.match(/scale\(([^)]+)\)/);
  if (!matched?.[1]) return 1;
  return Number(matched[1]);
}

describe("Mermaid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mermaidMock.parse.mockResolvedValue(true);
    mermaidMock.render.mockResolvedValue({
      svg: '<svg viewBox="0 0 100 100"><rect width="100" height="100"/></svg>',
    });
  });

  it("renders diagram in image mode by default", async () => {
    const wrapper = mount(Mermaid, {
      props: {
        content,
      },
    });

    await flushPromises();

    expect(wrapper.find(".antd-mermaid").exists()).toBe(true);
    expect(mermaidMock.initialize).toHaveBeenCalledTimes(1);
    expect(mermaidMock.render).toHaveBeenCalledWith(
      expect.any(String),
      content,
    );
    expect(wrapper.find(".antd-mermaid-graph svg").exists()).toBe(true);
  });

  it("switches to code mode and emits render type events", async () => {
    const wrapper = mount(Mermaid, {
      props: {
        content,
      },
    });

    await flushPromises();

    wrapper.findComponent({ name: "ASegmented" }).vm.$emit("change", "code");
    await nextTick();

    expect(wrapper.find(".antd-mermaid-code").exists()).toBe(true);
    expect(wrapper.emitted("update:renderType")?.[0]).toEqual(["code"]);
    expect(wrapper.emitted("renderTypeChange")?.[0]).toEqual(["code"]);
  });

  it("supports controlled renderType", async () => {
    const wrapper = mount(Mermaid, {
      props: {
        content,
        renderType: "code",
      },
    });

    await flushPromises();

    expect(wrapper.find(".antd-mermaid-code").exists()).toBe(true);

    await wrapper.setProps({ renderType: "image" });
    await flushPromises(200);

    expect(wrapper.find(".antd-mermaid-code").exists()).toBe(false);
    expect(wrapper.find(".antd-mermaid-graph svg").exists()).toBe(true);
  });

  it("supports action toggles and custom actions", async () => {
    const wrapper = mount(Mermaid, {
      props: {
        content,
        actions: {
          enableZoom: false,
          enableDownload: false,
          customActions: [
            {
              key: "custom",
              actionRender: () => <span class="custom-action">C</span>,
            },
          ],
        },
      },
    });

    await flushPromises();

    expect(wrapper.find(".custom-action").exists()).toBe(true);
    expect(wrapper.find(".anticon-zoom-in").exists()).toBe(false);
    expect(wrapper.find(".anticon-zoom-out").exists()).toBe(false);
    expect(wrapper.find(".anticon-download").exists()).toBe(false);
  });

  it("supports header slot and prefers it over header prop", async () => {
    const wrapper = mount(Mermaid, {
      props: {
        content,
        header: <div class="prop-header">Prop Header</div>,
      },
      slots: {
        header: () => <div class="slot-header">Slot Header</div>,
      },
    });

    await flushPromises();

    expect(wrapper.find(".slot-header").exists()).toBe(true);
    expect(wrapper.find(".prop-header").exists()).toBe(false);
  });

  it("clamps zoom scale between 0.5 and 3", async () => {
    const wrapper = mount(Mermaid, {
      props: {
        content,
      },
    });

    await flushPromises();

    const graphEl = wrapper.find(".antd-mermaid-graph").element;
    for (let i = 0; i < 40; i += 1) {
      graphEl.dispatchEvent(
        new WheelEvent("wheel", {
          deltaY: -100,
          bubbles: true,
          cancelable: true,
        }),
      );
    }
    await nextTick();

    const svgEl = wrapper.find(".antd-mermaid-graph svg").element as SVGElement;
    const upper = readScale(svgEl.style.transform);
    expect(upper).toBeLessThanOrEqual(3);

    for (let i = 0; i < 60; i += 1) {
      graphEl.dispatchEvent(
        new WheelEvent("wheel", {
          deltaY: 100,
          bubbles: true,
          cancelable: true,
        }),
      );
    }
    await nextTick();

    const lower = readScale(svgEl.style.transform);
    expect(lower).toBeGreaterThanOrEqual(0.5);
  });

  it("handles invalid syntax without crashing", async () => {
    mermaidMock.parse.mockResolvedValue(false);

    const wrapper = mount(Mermaid, {
      props: {
        content: "invalid",
      },
    });

    await flushPromises();

    expect(wrapper.find(".antd-mermaid").exists()).toBe(true);
    expect(mermaidMock.render).not.toHaveBeenCalled();
  });

  it("exposes nativeElement ref", () => {
    const wrapper = mount(Mermaid, {
      props: {
        content,
      },
    });

    expect((wrapper.vm as any).nativeElement).toBeInstanceOf(HTMLElement);
  });
});
