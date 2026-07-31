import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";

const highlightedLanguages = [
  ["go", "package main\nfunc main() {}"],
  ["rust", "fn main() {}"],
  ["rs", "fn main() {}"],
  ["c++", "int main() {}"],
] as const;

describe("CodeHighlighter Shiki integration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(highlightedLanguages)(
    "loads the bundled %s grammar on demand",
    async (language, code) => {
      const { codeToHtml } = await import("../shiki");

      const html = await codeToHtml(code, { lang: language });

      expect(html).toContain('class="shiki vitesse-light"');
      expect(html).toContain("<span");
    },
  );

  it("warns and escapes code when a language cannot be loaded", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { codeToHtml } = await import("../shiki");

    const html = await codeToHtml('<unknown data-value="a&b">', {
      lang: "not-a-language",
    });

    expect(html).toBe(
      "<pre><code>&lt;unknown data-value=&quot;a&amp;b&quot;&gt;</code></pre>",
    );
    expect(warn).toHaveBeenCalledWith(
      "[CodeHighlighter] Failed to load language: not-a-language",
      expect.any(Error),
    );
  });

  it("renders plain text without attempting to load a grammar", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { codeToHtml } = await import("../shiki");

    const html = await codeToHtml("value < 10", { lang: "text" });

    expect(html).toBe("<pre><code>value &lt; 10</code></pre>");
    expect(warn).not.toHaveBeenCalled();
  });

  it("shares an in-flight language load between concurrent calls", async () => {
    const { bundledLanguages } = await import("shiki/langs");
    const originalLoader = bundledLanguages.go;
    let releaseLoader!: () => void;
    const loaderGate = new Promise<void>(resolve => {
      releaseLoader = resolve;
    });
    const loader = vi.fn(async () => {
      await loaderGate;
      return originalLoader();
    });
    bundledLanguages.go = loader;

    try {
      const { codeToHtml } = await import("../shiki");
      const first = codeToHtml("package main", { lang: "go" });
      const second = codeToHtml("package example", { lang: "go" });

      await vi.waitFor(() => {
        expect(loader).toHaveBeenCalledTimes(1);
      });
      releaseLoader();

      const results = await Promise.all([first, second]);
      expect(loader).toHaveBeenCalledTimes(1);
      expect(results.every(html => html.includes('class="shiki'))).toBe(true);
    } finally {
      releaseLoader();
      bundledLanguages.go = originalLoader;
    }
  });
});
