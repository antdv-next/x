import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import {
  defineComponent,
  effectScope,
  h,
  nextTick,
  onMounted,
  ref,
  type Component,
  type VNode,
} from "vue";

import type { StreamingOption } from "../interface";

import {
  useStreamingCore,
  type StreamingResult,
} from "../composables/useStreaming";
import XMarkdown from "../index.vue";

/**
 * `streaming.incremental` must never change what ends up on the page: at every
 * point of the stream, rendering the sections must produce exactly the markup
 * that rendering the whole output at once produces. The corpora below are
 * built around the constructs that could break that promise.
 */

const noMin = { minSectionChars: 0 };

/**
 * Attribute order in a live DOM depends on patch history (an attribute added
 * to an existing element serializes last, while a fresh parse emits it in
 * template order). Streaming renders and one-shot renders therefore differ in
 * attribute order without differing in meaning. Normalise by sorting every
 * element's attributes before comparing markup.
 */
function normalizeHTML(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html;
  const walk = (el: Element) => {
    const attrs = Array.from(el.attributes).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    for (const attr of attrs) el.removeAttribute(attr.name);
    for (const attr of attrs) el.setAttribute(attr.name, attr.value);
    for (const child of Array.from(el.children)) walk(child);
  };
  for (const child of Array.from(container.children)) walk(child);
  return container.innerHTML;
}

const corpora: Record<string, string> = {
  headingsAndBlocks: [
    "# Title",
    "",
    "Intro with **bold**, *em*, `code`, [link](https://x.ant.design) and 😀 emoji.",
    "",
    "## Code",
    "",
    "```js",
    "# not a heading inside a fence",
    "const a = 1;",
    "```",
    "",
    "~~~",
    "# not a heading inside a tilde fence",
    "~~~",
    "",
    "## Table",
    "",
    "| a | b |",
    "| - | - |",
    "| 1 | 2 |",
    "",
    "## Lists",
    "",
    "- one",
    "",
    "- two (loose list across a blank line)",
    "",
    "1. first",
    "2. second",
    "",
    "> quote",
    "> # not a heading, it is quoted",
    "",
    "### Trailing",
    "",
    "Last paragraph.",
  ].join("\n"),

  headingWithoutBlankLineBefore: [
    "# A",
    "",
    "para",
    "## B directly after a paragraph",
    "",
    "more",
    "",
    "  ## indented heading (not split on)",
    "",
    "Setext",
    "======",
    "",
    "end",
  ].join("\n"),

  rawBlocks: [
    "# A",
    "",
    "<pre>",
    "",
    "# inside pre",
    "",
    "</pre>",
    "",
    "## B",
    "",
    "<!--",
    "",
    "# inside a comment",
    "",
    "-->",
    "",
    "## C",
    "",
    "$$",
    "",
    "# inside math",
    "",
    "$$",
    "",
    "## D",
    "",
    "<script>",
    "",
    "# inside script",
    "",
    "</script>",
    "",
    "end",
  ].join("\n"),

  referenceDefinitionAfterUse: [
    "# A",
    "",
    "See [the docs][docs] and the footnote[^1].",
    "",
    "## B",
    "",
    "[docs]: https://x.ant.design",
    "",
    "[^1]: footnote text",
    "",
    "## C",
    "",
    "end",
  ].join("\n"),

  crlf: "# A\r\n\r\npara\r\n\r\n## B\r\n\r\n```\r\n# fenced\r\n```\r\n\r\n## C\r\n\r\nend",

  // No blank line between a table (or paragraph) and the next heading: the
  // heading still interrupts the previous block, so it is still a boundary.
  tableThenHeading: Array.from({ length: 4 }, (_, i) =>
    [
      `## 第 ${i} 节`,
      "",
      `第 ${i} 段，含 **加粗**、\`code\` 和[链接](https://x.ant.design)。`,
      "",
      "```ts",
      `const s${i} = ${i}; // # not a heading`,
      "```",
      "",
      "| a | b |",
      "| - | - |",
      `| ${i} | ${i * 2} |`,
      `| ${i + 1} | ${i * 2 + 1} |`,
      // GFM: a line without pipes right after the rows is still a row.
      `row without pipes ${i}`,
      "",
    ].join("\n"),
  ).join(""),

  indentedFences: [
    "# A",
    "",
    " ```",
    "# inside a fence indented by one space",
    " ```",
    "",
    "## B",
    "",
    "   ~~~",
    "",
    "# inside a fence indented by three spaces",
    "",
    "   ~~~",
    "",
    "## C",
    "",
    "end",
  ].join("\n"),

  htmlBlocks: [
    "# A",
    "",
    '<div class="card">',
    "## not a heading, html block text",
    "</div>",
    "",
    "## B",
    "",
    "<my-card>",
    "",
    "## C inside an open custom tag",
    "",
    "</my-card>",
    "",
    "## D",
    "",
    "end",
  ].join("\n"),
};

/** Drive `useStreamingCore` inside an effect scope with controllable refs. */
function createCore(
  streaming: boolean | StreamingOption,
  components?: Record<string, Component>,
) {
  const scope = effectScope();
  const content = ref("");
  const streamingRef = ref<boolean | StreamingOption>(streaming);
  const componentsRef = ref(components);
  let core!: StreamingResult;
  scope.run(() => {
    core = useStreamingCore(content, streamingRef, componentsRef);
  });
  return { scope, content, streamingRef, core };
}

describe("streaming.incremental", () => {
  describe("sections are a lossless partition of the output", () => {
    for (const [name, text] of Object.entries(corpora)) {
      it(`${name}`, async () => {
        const { scope, content, streamingRef, core } = createCore({
          hasNextChunk: true,
          incremental: noMin,
        });
        let sawSections = false;
        for (let i = 1; i <= text.length; i++) {
          content.value = text.slice(0, i);
          await nextTick();
          const { output, sections } = core;
          if (sections.value) {
            sawSections = true;
            expect(sections.value.length).toBeGreaterThan(1);
            expect(sections.value.join("")).toBe(output.value);
            // Every boundary sits right before a column-0 ATX heading.
            for (const section of sections.value.slice(1)) {
              expect(section).toMatch(/^#{1,6}[ \t]/);
            }
          }
        }
        streamingRef.value = { hasNextChunk: false, incremental: noMin };
        await nextTick();
        expect(core.output.value).toBe(text);
        if (core.sections.value) {
          expect(core.sections.value.join("")).toBe(text);
        }
        if (name === "referenceDefinitionAfterUse") {
          // Splits until the definition shows up, then every boundary is dropped.
          expect(sawSections).toBe(true);
          expect(core.sections.value).toBeNull();
        } else {
          expect(sawSections).toBe(true);
        }
        scope.stop();
      }, 30000);
    }
  });

  describe("rendered markup equals the whole-document render at every step", () => {
    // Markup equivalence is checked with animation off (the same condition the
    // upstream React suite uses): AnimationText's span fragmentation depends on
    // patch history, so innerHTML legitimately differs between modes with
    // animation on. The animation-on invariant — identical textContent at
    // every step — is covered separately below.
    const renderBoth = (
      streamingExtra: Partial<StreamingOption> = {},
      components?: Record<string, Component>,
    ) => {
      const withDefaults = { enableAnimation: false, ...streamingExtra };
      const whole = mount(XMarkdown, {
        props: {
          content: "",
          streaming: { hasNextChunk: true, ...withDefaults },
          components,
        },
      });
      const sectioned = mount(XMarkdown, {
        props: {
          content: "",
          streaming: {
            hasNextChunk: true,
            incremental: noMin,
            ...withDefaults,
          },
          components,
        },
      });
      const update = async (content: string, hasNextChunk: boolean) => {
        await whole.setProps({
          content,
          streaming: { hasNextChunk, ...withDefaults },
          components,
        });
        await sectioned.setProps({
          content,
          streaming: { hasNextChunk, incremental: noMin, ...withDefaults },
          components,
        });
        await nextTick();
        return {
          whole: normalizeHTML((whole.element as HTMLElement).innerHTML),
          sectioned: normalizeHTML(
            (sectioned.element as HTMLElement).innerHTML,
          ),
        };
      };
      return { update, whole, sectioned };
    };

    for (const [name, text] of Object.entries(corpora)) {
      it(`${name}`, async () => {
        const { update } = renderBoth();
        for (let i = 1; i <= text.length; i++) {
          const { whole, sectioned } = await update(text.slice(0, i), true);
          expect(sectioned).toBe(whole);
        }
        const done = await update(text, false);
        expect(done.sectioned).toBe(done.whole);
        // …and both equal a plain non-streaming render of the final text
        // (hasNextChunk falsy → the non-streaming path; animation off to
        // match the condition the two streaming renders were driven with).
        const plain = mount(XMarkdown, {
          props: { content: text, streaming: { enableAnimation: false } },
        });
        await nextTick();
        expect(done.sectioned).toBe(
          normalizeHTML((plain.element as HTMLElement).innerHTML),
        );
      }, 60000);
    }

    it("with custom components, a tail and a code component", async () => {
      const text = corpora.headingsAndBlocks;
      const components = {
        code: defineComponent({
          name: "CodeProbe",
          inheritAttrs: false,
          setup(_, { attrs, slots }) {
            return () =>
              h(
                "code",
                {
                  "data-test-lang": attrs.lang,
                  "data-test-block": String(attrs.block),
                },
                slots.default?.(),
              );
          },
        }),
        h2: defineComponent({
          name: "H2Probe",
          inheritAttrs: false,
          setup(_, { slots }) {
            return () => h("h2", { "data-custom": "1" }, slots.default?.());
          },
        }),
      };
      const { update } = renderBoth({ tail: true }, components);
      for (let i = 1; i <= text.length; i += 3) {
        const { whole, sectioned } = await update(text.slice(0, i), true);
        expect(sectioned).toBe(whole);
      }
      const done = await update(text, false);
      expect(done.sectioned).toBe(done.whole);
    }, 60000);

    it("with animation on, textContent still matches the whole-document render at every step", async () => {
      const text = corpora.headingsAndBlocks;
      const whole = mount(XMarkdown, {
        props: { content: "", streaming: { hasNextChunk: true } },
      });
      const sectioned = mount(XMarkdown, {
        props: {
          content: "",
          streaming: { hasNextChunk: true, incremental: noMin },
        },
      });
      for (let i = 1; i <= text.length; i += 3) {
        await whole.setProps({
          content: text.slice(0, i),
          streaming: { hasNextChunk: true },
        });
        await sectioned.setProps({
          content: text.slice(0, i),
          streaming: { hasNextChunk: true, incremental: noMin },
        });
        await nextTick();
        expect((sectioned.element as HTMLElement).textContent).toBe(
          (whole.element as HTMLElement).textContent,
        );
      }
      await whole.setProps({
        content: text,
        streaming: { hasNextChunk: false },
      });
      await sectioned.setProps({
        content: text,
        streaming: { hasNextChunk: false, incremental: noMin },
      });
      await nextTick();
      const plain = mount(XMarkdown, { props: { content: text } });
      await nextTick();
      expect((sectioned.element as HTMLElement).textContent).toBe(
        (plain.element as HTMLElement).textContent,
      );
    }, 60000);
  });

  describe("boundary guards", () => {
    const sectionsFor = async (
      text: string,
      streaming: StreamingOption = {},
      components?: Record<string, Component>,
    ) => {
      const { scope, content, core } = createCore(
        { hasNextChunk: true, incremental: noMin, ...streaming },
        components,
      );
      content.value = text;
      await nextTick();
      const sections = core.sections.value;
      scope.stop();
      return sections;
    };

    it("splits before a top-level heading that follows a blank line", async () => {
      expect(await sectionsFor("# A\n\npara\n\n## B\n\nmore\n\n")).toEqual([
        "# A\n\npara\n\n",
        "## B\n\nmore\n\n",
      ]);
    });

    it("splits on a heading directly after a paragraph line (a heading interrupts a paragraph)", async () => {
      expect(await sectionsFor("# A\n\npara\n## B\n\nmore\n\n")).toEqual([
        "# A\n\npara\n",
        "## B\n\nmore\n\n",
      ]);
    });

    it("does not split on an indented heading or a setext heading", async () => {
      expect(
        await sectionsFor("# A\n\npara\n\n   ## B\n\nmore\n\n"),
      ).toBeNull();
      expect(await sectionsFor("# A\n\npara\n\nB\n---\n\nmore\n\n")).toBeNull();
    });

    it("does not split inside an HTML block until its blank line", async () => {
      expect(
        await sectionsFor("# A\n\n<div>\n## B\n</div>\n\n## C\n\n"),
      ).toEqual(["# A\n\n<div>\n## B\n</div>\n\n", "## C\n\n"]);
      expect(
        await sectionsFor("# A\n\n<div>\n\n## B\n\n</div>\n\n"),
      ).toHaveLength(2);
    });

    it("does not split on # lines inside fenced code, indented fences included", async () => {
      expect(await sectionsFor("# A\n\n```\n\n# fenced\n\n```\n\n")).toBeNull();
      expect(await sectionsFor("# A\n\n~~~\n\n# fenced\n\n~~~\n\n")).toBeNull();
      expect(await sectionsFor("# A\n\n ```\n# fenced\n ```\n\n")).toBeNull();
      expect(
        await sectionsFor("# A\n\n   ```\n\n# fenced\n\n   ```\n\n"),
      ).toBeNull();
      // Four spaces is indented code, not a fence: the `#` line after it is a heading.
      expect(await sectionsFor("# A\n\n    ```\n\n# heading\n\n")).toHaveLength(
        2,
      );
    });

    it("does not split on # lines inside <pre>, <script>, comments and $$ math", async () => {
      expect(await sectionsFor("# A\n\n<pre>\n\n# x\n\n</pre>\n\n")).toBeNull();
      expect(
        await sectionsFor("# A\n\n<SCRIPT>\n\n# x\n\n</SCRIPT>\n\n"),
      ).toBeNull();
      expect(await sectionsFor("# A\n\n<!--\n\n# x\n\n-->\n\n")).toBeNull();
      expect(await sectionsFor("# A\n\n$$\n\n# x\n\n$$\n\n")).toBeNull();
      expect(await sectionsFor("# A\n\n\\[\n\n# x\n\n\\]\n\n")).toBeNull();
      // …but splits again once the raw block has closed.
      expect(
        await sectionsFor("# A\n\n<pre>\n\n# x\n\n</pre>\n\n## B\n\n"),
      ).toEqual(["# A\n\n<pre>\n\n# x\n\n</pre>\n\n", "## B\n\n"]);
    });

    it("drops all boundaries once a reference or footnote definition appears", async () => {
      const { scope, content, core } = createCore({
        hasNextChunk: true,
        incremental: noMin,
      });
      content.value = "# A\n\n[docs]\n\n## B\n\n";
      await nextTick();
      expect(core.sections.value).toHaveLength(2);
      content.value = "# A\n\n[docs]\n\n## B\n\n[docs]: https://x\n\n## C\n\n";
      await nextTick();
      expect(core.sections.value).toBeNull();
      scope.stop();
    });

    it("does not split while a custom component tag is still open", async () => {
      const components = { "my-card": defineComponent(() => () => null) };
      expect(
        await sectionsFor(
          "# A\n\n<my-card>\n\n## B\n\n</my-card>\n\n",
          {},
          components,
        ),
      ).toBeNull();
      expect(
        await sectionsFor(
          "# A\n\n<my-card>\n\n## B\n\n</my-card>\n\n## C\n\n",
          {},
          components,
        ),
      ).toEqual(["# A\n\n<my-card>\n\n## B\n\n</my-card>\n\n", "## C\n\n"]);
      // The same text without the component registered is plain HTML and splits.
      expect(
        await sectionsFor("# A\n\n<my-card>\n\n## B\n\n</my-card>\n\n"),
      ).toHaveLength(2);
    });

    it("merges sections shorter than minSectionChars into the next one", async () => {
      const text = "# A\n\npara\n\n## B\n\nmore\n\n## C\n\nend\n\n";
      expect(await sectionsFor(text, { incremental: true })).toBeNull();
      expect(
        await sectionsFor(text, { incremental: { minSectionChars: 12 } }),
      ).toEqual(["# A\n\npara\n\n## B\n\nmore\n\n", "## C\n\nend\n\n"]);
    });

    it("exposes a boundary held inside the pending table once the table commits", async () => {
      // The table token stays pending until its blank line (unchanged
      // behaviour), and a heading right after the last row is part of that
      // pending text. The boundary is recorded immediately but only used once
      // the table has committed.
      const { scope, content, core } = createCore({
        hasNextChunk: true,
        incremental: noMin,
      });
      content.value = "# A\n\n| a |\n| - |\n| 1 |\n## B\n";
      await nextTick();
      expect(core.sections.value).toBeNull();
      content.value = "# A\n\n| a |\n| - |\n| 1 |\n## B\n\npara\n\n";
      await nextTick();
      expect(core.sections.value).toEqual([
        "# A\n\n| a |\n| - |\n| 1 |\n",
        "## B\n\npara\n\n",
      ]);
      scope.stop();
    });

    it("is off unless incremental is set, and off for a non-streaming render", async () => {
      const text = "# A\n\npara\n\n## B\n\nmore\n\n";
      expect(await sectionsFor(text, { incremental: undefined })).toBeNull();
      const { scope, core } = createCore({
        hasNextChunk: false,
        incremental: noMin,
      });
      await nextTick();
      expect(core.output.value).toBe("");
      expect(core.sections.value).toBeNull();
      scope.stop();
    });
  });

  describe("work skipped for finished sections", () => {
    const doc = Array.from({ length: 6 }, (_, i) =>
      [
        `## Section ${i}`,
        "",
        `Paragraph ${i}.`,
        "",
        "```js",
        `const s${i} = ${i};`,
        "```",
        "",
      ].join("\n"),
    ).join("\n");

    function extractText(nodes: VNode[]): string {
      return nodes
        .map(node => {
          const children = node.children;
          if (typeof children === "string") return children;
          if (Array.isArray(children)) return extractText(children as VNode[]);
          return "";
        })
        .join("");
    }

    const streamIn = async (
      incremental: boolean,
      onRender: (children: string) => void,
    ) => {
      const code = defineComponent({
        name: "CodeCounter",
        inheritAttrs: false,
        setup(_, { slots }) {
          return () => {
            const text = extractText(slots.default?.() ?? []);
            onRender(text);
            return h("code", {}, text);
          };
        },
      });
      // Like every memo in XMarkdown, sections rely on `components` (and
      // `config`, `streaming`, …) keeping the same identity across renders.
      const components = { code };
      const streaming = incremental
        ? { hasNextChunk: true, incremental: noMin }
        : { hasNextChunk: true };
      const wrapper = mount(XMarkdown, {
        props: { content: "", streaming, components },
      });
      for (let i = 10; i < doc.length; i += 10) {
        await wrapper.setProps({ content: doc.slice(0, i) });
        await nextTick();
      }
      await wrapper.setProps({ content: doc });
      await nextTick();
      return wrapper;
    };

    it("does not re-render custom components in earlier sections", async () => {
      const count = async (incremental: boolean) => {
        const renders: Record<string, number> = {};
        await streamIn(incremental, children => {
          renders[children] = (renders[children] ?? 0) + 1;
        });
        return renders;
      };
      const whole = await count(false);
      const sectioned = await count(true);
      // The first block's final text (downstream trims the trailing newline
      // that upstream's React renderer keeps). Every render at this value
      // happened after the block finished streaming, i.e. was pure re-render
      // work caused by later chunks.
      const finalText = "const s0 = 0;";
      // Without sections the first code block re-renders on every chunk of the
      // whole document; with sections it stops once its section has closed.
      expect(whole[finalText]).toBeGreaterThan(20);
      expect(sectioned[finalText]).toBeLessThan(9);
      const total = (r: Record<string, number>) =>
        Object.values(r).reduce((a, b) => a + b, 0);
      expect(total(sectioned) * 3).toBeLessThan(total(whole));
    }, 30000);

    it("re-renders the whole document at the end with keepSectionsOnEnd: false", async () => {
      const streaming = {
        hasNextChunk: true,
        incremental: { ...noMin, keepSectionsOnEnd: false },
      };
      const scope = effectScope();
      const content = ref(doc);
      const streamingRef = ref<StreamingOption>(streaming);
      let core!: StreamingResult;
      scope.run(() => {
        core = useStreamingCore(content, streamingRef);
      });
      await nextTick();
      expect(core.sections.value).toHaveLength(6);
      streamingRef.value = { ...streaming, hasNextChunk: false };
      await nextTick();
      expect(core.output.value).toBe(doc);
      expect(core.sections.value).toBeNull();
      scope.stop();

      const wrapper = mount(XMarkdown, {
        props: { content: doc, streaming },
      });
      await nextTick();
      await wrapper.setProps({
        streaming: { ...streaming, hasNextChunk: false },
      });
      await nextTick();
      const plain = mount(XMarkdown, { props: { content: doc } });
      await nextTick();
      expect((wrapper.element as HTMLElement).innerHTML).toBe(
        (plain.element as HTMLElement).innerHTML,
      );
    });

    it("keeps sections after the stream ends so custom components are not remounted", async () => {
      let mounts = 0;
      const code = defineComponent({
        name: "CodeMountCounter",
        inheritAttrs: false,
        setup(_, { slots }) {
          onMounted(() => {
            mounts += 1;
          });
          return () => h("code", {}, slots.default?.());
        },
      });
      const streaming = { hasNextChunk: true, incremental: noMin };
      const wrapper = mount(XMarkdown, {
        props: { content: doc, streaming, components: { code } },
      });
      await nextTick();
      expect(mounts).toBe(6);
      await wrapper.setProps({
        streaming: { hasNextChunk: false, incremental: noMin },
      });
      await nextTick();
      expect(mounts).toBe(6);
      const plain = mount(XMarkdown, {
        props: { content: doc, components: { code } },
      });
      await nextTick();
      expect((wrapper.element as HTMLElement).innerHTML).toBe(
        (plain.element as HTMLElement).innerHTML,
      );
    });
  });
});
