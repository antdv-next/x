import { Marked } from "marked";
import { describe, expect, it } from "vitest";

import { Parser } from "../core/Parser";

function parseDocument(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

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

  describe("CJK autolinks", () => {
    it("stops at the closing wrapper when punctuation follows", () => {
      const parser = new Parser();
      const result = parser.parse(
        "**百度**（http://www.baidu.c），接着后面的内容",
      );

      expect(result).toBe(
        '<p><strong>百度</strong>（<a href="http://www.baidu.c" target="_blank" rel="noopener noreferrer">http://www.baidu.c</a>），接着后面的内容</p>',
      );
    });

    it("stops before the prose after a URL wrapped in full-width parentheses", () => {
      const parser = new Parser();
      const result = parser.parse(
        "**看这个链接地址**（https://x.antdv-next.cn），随后返回的数据内容............",
      );

      expect(result).toBe(
        '<p><strong>看这个链接地址</strong>（<a href="https://x.antdv-next.cn" target="_blank" rel="noopener noreferrer">https://x.antdv-next.cn</a>），随后返回的数据内容............</p>',
      );
    });

    it.each([
      "https://docs【测试】.example.com/路径",
      "https://example.com/路径（详情，更多）",
      "https://example.com/路径（详情（第一，第二）；更多）",
      "https://example.com/search?q=版本)",
      "https://example.com/?tag=A&label;",
      "https://example.com/?tag=A&copy;",
    ])("keeps the exact destination inside the wrapper: %s", url => {
      const parser = new Parser();
      const anchor = parseDocument(
        parser.parse(`前文（${url}），继续`),
      ).querySelector("a")!;

      expect(anchor.getAttribute("href")).toBe(url);
      expect(anchor.textContent).toBe(url);
      expect(anchor.previousSibling?.textContent).toBe("前文（");
      expect(anchor.nextSibling?.textContent).toBe("），继续");
    });

    it.each([
      "https://www.例子.中国 了解",
      "https://docs【测试】.example.com/path，继续",
      "https://example.com/路径，详情",
      "https://example.com/路径（详情），继续",
      "https://example.com/路径》」』】〕〉”’…后面",
      "https://example.com（文档站）。",
      "https://example.com:详情",
      "https://example.com/docs/v1.中文版",
      "https://example.com/search?关键词",
      "https://example.com/search?q=版本)中文，继续",
      "https://example.com/?tag=A&label;，继续",
      "（https://example.com/路径）详情",
      "（https://example.com/路径）",
      "（https://example.com/路径（详情），继续",
      "（https://example.com/路径） ，继续",
      "（ https://example.com/路径），继续",
      "（https://example.com/路径 说明），继续",
      "（https://），继续",
      "（https://example.com:无效端口），继续",
      "（www.例子.中国），继续",
      "`（https://example.com/路径），继续`",
      "[（https://example.com/路径），继续](/docs)",
      '<a href="/docs">（https://example.com/路径），继续</a>',
    ])(
      "keeps marked's link boundaries outside the wrapper syntax: %s",
      input => {
        const marked = new Marked();
        const actual = parseDocument(new Parser().parse(input));
        const baseline = parseDocument(marked.parse(input, { async: false }));
        const links = (doc: Document) =>
          Array.from(doc.querySelectorAll("a"), anchor => [
            decodeURI(anchor.getAttribute("href")!),
            anchor.textContent,
          ]);

        expect(links(actual)).toEqual(links(baseline));
        expect(actual.querySelector("p")?.textContent).toBe(
          baseline.querySelector("p")?.textContent,
        );
      },
    );

    it("keeps marked's www prefix and honors the GFM option", () => {
      const input = "（www.example.com/路径），继续";
      const doc = parseDocument(new Parser().parse(input));

      expect(doc.querySelector("a")?.getAttribute("href")).toBe(
        "http://www.example.com/路径",
      );
      expect(doc.querySelector("a")?.textContent).toBe("www.example.com/路径");
      expect(new Parser({ config: { gfm: false } }).parse(input)).toBe(
        `<p>${input}</p>`,
      );
    });

    it("runs a user url tokenizer first and falls back to ours on false", () => {
      const calls: string[] = [];
      const parser = new Parser({
        config: {
          tokenizer: {
            url(src) {
              calls.push(src);
              return false;
            },
          },
        },
      });

      expect(parser.parse("看（https://a.com/路径），继续")).toBe(
        '<p>看（<a href="https://a.com/路径" target="_blank" rel="noopener noreferrer">https://a.com/路径</a>），继续</p>',
      );
      expect(calls).toContain("https://a.com/路径），继续");
    });

    it("leaves the user url tokenizer's token intact inside the wrapper", () => {
      const parser = new Parser({
        config: {
          tokenizer: {
            url(src) {
              const raw = "https://example.com/路径），继续";
              if (!src.startsWith(raw)) return false;
              return {
                type: "link",
                raw,
                href: "/custom",
                text: "自定义链接",
                tokens: [{ type: "text", raw, text: "自定义链接" }],
              };
            },
          },
        },
      });
      const anchor = parseDocument(
        parser.parse("（https://example.com/路径），继续"),
      ).querySelector("a")!;

      expect(anchor.getAttribute("href")).toBe("/custom");
      expect(anchor.textContent).toBe("自定义链接");
      expect(anchor.nextSibling).toBeNull();
    });

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

  describe("link attributes", () => {
    it("escapes quotes in href and title", () => {
      const parser = new Parser();
      expect(parser.parse('https://a.com/"onmouseover="alert(1)')).toBe(
        '<p><a href="https://a.com/&quot;onmouseover=&quot;alert(1)" target="_blank" rel="noopener noreferrer">https://a.com/&quot;onmouseover=&quot;alert(1)</a></p>',
      );
      expect(parser.parse('[link](https://a.com "ti\\"tle")')).toBe(
        '<p><a href="https://a.com" title="ti&quot;tle" target="_blank" rel="noopener noreferrer">link</a></p>',
      );
    });

    it.each(["&copy;", "&amp;", "&#38;", "&#x26;", "&copy="])(
      "preserves literal ampersands in a bare URL and its label: %s",
      part => {
        const url = `https://a.com/?tag=A${part}B`;
        const anchor = parseDocument(
          new Parser().parse(`看 ${url} 后面`),
        ).querySelector("a")!;

        expect(anchor.getAttribute("href")).toBe(url);
        expect(anchor.textContent).toBe(url);
      },
    );

    it.each([
      [
        '[说明](/docs&sol;guide "研发 &amp; 测试")',
        "/docs/guide",
        "说明",
        "研发 & 测试",
      ],
      [
        '[说明][docs]\n\n[docs]: /docs&sol;guide "研发 &amp; 测试"',
        "/docs/guide",
        "说明",
        "研发 & 测试",
      ],
      [
        "<https://example.com/docs&sol;guide>",
        "https://example.com/docs/guide",
        "https://example.com/docs/guide",
        null,
      ],
      ["[x](https://a.com/?a=1&amp;b=2)", "https://a.com/?a=1&b=2", "x", null],
    ])(
      "keeps entity semantics for delimited links: %s",
      (input, href, text, title) => {
        const anchor = parseDocument(new Parser().parse(input)).querySelector(
          "a",
        )!;

        expect(anchor.getAttribute("href")).toBe(href);
        expect(anchor.textContent).toBe(text);
        expect(anchor.getAttribute("title")).toBe(title);
      },
    );

    it("does not change explicit markdown links with CJK punctuation in the destination", () => {
      const parser = new Parser();
      const result = parser.parse("[示例](https://example.com/路径，详情)");

      expect(result).toBe(
        '<p><a href="https://example.com/路径，详情" target="_blank" rel="noopener noreferrer">示例</a></p>',
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
