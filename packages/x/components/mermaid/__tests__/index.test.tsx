import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { nextTick } from "vue";

import Mermaid, { type MermaidHeaderSlotScope } from "../Mermaid";

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

  it("exposes diagram controls through the header slot scope", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    const wrapper = mount(Mermaid, {
      props: {
        content,
      },
      slots: {
        header: (scope: MermaidHeaderSlotScope) => (
          <div class="slot-header">
            <span class="slot-render-type">{scope.renderType}</span>
            <button class="slot-zoom-in" onClick={scope.zoomIn} />
            <button class="slot-reset-zoom" onClick={scope.resetZoom} />
            <button
              class="slot-set-code"
              onClick={() => scope.setRenderType("code")}
            />
            <button class="slot-download" onClick={scope.download} />
            <button class="slot-copy" onClick={scope.copy} />
          </div>
        ),
      },
    });

    await flushPromises();

    await wrapper.find(".slot-zoom-in").trigger("click");
    await nextTick();
    const svgEl = wrapper.find(".antd-mermaid-graph svg").element as SVGElement;
    expect(readScale(svgEl.style.transform)).toBe(1.2);

    await wrapper.find(".slot-reset-zoom").trigger("click");
    await nextTick();
    expect(readScale(svgEl.style.transform)).toBe(1);

    await wrapper.find(".slot-set-code").trigger("click");
    await nextTick();
    expect(wrapper.find(".slot-render-type").text()).toBe("code");
    expect(wrapper.emitted("update:renderType")?.[0]).toEqual(["code"]);

    await wrapper.find(".slot-copy").trigger("click");
    expect(writeText).toHaveBeenCalledWith(content);
    expect(wrapper.find(".slot-download").exists()).toBe(true);
  });

  it("clamps zoom scale at 0.5 and allows zooming beyond 3", async () => {
    const wrapper = mount(Mermaid, {
      props: {
        content,
      },
    });

    await flushPromises();

    const svgEl = wrapper.find(".antd-mermaid-graph svg").element as SVGElement;
    const graphEl = wrapper.find(".antd-mermaid-graph").element;

    graphEl.dispatchEvent(
      new WheelEvent("wheel", {
        deltaY: -100,
        bubbles: true,
        cancelable: true,
      }),
    );
    await nextTick();
    expect(readScale(svgEl.style.transform)).toBe(1.1);

    const zoomInButton = wrapper.find(".anticon-zoom-in");
    for (let i = 0; i < 11; i += 1) {
      await zoomInButton.trigger("click");
    }
    await nextTick();
    expect(readScale(svgEl.style.transform)).toBeGreaterThan(3);

    const zoomOutButton = wrapper.find(".anticon-zoom-out");
    for (let i = 0; i < 20; i += 1) {
      await zoomOutButton.trigger("click");
    }
    await nextTick();
    expect(readScale(svgEl.style.transform)).toBe(0.5);
  });

  it("downloads the full diagram regardless of zoom state", async () => {
    mermaidMock.render.mockResolvedValueOnce({
      svg: '<svg viewBox="0 0 640 480"><rect width="640" height="480"/></svg>',
    });

    const serializeToString = vi.fn().mockReturnValue("<svg>test</svg>");
    class XMLSerializerMock {
      serializeToString = serializeToString;
    }
    vi.stubGlobal(
      "XMLSerializer",
      XMLSerializerMock as unknown as typeof XMLSerializer,
    );

    const drawImage = vi.fn();
    const toDataURL = vi.fn().mockReturnValue("data:image/png;base64,test");
    const mockCanvas = {
      width: 0,
      height: 0,
      style: {} as Record<string, string>,
      getContext: vi.fn().mockReturnValue({
        scale: vi.fn(),
        drawImage,
      }),
      toDataURL,
    };

    const imageInstances: Array<{
      src: string;
      onload: ((ev: Event) => any) | null;
    }> = [];
    class ImageMock {
      src = "";
      onload: ((this: HTMLImageElement, ev: Event) => any) | null = null;
      constructor() {
        imageInstances.push(
          this as unknown as {
            src: string;
            onload: ((ev: Event) => any) | null;
          },
        );
      }
    }
    vi.stubGlobal("Image", ImageMock as unknown as typeof Image);

    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation(((tagName: string) => {
        if (tagName === "canvas")
          return mockCanvas as unknown as HTMLCanvasElement;
        if (tagName === "a") {
          return {
            click: vi.fn(),
            download: "",
            href: "",
          } as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      }) as unknown as typeof document.createElement);

    const originalDevicePixelRatio = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 2,
    });

    const wrapper = mount(Mermaid, {
      props: {
        content,
      },
    });

    await flushPromises();

    const svgElement = wrapper.find(".antd-mermaid-graph svg")
      .element as SVGSVGElement;
    svgElement.style.transform = "scale(3) translate(20px, 10px)";
    const getBoundingClientRectSpy = vi
      .spyOn(svgElement, "getBoundingClientRect")
      .mockReturnValue({ width: 1920, height: 1440 } as DOMRect);

    await wrapper.find(".anticon-download").trigger("click");
    await flushPromises();

    expect(serializeToString).toHaveBeenCalled();
    const serializedSvg = serializeToString.mock.calls[0]?.[0] as SVGSVGElement;
    expect(serializedSvg).not.toBe(svgElement);
    expect(serializedSvg.style.transform).toBe("");
    expect(serializedSvg.getAttribute("width")).toBe("640");
    expect(serializedSvg.getAttribute("height")).toBe("480");
    expect(getBoundingClientRectSpy).not.toHaveBeenCalled();
    expect(mockCanvas.width).toBe(1280);
    expect(mockCanvas.height).toBe(960);
    expect(mockCanvas.style.width).toBe("640px");
    expect(mockCanvas.style.height).toBe("480px");

    const imageInstance = imageInstances[0];
    expect(imageInstance?.src).toContain("data:image/svg+xml");
    imageInstance?.onload?.(new Event("load"));
    expect(drawImage).toHaveBeenCalledWith(imageInstance, 0, 0, 640, 480);
    expect(toDataURL).toHaveBeenCalledWith("image/png", 1.0);

    vi.unstubAllGlobals();
    createElementSpy.mockRestore();
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: originalDevicePixelRatio,
    });
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

  describe("Concurrent Render Safety", () => {
    // https://github.com/ant-design/x/pull/2056
    // 渲染结果只在新渲染真正开始后才被取代，而不是内容一变就失效——
    // 否则流式场景下每次渲染耗时都长于 token 间隔，所有结果都会被丢弃，图表一直空白。
    it("should keep applying completed renders while the content keeps changing", async () => {
      let resolveFirst: (value: { svg: string }) => void = () => {};
      mermaidMock.render
        .mockImplementationOnce(
          () =>
            new Promise<{ svg: string }>(resolve => {
              resolveFirst = resolve;
            }),
        )
        .mockImplementation(() =>
          Promise.resolve({ svg: '<svg data-pass="2" />' }),
        );

      const wrapper = mount(Mermaid, {
        props: {
          content,
        },
      });
      await flushPromises();
      expect(mermaidMock.render).toHaveBeenCalledTimes(1);

      // 第一次渲染在途时新内容到达，第二次渲染被节流压住
      await wrapper.setProps({ content: "graph TD; C-->D;" });
      expect(mermaidMock.render).toHaveBeenCalledTimes(1);

      // 第一次渲染先于第二次开始而完成：其结果仍是真实内容，必须照常上屏
      resolveFirst({ svg: '<svg data-pass="1" />' });
      await flushPromises();
      const graph = wrapper.find(".antd-mermaid-graph");
      expect(graph.find("svg").attributes("data-pass")).toBe("1");

      // 节流渲染落地后接管
      await flushPromises(150);
      expect(mermaidMock.render).toHaveBeenCalledTimes(2);
      await flushPromises();
      expect(graph.find("svg").attributes("data-pass")).toBe("2");

      // 每次渲染都使用独立 id
      const ids = mermaidMock.render.mock.calls.map(call => call[0]);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should ignore a stale render result that resolves last", async () => {
      let resolveFirst: (value: { svg: string }) => void = () => {};
      mermaidMock.render
        .mockImplementationOnce(
          () =>
            new Promise<{ svg: string }>(resolve => {
              resolveFirst = resolve;
            }),
        )
        .mockImplementation(() =>
          Promise.resolve({ svg: '<svg data-pass="2" />' }),
        );

      const wrapper = mount(Mermaid, {
        props: {
          content,
        },
      });
      await flushPromises();
      expect(mermaidMock.render).toHaveBeenCalledTimes(1);

      await wrapper.setProps({ content: "graph TD; C-->D;" });
      await flushPromises(150);
      expect(mermaidMock.render).toHaveBeenCalledTimes(2);

      // 最新渲染先完成并写入
      await flushPromises();
      const graph = wrapper.find(".antd-mermaid-graph");
      expect(graph.find("svg").attributes("data-pass")).toBe("2");

      // 被取代的第一次渲染随后才完成，结果必须被丢弃
      resolveFirst({ svg: '<svg data-pass="1" />' });
      await flushPromises();
      expect(graph.find("svg").attributes("data-pass")).toBe("2");
    });

    it("should not write back to the graph when switching to code view mid-render", async () => {
      let resolveFirst: (value: { svg: string }) => void = () => {};
      mermaidMock.render.mockImplementationOnce(
        () =>
          new Promise<{ svg: string }>(resolve => {
            resolveFirst = resolve;
          }),
      );

      const wrapper = mount(Mermaid, {
        props: {
          content,
        },
      });
      await flushPromises();
      expect(mermaidMock.render).toHaveBeenCalledTimes(1);

      wrapper.findComponent({ name: "ASegmented" }).vm.$emit("change", "code");
      await nextTick();
      expect(wrapper.find(".antd-mermaid-code").exists()).toBe(true);

      // 在途渲染完成后不得写回隐藏的 graph 节点
      resolveFirst({ svg: '<svg data-pass="1" />' });
      await flushPromises();
      expect(wrapper.find(".antd-mermaid-graph svg").exists()).toBe(false);
    });
  });
});
