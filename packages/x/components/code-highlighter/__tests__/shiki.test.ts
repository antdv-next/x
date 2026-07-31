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

  it("resolves aliases (ts -> typescript)", async () => {
    const { codeToHtml } = await import("../shiki");

    const html = await codeToHtml("const x = 1;", { lang: "ts" });

    expect(html).toContain('class="shiki vitesse-light"');
  });

  it("falls back to plain text for non-builtin languages without warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { codeToHtml } = await import("../shiki");

    const html = await codeToHtml('x = "a&b"', { lang: "go" });

    expect(html).toBe("<pre><code>x = &quot;a&amp;b&quot;</code></pre>");
    expect(warn).not.toHaveBeenCalled();
  });

  it("renders plain text without attempting to load a grammar", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { codeToHtml } = await import("../shiki");

    const html = await codeToHtml("value < 10", { lang: "text" });

    expect(html).toBe("<pre><code>value &lt; 10</code></pre>");
    expect(warn).not.toHaveBeenCalled();
  });

  it("loads a non-builtin language via setupCodeHighlighter", async () => {
    const { setupCodeHighlighter, codeToHtml } = await import("../shiki");
    setupCodeHighlighter({
      loadLanguage: async lang => {
        if (lang !== "go") return null;
        const mod = await import("shiki/dist/langs/go.mjs");
        return mod.default;
      },
    });

    const html = await codeToHtml("package main", { lang: "go" });

    expect(html).toContain('class="shiki vitesse-light"');
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
