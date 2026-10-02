import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, effectScope, h, nextTick, onMounted, ref } from "vue";

import { useStreaming } from "../composables/useStreaming";
import { VueRenderer } from "../core/VueRenderer";
import XMarkdown from "../index.vue";
import { resolveStreaming } from "../utils/streaming";

describe("streaming boolean preset", () => {
  it("streaming={true} streams with completion and sections, without a tail cursor", async () => {
    const wrapper = mount(XMarkdown, {
      props: { content: "a **b", streaming: true },
    });
    await nextTick();
    // incompleteMarkdown: 'complete' → the open emphasis renders as bold…
    expect(wrapper.find("strong")?.text()).toContain("b");
    // …and the tail cursor stays a per-app choice (object form, `tail: true`).
    expect(wrapper.find(".xmd-tail").exists()).toBe(false);
    const withTail = mount(XMarkdown, {
      props: {
        content: "a **b",
        streaming: { hasNextChunk: true, tail: true },
      },
    });
    await nextTick();
    expect(withTail.find(".xmd-tail")?.text()).toBe("▋");
  });

  it("streaming={false} renders the final content at once, like no streaming at all", async () => {
    const wrapper = mount(XMarkdown, {
      props: { content: "a **b", streaming: false },
    });
    const plain = mount(XMarkdown, { props: { content: "a **b" } });
    await nextTick();
    expect((wrapper.element as HTMLElement).innerHTML).toBe(
      (plain.element as HTMLElement).innerHTML,
    );
    expect((wrapper.element as HTMLElement).innerHTML).toContain("a **b");
    expect(wrapper.find(".xmd-tail").exists()).toBe(false);
  });

  it("keeps mounted custom components across the true → false transition", async () => {
    const section = (i: number) =>
      `## Section ${i}\n\n${"Lorem ipsum dolor sit amet. ".repeat(8)}\n\n\`\`\`js\nconst s${i} = ${i};\n\`\`\`\n\n`;
    const doc = section(0) + section(1) + section(2);
    let mounts = 0;
    const code = defineComponent({
      name: "CodeMountProbe",
      inheritAttrs: false,
      setup(_, { slots }) {
        onMounted(() => {
          mounts += 1;
        });
        return () => h("code", {}, slots.default?.());
      },
    });
    const components = { code };
    const wrapper = mount(XMarkdown, {
      props: { content: doc, streaming: true, components },
    });
    await nextTick();
    expect(mounts).toBe(3);
    await wrapper.setProps({ streaming: false });
    await nextTick();
    expect(mounts).toBe(3);
    const plain = mount(XMarkdown, {
      props: { content: doc, components },
    });
    await nextTick();
    expect((wrapper.element as HTMLElement).textContent).toBe(
      (plain.element as HTMLElement).textContent,
    );
  });

  it("is accepted by the public useStreaming composable as well", async () => {
    const scope = effectScope();
    await scope.run(async () => {
      const on = useStreaming(ref("see **bold"), ref<boolean>(true));
      await nextTick();
      expect(on.processedContent.value).toBe("see **bold**");

      const off = useStreaming(ref("see **bold"), ref<boolean>(false));
      await nextTick();
      expect(off.processedContent.value).toBe("see **bold");
    });
    scope.stop();
  });

  it("leaves the object form untouched", async () => {
    const wrapper = mount(XMarkdown, {
      props: { content: "a **b", streaming: { hasNextChunk: true } },
    });
    await nextTick();
    // Placeholder mode by default: the open emphasis is held back.
    expect((wrapper.element as HTMLElement).innerHTML).not.toContain(
      "<strong>",
    );
    expect(wrapper.find(".xmd-tail").exists()).toBe(false);
  });
});

describe("resolveStreaming", () => {
  it("expands booleans to the frozen preset with a stable identity", () => {
    const on1 = resolveStreaming(true);
    const on2 = resolveStreaming(true);
    expect(on1).toBe(on2);
    expect(on1).toEqual({
      hasNextChunk: true,
      incremental: true,
      incompleteMarkdown: "complete",
      typewriter: true,
      // Sentence fade-in units, so the per-frame typewriter reveal does not
      // accumulate one fade-in node per frame.
      animationConfig: { splitBy: "sentence" },
    });
    expect(Object.isFrozen(on1)).toBe(true);
    expect(Object.isFrozen(on1?.animationConfig)).toBe(true);

    const off1 = resolveStreaming(false);
    const off2 = resolveStreaming(false);
    expect(off1).toBe(off2);
    expect(off1).toEqual({
      hasNextChunk: false,
      incremental: true,
      incompleteMarkdown: "complete",
      typewriter: true,
      animationConfig: { splitBy: "sentence" },
    });
    expect(Object.isFrozen(off1)).toBe(true);
    // The preset deliberately has no tail cursor.
    expect(on1).not.toHaveProperty("tail");
    expect(off1).not.toHaveProperty("tail");
  });

  it("passes objects and undefined through untouched", () => {
    const opts = { hasNextChunk: true, tail: true };
    expect(resolveStreaming(opts)).toBe(opts);
    expect(resolveStreaming({ hasNextChunk: true })).toEqual({
      hasNextChunk: true,
    });
    expect(resolveStreaming(undefined)).toBeUndefined();
  });
});

describe("VueRenderer.setOptions", () => {
  it("replaces animationConfig instead of merging, so a dropped config resets to defaults", () => {
    interface RendererInternals {
      options: { animationConfig: Record<string, unknown> };
    }
    const internals = (r: VueRenderer) => r as unknown as RendererInternals;
    const renderer = new VueRenderer({
      animationConfig: { splitBy: "sentence", delimiters: ["。"] },
    });
    // A later options bag without those fields must not inherit them…
    renderer.setOptions({ animationConfig: { fadeDuration: 500 } });
    expect(internals(renderer).options.animationConfig.splitBy).toBeUndefined();
    expect(internals(renderer).options.animationConfig.fadeDuration).toBe(500);
    // …and a bag that drops the config entirely (the streaming preset being
    // switched off) resets it, instead of leaking splitBy: 'sentence' into
    // every later render.
    renderer.setOptions({ animationConfig: undefined });
    expect(internals(renderer).options.animationConfig.splitBy).toBeUndefined();
    expect(internals(renderer).options.animationConfig.easing).toBe(
      "ease-in-out",
    );
    // Callers that never mention the key keep the current config.
    renderer.setOptions({ enableAnimation: false });
    expect(internals(renderer).options.animationConfig.easing).toBe(
      "ease-in-out",
    );
  });
});
