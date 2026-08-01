import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";

const builtinLanguages = [
  ["typescript", "const x: number = 1;"],
  ["javascript", "const x = 1;"],
  ["python", "x = 1"],
  ["json", '{"a":1}'],
  ["html", "<div>hi</div>"],
  ["css", "a { color: red; }"],
] as const;

const builtinAliases = [
  ["ts", "const x: number = 1;"],
  ["js", "const x = 1;"],
  ["py", "x = 1"],
] as const;

const customLanguages = [
  {
    language: "go",
    code: "package main",
    load: () => import("shiki/dist/langs/go.mjs"),
  },
  {
    language: "rust",
    code: "fn main() {}",
    load: () => import("shiki/dist/langs/rust.mjs"),
  },
  {
    language: "java",
    code: "class Main {}",
    load: () => import("shiki/dist/langs/java.mjs"),
  },
] as const;

describe("CodeHighlighter Shiki integration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(builtinLanguages)(
    "highlights builtin %s on demand",
    async (language, code) => {
      const { codeToHtml } = await import("../shiki");

      const html = await codeToHtml(code, { lang: language });

      expect(html).toContain('class="shiki vitesse-light"');
      expect(html).toContain("<span");
    },
  );

  it.each(builtinAliases)(
    "resolves builtin alias %s",
    async (language, code) => {
      const { codeToHtml } = await import("../shiki");

      const html = await codeToHtml(code, { lang: language });

      expect(html).toContain('class="shiki vitesse-light"');
    },
  );

  it("falls back to plain text for non-builtin languages without warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { codeToHtml } = await import("../shiki");

    const html = await codeToHtml('x = "a&b"', { lang: "go" });

    expect(html).toBe("<pre><code>x = &quot;a&amp;b&quot;</code></pre>");
    expect(warn).not.toHaveBeenCalled();
  });

  it("renders plain text without calling the custom loader", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { codeToHtml, setupCodeHighlighter } = await import("../shiki");
    const loader = vi.fn(async () => null);
    setupCodeHighlighter({ loadLanguage: loader });

    const html = await codeToHtml("value < 10", { lang: "text" });

    expect(html).toBe("<pre><code>value &lt; 10</code></pre>");
    expect(loader).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it.each(customLanguages)(
    "loads custom language $language via setupCodeHighlighter",
    async ({ language, code, load }) => {
      const { setupCodeHighlighter, codeToHtml } = await import("../shiki");
      setupCodeHighlighter({
        loadLanguage: async lang =>
          lang === language ? (await load()).default : null,
      });

      const html = await codeToHtml(code, { lang: language });

      expect(html).toContain('class="shiki vitesse-light"');
    },
  );

  it("falls back to the builtin loader when the custom loader returns null", async () => {
    const { setupCodeHighlighter, codeToHtml } = await import("../shiki");
    const loader = vi.fn(async () => null);
    setupCodeHighlighter({ loadLanguage: loader });

    const html = await codeToHtml("const x: number = 1;", {
      lang: "typescript",
    });

    expect(loader).toHaveBeenCalledOnce();
    expect(html).toContain('class="shiki vitesse-light"');
  });

  it("retries a failed language after configuring a new loader", async () => {
    const { setupCodeHighlighter, codeToHtml } = await import("../shiki");

    const fallback = await codeToHtml("package main", { lang: "go" });
    expect(fallback).toBe("<pre><code>package main</code></pre>");

    setupCodeHighlighter({
      loadLanguage: async lang =>
        lang === "go"
          ? (await import("shiki/dist/langs/go.mjs")).default
          : null,
    });
    const highlighted = await codeToHtml("package main", { lang: "go" });

    expect(highlighted).toContain('class="shiki vitesse-light"');
  });

  it("does not reload a language after its first successful load", async () => {
    const { setupCodeHighlighter, codeToHtml } = await import("../shiki");
    const loader = vi.fn(async () => {
      const mod = await import("shiki/dist/langs/go.mjs");
      return mod.default;
    });
    setupCodeHighlighter({ loadLanguage: loader });

    await codeToHtml("package main", { lang: "go" });
    await codeToHtml("package second", { lang: "go" });

    expect(loader).toHaveBeenCalledOnce();
  });

  it("warns and escapes code when a custom loader throws", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { setupCodeHighlighter, codeToHtml } = await import("../shiki");
    setupCodeHighlighter({
      loadLanguage: async () => {
        throw new Error("boom");
      },
    });

    const html = await codeToHtml("x", { lang: "go" });

    expect(html).toBe("<pre><code>x</code></pre>");
    expect(warn).toHaveBeenCalledWith(
      "[CodeHighlighter] Failed to load language: go",
      expect.any(Error),
    );
  });

  it("warns and escapes code when Shiki rejects a registration", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { setupCodeHighlighter, codeToHtml } = await import("../shiki");
    setupCodeHighlighter({
      loadLanguage: async () => ({}) as never,
    });

    const html = await codeToHtml("x", { lang: "broken" });

    expect(html).toBe("<pre><code>x</code></pre>");
    expect(warn).toHaveBeenCalledWith(
      "[CodeHighlighter] Failed to load language: broken",
      expect.any(Error),
    );
  });

  it("shares an in-flight language load between concurrent calls", async () => {
    const { setupCodeHighlighter, codeToHtml } = await import("../shiki");
    let release!: () => void;
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });
    const loader = vi.fn(async () => {
      await gate;
      const mod = await import("shiki/dist/langs/typescript.mjs");
      return mod.default;
    });
    setupCodeHighlighter({ loadLanguage: loader });

    const first = codeToHtml("const a = 1", { lang: "typescript" });
    const second = codeToHtml("const b = 2", { lang: "typescript" });

    await vi.waitFor(() => {
      expect(loader).toHaveBeenCalledTimes(1);
    });
    release();

    const results = await Promise.all([first, second]);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(results.every(html => html.includes('class="shiki'))).toBe(true);
  });
});
