import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, onMounted } from "vue";

import XMarkdown from "../index.vue";

/** A component that snapshots the props it receives and renders a span. */
function createCaptureComponent(captures: Array<Record<string, unknown>>) {
  return defineComponent({
    name: "CaptureWidget",
    setup(_, { attrs, slots }) {
      captures.push({ ...attrs });
      return () => h("span", { class: "captured" }, slots.default?.());
    },
  });
}

describe("XMarkdown componentsProps", () => {
  it("passes extra props to the matching custom component", () => {
    const captures: Array<Record<string, unknown>> = [];
    const Chart = createCaptureComponent(captures);
    const onSelect = () => {};

    const wrapper = mount(XMarkdown, {
      props: {
        content: '<custom-chart data-id="1"></custom-chart>',
        components: { "custom-chart": Chart },
        componentsProps: {
          "custom-chart": { theme: "dark", onSelect },
        },
      },
    });

    const received = captures[0];
    expect(received.theme).toBe("dark");
    expect(received.onSelect).toBe(onSelect);
    expect(received["data-id"]).toBe("1");
    expect(received.streamStatus).toBe("done");
  });

  it("extra props take precedence over parsed HTML attributes", () => {
    const captures: Array<Record<string, unknown>> = [];
    const Widget = createCaptureComponent(captures);

    mount(XMarkdown, {
      props: {
        content: '<my-widget title="from-html"></my-widget>',
        components: { "my-widget": Widget },
        componentsProps: { "my-widget": { title: "from-props" } },
      },
    });

    expect(captures[0].title).toBe("from-props");
  });

  it("does not leak props into other custom components", () => {
    const chartCaptures: Array<Record<string, unknown>> = [];
    const otherCaptures: Array<Record<string, unknown>> = [];
    const Chart = createCaptureComponent(chartCaptures);
    const Other = createCaptureComponent(otherCaptures);

    mount(XMarkdown, {
      props: {
        content: "<custom-chart></custom-chart><custom-other></custom-other>",
        components: { "custom-chart": Chart, "custom-other": Other },
        componentsProps: { "custom-chart": { theme: "dark" } },
      },
    });

    expect(chartCaptures[0].theme).toBe("dark");
    expect(otherCaptures[0].theme).toBeUndefined();
  });

  it("cannot shadow internally computed props", () => {
    const widgetCaptures: Array<Record<string, unknown>> = [];
    const codeCaptures: Array<Record<string, unknown>> = [];
    const Widget = createCaptureComponent(widgetCaptures);
    const Code = createCaptureComponent(codeCaptures);

    mount(XMarkdown, {
      props: {
        content: "<my-widget>text</my-widget>",
        components: { "my-widget": Widget },
        streaming: { hasNextChunk: true },
        componentsProps: {
          "my-widget": {
            streamStatus: "spoofed",
            domNode: "spoofed",
            children: "spoofed",
          },
        },
      },
    });

    expect(widgetCaptures[0].streamStatus).toBe("done");
    expect(widgetCaptures[0].domNode).not.toBe("spoofed");
    expect(widgetCaptures[0].children).toBeUndefined();

    mount(XMarkdown, {
      props: {
        content: "```js\nconst a = 1;\n```",
        components: { code: Code },
        componentsProps: {
          code: { lang: "spoofed", block: "spoofed", streamStatus: "spoofed" },
        },
      },
    });

    expect(codeCaptures[0].lang).toBe("js");
    expect(codeCaptures[0].block).toBe(true);
    expect(codeCaptures[0].streamStatus).toBe("done");
  });

  it("does not inherit lang for code without language metadata", () => {
    const langs: unknown[] = [];
    const Code = defineComponent({
      name: "CaptureCode",
      setup(_, { attrs }) {
        langs.push(attrs.lang);
        return () => h("span", "code");
      },
    });

    mount(XMarkdown, {
      props: {
        content: "`inline`\n\n```\nconst a = 1;\n```",
        components: { code: Code },
        componentsProps: { code: { lang: "spoofed" } },
      },
    });

    expect(langs.length).toBe(2);
    expect(langs.every(lang => lang === undefined)).toBe(true);
  });

  it("merges className from componentsProps with the parsed class attribute", () => {
    const Widget = createCaptureComponent([]);

    const wrapper = mount(XMarkdown, {
      props: {
        content: '<my-widget class="from-html"></my-widget>',
        components: { "my-widget": Widget },
        componentsProps: { "my-widget": { className: "from-props" } },
      },
    });

    const classes = wrapper.find("span.captured").classes();
    expect(classes).toContain("from-props");
    expect(classes).toContain("from-html");
    // componentsProps' class name comes first in the merged value.
    expect(classes.indexOf("from-props")).toBeLessThan(
      classes.indexOf("from-html"),
    );
  });

  it("keeps the custom component mounted when componentsProps changes", async () => {
    let mountCount = 0;
    const Widget = defineComponent({
      name: "StepWidget",
      setup(_, { attrs }) {
        onMounted(() => {
          mountCount += 1;
        });
        return () => h("span", { "data-step": String(attrs.step) }, "widget");
      },
    });

    const wrapper = mount(XMarkdown, {
      props: {
        content: "before <my-widget></my-widget> after",
        components: { "my-widget": Widget },
        componentsProps: { "my-widget": { step: 1 } },
      },
    });

    expect(wrapper.find('[data-step="1"]').exists()).toBe(true);

    await wrapper.setProps({
      componentsProps: { "my-widget": { step: 2 } },
    });

    expect(wrapper.find('[data-step="2"]').exists()).toBe(true);
    expect(mountCount).toBe(1);
  });
});
