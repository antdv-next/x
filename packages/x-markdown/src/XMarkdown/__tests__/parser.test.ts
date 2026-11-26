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

    it("stops before the prose after a URL wrapped in full-width parentheses", () => {
      const parser = new Parser();
      const result = parser.parse(
        "**看这个链接地址**（https://x.antdv-next.cn），随后返回的数据内容............",
      );

      expect(result).toBe(
        '<p><strong>看这个链接地址</strong>（<a href="https://x.antdv-next.cn" target="_blank" rel="noopener noreferrer">https://x.antdv-next.cn</a>），随后返回的数据内容............</p>',
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

    // ASCII 结构字符后跟汉字既可能是 URL 的一部分，也可能是正文标点；
    // 猜错会把合法链接截断（IDN 主机、查询串、版本号），因此一律不猜。
    it.each([
      ["https://www.例子.中国", "了解"],
      ["https://example.com/search?关键词", "后续"],
      ["https://a.com/~用户", "后续"],
      ["https://example.com/docs/v1.中文版", "后续"],
      ["https://a.com/a,b,中文", "后续"],
      ["https://a.com/x*中文", "后续"],
      ["https://a.com/路径#中文", "后续"],
      ["https://a.com/wiki/A_(B)中文", "后续"],
    ])(
      "does not truncate at an ASCII URL character followed by CJK: %s",
      (url, tail) => {
        const href = url.startsWith("www.") ? `http://${url}` : url;
        expect(new Parser().parse(`${url} ${tail}`)).toBe(
          `<p><a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a> ${tail}</p>`,
        );
      },
    );

    // marked 的裸 `www.` 主机规则本身只认 ASCII 主机名，IDN 不产生链接；
    // 我们的覆写也不能把它截成 `www` 后重跑 tokenizer（那会静默吞掉仅有的链接）。
    it("leaves a bare www IDN host alone as marked does", () => {
      expect(new Parser().parse("www.例子.中国 了解")).toBe(
        "<p>www.例子.中国 了解</p>",
      );
    });

    it("stops at the extended CJK closing punctuation", () => {
      expect(
        new Parser().parse("看 https://a.com/路径》」』】〕〉”’…后面"),
      ).toBe(
        '<p>看 <a href="https://a.com/路径" target="_blank" rel="noopener noreferrer">https://a.com/路径</a>》」』】〕〉”’…后面</p>',
      );
    });

    it("stops before prose right after the host", () => {
      expect(new Parser().parse("地址 https://a.com（文档站）。")).toBe(
        '<p>地址 <a href="https://a.com" target="_blank" rel="noopener noreferrer">https://a.com</a>（文档站）。</p>',
      );
    });

    it.each([
      "https://a.com/【标签】页",
      "https://a.com/《详情》页",
      "https://a.com/「详情」页",
    ])("protects balanced non-fullwidth-paren CJK brackets: %s", url => {
      expect(new Parser().parse(`${url}，继续`)).toBe(
        `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>，继续</p>`,
      );
    });

    it("keeps prose as text when truncation leaves no valid URL", () => {
      expect(new Parser().parse("见 https://，继续")).toBe(
        "<p>见 https://，继续</p>",
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

      expect(parser.parse("看 https://a.com/路径，继续")).toBe(
        '<p>看 <a href="https://a.com/路径" target="_blank" rel="noopener noreferrer">https://a.com/路径</a>，继续</p>',
      );
      expect(calls.length).toBeGreaterThan(0);
    });

    it("escapes quotes in href and title", () => {
      const parser = new Parser();
      expect(parser.parse('https://a.com/"onmouseover="alert(1)')).toBe(
        '<p><a href="https://a.com/&quot;onmouseover=&quot;alert(1)" target="_blank" rel="noopener noreferrer">https://a.com/&quot;onmouseover=&quot;alert(1)</a></p>',
      );
      expect(parser.parse('[link](https://a.com "ti\\"tle")')).toBe(
        '<p><a href="https://a.com" title="ti&quot;tle" target="_blank" rel="noopener noreferrer">link</a></p>',
      );
    });

    it("escapes ambiguous ampersands in href but keeps standard entities", () => {
      const parser = new Parser();
      const domHref = (html: string) =>
        new DOMParser()
          .parseFromString(html, "text/html")
          .querySelector("a")!
          .getAttribute("href");

      const bare = parser.parse("看 https://a.com/?a=1&copy;y 后面");
      expect(bare).toContain('href="https://a.com/?a=1&amp;copy;y"');
      expect(domHref(bare)).toBe("https://a.com/?a=1&copy;y");

      const normal = parser.parse("看 https://a.com/?a=1&copy=2 后面");
      expect(domHref(normal)).toBe("https://a.com/?a=1&copy=2");

      const encoded = parser.parse("[x](https://a.com/?a=1&amp;b=2)");
      expect(encoded).toContain('href="https://a.com/?a=1&amp;b=2"');
      expect(domHref(encoded)).toBe("https://a.com/?a=1&b=2");
    });

    it("does not change explicit markdown links with CJK punctuation in the destination", () => {
      const parser = new Parser();
      const result = parser.parse("[示例](https://example.com/路径，详情)");

      expect(result).toBe(
        '<p><a href="https://example.com/路径，详情" target="_blank" rel="noopener noreferrer">示例</a></p>',
      );
    });

    // `setOptions({ config })` 会重建 marked 实例，CJK 覆写必须重新挂载，
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
