import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import XMarkdown from "../../../XMarkdown/index.vue";
import latexPlugin from "../index";

function renderHtml(content: string) {
  return mount(XMarkdown, {
    props: {
      content,
      config: { extensions: latexPlugin() },
    },
  });
}

describe("LaTeX Plugin", () => {
  it("should render inline LaTeX with $..$ syntax", () => {
    const wrapper = renderHtml("$E=mc^2$");
    expect(wrapper.find(".katex").exists()).toBe(true);
  });

  it.each([
    "Downgrade Max ($100) to Pro ($20)",
    "把 Max 5x（$100）降级到 Pro（$20）",
    "The items cost $10, $20, and $30, respectively.",
  ])("should not interpret currency amounts as LaTeX: %s", content => {
    const wrapper = renderHtml(`**${content}**`);
    expect(wrapper.find(".katex").exists()).toBe(false);
    expect(wrapper.find("strong").text()).toBe(content);
  });

  // An escaped \$ inside a formula must not be treated as the closing delimiter.
  it.each(["$\\text{\\$100}$", "$\\text{\\$x}$"])(
    "should support escaped dollar signs inside formulas: %s",
    content => {
      const wrapper = renderHtml(content);
      expect(wrapper.find(".katex").exists()).toBe(true);
      expect(wrapper.find(".katex-error").exists()).toBe(false);
    },
  );

  it("should still render formulas that start with a number", () => {
    const wrapper = renderHtml("$2x + 1$");
    expect(wrapper.find(".katex").exists()).toBe(true);
  });

  // Behavior change: `$ x $` used to render as math and no longer does. This is
  // the Pandoc rule that makes currency detection possible at all.
  it.each(["$ x$", "$x $", "$ x $", "$x$2"])(
    "should follow single-dollar delimiter rules: %s",
    content => {
      const wrapper = renderHtml(content);
      expect(wrapper.find(".katex").exists()).toBe(false);
      expect(wrapper.text()).toContain(content);
    },
  );

  // The spacing rules apply to `$...$` only; `$$...$$` is unambiguous and keeps
  // rendering padded content exactly as before.
  it.each(["$$ x $$", "$$ \\frac{a}{b} $$"])(
    "should exempt $$ from the single-dollar spacing rules: %s",
    content => {
      const wrapper = renderHtml(content);
      expect(wrapper.find(".katex").exists()).toBe(true);
    },
  );

  // Known limitation: the Pandoc rules are positional, not semantic. Prose that
  // happens to satisfy them is still parsed as math.
  it("does not catch currency that satisfies the Pandoc rules", () => {
    const wrapper = renderHtml("价格 $5和$X 的对比");
    expect(wrapper.find(".katex").exists()).toBe(true);
  });

  it("should render block LaTeX with $$\n..\n$$ syntax", () => {
    const wrapper = renderHtml("$$\nE=mc^2\n$$");
    expect(wrapper.find(".katex").exists()).toBe(true);
  });
});
