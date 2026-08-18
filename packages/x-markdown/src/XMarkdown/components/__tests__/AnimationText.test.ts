import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import AnimationText from "../AnimationText.vue";

describe("AnimationText", () => {
  it("renders the initial text as a single animated chunk", () => {
    const wrapper = mount(AnimationText, { props: { text: "Hello" } });
    expect(wrapper.findAll("span").map(s => s.element.textContent)).toEqual([
      "Hello",
    ]);
  });

  it("appends streaming deltas as separate chunks", async () => {
    const wrapper = mount(AnimationText, { props: { text: "Hello" } });
    await wrapper.setProps({ text: "Hello world" });
    expect(wrapper.findAll("span").map(s => s.element.textContent)).toEqual([
      "Hello",
      " world",
    ]);
  });

  it("supports continuous streaming appends", async () => {
    const wrapper = mount(AnimationText, { props: { text: "Hello" } });
    await wrapper.setProps({ text: "Hello world" });
    await wrapper.setProps({ text: "Hello world foo" });
    expect(wrapper.findAll("span").map(s => s.element.textContent)).toEqual([
      "Hello",
      " world",
      " foo",
    ]);
  });

  it("replaces all chunks when the new text is not an append", async () => {
    const wrapper = mount(AnimationText, { props: { text: "Hello" } });
    await wrapper.setProps({ text: "World" });
    expect(wrapper.findAll("span").map(s => s.element.textContent)).toEqual([
      "World",
    ]);
  });

  it("keeps the previous chunks when the text does not change", async () => {
    const wrapper = mount(AnimationText, { props: { text: "Hello" } });
    await wrapper.setProps({ text: "Hello" });
    expect(wrapper.findAll("span").map(s => s.element.textContent)).toEqual([
      "Hello",
    ]);
  });

  it("keeps animation keys stable across appends (no remount)", async () => {
    const wrapper = mount(AnimationText, { props: { text: "Hello" } });
    const firstSpan = wrapper.find("span").element;
    await wrapper.setProps({ text: "Hello world" });
    expect(wrapper.findAll("span").map(s => s.element.textContent)).toEqual([
      "Hello",
      " world",
    ]);
    // The first chunk keeps the same DOM node, so its v-for key stayed stable
    // and no chunk was re-created during the append.
    expect(wrapper.find("span").element).toBe(firstSpan);
  });
});
