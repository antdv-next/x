import { describe, expect, it } from "vitest";

import { Parser } from "../core/Parser";

describe("XMarkdown Parser (marked v16)", () => {
  it("renders paragraph with inline formatting and link attributes", () => {
    const parser = new Parser();
    const html = parser.parse('Hello *world* [link](https://x.com "T") end');

    expect(html).toBe(
      '<p>Hello <em>world</em> <a href="https://x.com" title="T" target="_blank" rel="noopener noreferrer">link</a> end</p>',
    );
  });

  it("link respects openLinksInNewTab option", () => {
    const parser = new Parser({ openLinksInNewTab: false });
    const html = parser.parse("[a](https://a.com)");

    expect(html).toBe('<p><a href="https://a.com">a</a></p>');
  });

  // 与上游 Parser.test.ts 的 CJK autolink 用例等价。两处预期差异均为下游既有行为，
  // 不是本次移植引入：段落渲染器不加结尾换行；link 渲染器直接用 token.href，
  // 不像默认渲染器那样经过 marked 的 cleanUrl 做百分号编码。
  describe("CJK autolinks", () => {
    it("stops a bare URL at CJK punctuation", () => {
      const parser = new Parser();
      const result = parser.parse(
        "**百度**（http://www.baidu.c），接着后面的内容",
      );

      expect(result).toBe(
        '<p><strong>百度</strong>（<a href="http://www.baidu.c" target="_blank" rel="noopener noreferrer">http://www.baidu.c</a>），接着后面的内容</p>',
      );
    });

    it("preserves balanced CJK parentheses inside a bare URL", () => {
      const parser = new Parser();
      const result = parser.parse("https://example.com/路径（详情），继续");

      expect(result).toBe(
        '<p><a href="https://example.com/路径（详情）" target="_blank" rel="noopener noreferrer">https://example.com/路径（详情）</a>，继续</p>',
      );
    });

    it.each([
      "https://example.com/路径（详情，更多）",
      "https://example.com/路径（详情（第一，第二）；更多）",
      "https://example.com/路径（详情",
      "https://example.com/路径（详情（第一，第二）",
    ])("keeps punctuation only within balanced CJK parentheses: %s", url => {
      const parser = new Parser();
      const result = parser.parse(`${url}，继续`);

      expect(result).toBe(
        `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>，继续</p>`,
      );
    });

    it("does not change explicit markdown links with CJK punctuation in the destination", () => {
      const parser = new Parser();
      const result = parser.parse("[示例](https://example.com/路径，详情)");

      expect(result).toBe(
        '<p><a href="https://example.com/路径，详情" target="_blank" rel="noopener noreferrer">示例</a></p>',
      );
    });

    // 下游特有：`setOptions({ config })` 会重建 marked 实例，CJK 覆写必须重新挂载，
    // 否则一次 config 更新就会静默退回吞标点的旧行为。
    it("survives a marked config update", () => {
      const parser = new Parser();
      parser.setOptions({ config: { breaks: true } });

      expect(
        parser.parse("**百度**（http://www.baidu.c），接着后面的内容"),
      ).toBe(
        '<p><strong>百度</strong>（<a href="http://www.baidu.c" target="_blank" rel="noopener noreferrer">http://www.baidu.c</a>），接着后面的内容</p>',
      );
    });
  });

  it("paragraph respects paragraphTag option", () => {
    const parser = new Parser({ paragraphTag: "div" });
    const html = parser.parse("text");

    expect(html).toBe("<div>text</div>");
  });

  it("html renderer passes raw html through by default and escapes when escapeRawHtml is on", () => {
    const raw = '<div class="x">hi</div>';
    expect(new Parser().parse(raw)).toContain('<div class="x">hi</div>');
    expect(new Parser({ escapeRawHtml: true }).parse(raw)).toContain(
      "&lt;div class=&quot;x&quot;&gt;",
    );
  });

  it("code renderer escapes content and records lang", () => {
    const parser = new Parser({ streamStatus: "done" });
    const html = parser.parse("```js\nconst a=1<b;\n```");

    expect(html).toContain('class="language-js"');
    expect(html).toContain('data-lang="js"');
    expect(html).toContain('data-state="done"');
    expect(html).toContain("const a=1&lt;b;");
  });

  it("marks a complete fenced code block as done", () => {
    const parser = new Parser({ streamStatus: "loading" });
    const html = parser.parse("```js\nconst a = 1;\n```");

    expect(html).toContain('data-state="done"');
  });

  it("marks an unclosed fenced code block as loading while streaming", () => {
    const parser = new Parser({ streamStatus: "loading" });
    const html = parser.parse("```js\nconst a = 1;");

    expect(html).toContain('data-state="loading"');
  });

  it("codeBlockStatus option overrides inferred state", () => {
    const parser = new Parser({
      streamStatus: "loading",
      codeBlockStatus: { js: "done" },
    });
    const html = parser.parse("```js\nconst a = 1;");

    expect(html).toContain('data-state="done"');
  });

  // marked v16.2.0+ emits a standalone `def` token for reference definitions
  // (e.g. `[foo]: https://x.com`). The tail must stay attached to the previous
  // visible text token instead of being swallowed by the trailing `def`.
  it("renders tail on the last visible text when content ends with reference definition", () => {
    const container = document.createElement("div");
    container.innerHTML = new Parser().parse(
      'Visible paragraph.\n\n[foo]: https://x.com "foo"',
      { injectTail: true },
    );

    const paragraphs = container.querySelectorAll("p");
    const lastParagraph = paragraphs[paragraphs.length - 1];
    expect(lastParagraph.textContent).toContain("Visible paragraph.");
    expect(lastParagraph.querySelector("xmd-tail")).not.toBeNull();
  });
});
