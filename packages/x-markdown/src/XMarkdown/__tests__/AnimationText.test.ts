import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";

import AnimationText from "../components/AnimationText.vue";

describe("AnimationText splitBy", () => {
  async function typeOut(
    text: string,
    props: Record<string, unknown> = {},
  ): Promise<string[][]> {
    const wrapper = mount(AnimationText, { props: { text: "", ...props } });
    const spanTexts: string[][] = [];
    for (let i = 1; i <= text.length; i++) {
      await wrapper.setProps({ text: text.slice(0, i) });
      await nextTick();
      spanTexts.push(
        wrapper.findAll("span").map(span => span.element.textContent ?? ""),
      );
    }
    return spanTexts;
  }

  it("creates one fade-in node per arriving chunk by default", async () => {
    const spans = await typeOut("Hi. Yo");
    expect(spans[spans.length - 1]).toEqual(["H", "i", ".", " ", "Y", "o"]);
  });

  it("merges arriving text into the current sentence with splitBy: 'sentence'", async () => {
    const spans = await typeOut("Hi. Yo", { splitBy: "sentence" });
    expect(spans).toEqual([
      ["H"],
      ["Hi"],
      ["Hi."],
      ["Hi.", " "],
      ["Hi.", " Y"],
      ["Hi.", " Yo"],
    ]);
  });

  it("starts a new fade-in unit once a sentence exceeds maxSentenceChars", async () => {
    const spans = await typeOut("abcdefgh.", {
      splitBy: "sentence",
      delimiters: ["."],
      maxSentenceChars: 5,
    });
    expect(spans[spans.length - 1]).toEqual(["abcde", "fgh."]);
  });

  it("splits a multi-sentence chunk without moving text that is already shown", async () => {
    const wrapper = mount(AnimationText, {
      props: { text: "Fir", splitBy: "sentence", delimiters: ["."] },
    });
    await wrapper.setProps({ text: "First. Second. Thi" });
    await nextTick();
    expect(wrapper.findAll("span").map(s => s.element.textContent)).toEqual([
      "First.",
      " Second.",
      " Thi",
    ]);
  });

  it("caps a delimiter-less multi-character delta at maxSentenceChars", async () => {
    // A long delta with no delimiter (a base64 blob, a URL) must not grow one
    // fade-in unit without bound: it merges up to the cap and the overflow
    // becomes cap-sized units of its own.
    const wrapper = mount(AnimationText, {
      props: {
        text: "abc",
        splitBy: "sentence",
        delimiters: ["."],
        maxSentenceChars: 5,
      },
    });
    await wrapper.setProps({ text: "abcdefghijkl" });
    await nextTick();
    expect(wrapper.findAll("span").map(s => s.element.textContent)).toEqual([
      "abcde",
      "fghij",
      "kl",
    ]);
    // The open unit still takes following text up to the cap.
    await wrapper.setProps({ text: "abcdefghijklmno" });
    await nextTick();
    expect(wrapper.findAll("span").map(s => s.element.textContent)).toEqual([
      "abcde",
      "fghij",
      "klmno",
    ]);
  });
});
