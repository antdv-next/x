import { describe, expect, it } from "vitest";
import {
  defineComponent,
  effectScope,
  nextTick,
  ref,
  type Component,
} from "vue";

import { useStreaming } from "../useStreaming";

/**
 * Drive `useStreaming` with streaming enabled and return the latest
 * `processedContent` value after Vue flushes.
 */
async function stream(
  chunks: string[],
  opts: { hasNextChunk?: boolean } = {},
): Promise<string> {
  let result = "";
  const scope = effectScope();
  await scope.run(async () => {
    const content = ref("");
    const streaming = ref({ hasNextChunk: opts.hasNextChunk ?? true });
    const { processedContent } = useStreaming(content, streaming);
    await nextTick();
    let acc = "";
    for (const chunk of chunks) {
      acc += chunk;
      content.value = acc;
      await nextTick();
    }
    result = processedContent.value;
  });
  scope.stop();
  return result;
}

describe("useStreaming fence correctness", () => {
  it("streams plain text unchanged", async () => {
    const out = await stream(["Hello", " world"]);
    expect(out).toBe("Hello world");
  });

  it("opens a fence on a partial last line immediately", async () => {
    // While ```` is still the partial last line, content is treated as in a code block.
    const out = await stream(["```js\nconst a = 1;\n"]);
    expect(out).toBe("```js\nconst a = 1;\n");
  });

  it("keeps an unclosed fence open for streaming continuation", async () => {
    const out = await stream(["```\ncode here"]);
    // No closing fence yet -> the fence stays open, content committed as-is.
    expect(out).toBe("```\ncode here");
  });

  it("closes a fence once its line is completed by a newline", async () => {
    const out = await stream(["```\ncode\n```\nafter"]);
    expect(out).toBe("```\ncode\n```\nafter");
  });

  it("requires the same fence char to close", async () => {
    // Tilde fence cannot be closed by backticks.
    const out = await stream(["~~~\ncode\n```\nstill in fence"]);
    expect(out).toBe("~~~\ncode\n```\nstill in fence");
  });

  it("requires at least the opening run length to close", async () => {
    const out = await stream(["````\ncode\n```\nstill in fence"]);
    expect(out).toBe("````\ncode\n```\nstill in fence");
  });

  it("allows a longer closing fence", async () => {
    const out = await stream(["```\ncode\n````\nafter"]);
    expect(out).toBe("```\ncode\n````\nafter");
  });

  it("treats a closing fence with trailing whitespace as valid", async () => {
    const out = await stream(["```\ncode\n```   \nafter"]);
    expect(out).toBe("```\ncode\n```   \nafter");
  });

  it("does not treat a closing fence with non-whitespace tail as close", async () => {
    const out = await stream(["```\ncode\n```js\nstill in fence"]);
    expect(out).toBe("```\ncode\n```js\nstill in fence");
  });
});

describe("useStreaming CRLF semantics", () => {
  it("handles CRLF fence open and close", async () => {
    const out = await stream(["```\r\ncode\r\n```\r\nafter"]);
    expect(out).toBe("```\r\ncode\r\n```\r\nafter");
  });

  it("handles a trailing CR", async () => {
    const out = await stream(["```\r"]);
    expect(out).toBe("```\r");
  });
});

describe("useStreaming long single-line content (base64 images)", () => {
  it("streams a large base64 image without quadratic slowdown", async () => {
    const base64 = "A".repeat(300_000);
    const full = `Here is an image:\n\n![chart](data:image/png;base64,${base64})\n\nDone.`;
    const chunkSize = 1000;

    let result = "";
    const scope = effectScope();
    const start = performance.now();
    await scope.run(async () => {
      const content = ref("");
      const streaming = ref({ hasNextChunk: true });
      const { processedContent } = useStreaming(content, streaming);
      await nextTick();
      let acc = "";
      for (
        let end = chunkSize;
        end < full.length + chunkSize;
        end += chunkSize
      ) {
        acc = full.slice(0, Math.min(end, full.length));
        content.value = acc;
        await nextTick();
      }
      result = processedContent.value;
    });
    const elapsed = performance.now() - start;
    scope.stop();

    expect(result).toBe(full);
    expect(elapsed).toBeLessThan(10000);
  }, 120_000);

  it("keeps fence state correct when a code block follows long content", async () => {
    const base64 = "B".repeat(20_000);
    const full = `![img](data:image/png;base64,${base64})\n\n\`\`\`js\nconst a = 1;\n`;

    let result = "";
    const scope = effectScope();
    await scope.run(async () => {
      const content = ref(full.slice(0, 100));
      const streaming = ref({ hasNextChunk: true });
      const { processedContent } = useStreaming(content, streaming);
      await nextTick();
      content.value = full;
      await nextTick();
      result = processedContent.value;
    });
    scope.stop();

    // Inside an open fence every char is committed as-is (no token recognition)
    expect(result).toBe(full);
  });
});

describe("useStreaming non-streaming passthrough", () => {
  it("returns content verbatim when hasNextChunk is false", async () => {
    let result = "";
    const scope = effectScope();
    await scope.run(async () => {
      const content = ref("```\ncode\n```\ntext");
      const streaming = ref({ hasNextChunk: false });
      const { processedContent } = useStreaming(content, streaming);
      await nextTick();
      result = processedContent.value;
    });
    scope.stop();
    expect(result).toBe("```\ncode\n```\ntext");
  });
});

describe("useStreaming incremental table state", () => {
  /** Feed one character at a time, staying in streaming mode, and keep every output. */
  async function streamOutputs(text: string): Promise<{
    outputs: string[];
    at: (prefix: string) => string;
  }> {
    const outputs: string[] = [];
    const scope = effectScope();
    await scope.run(async () => {
      const content = ref("");
      const streaming = ref({ hasNextChunk: true });
      const { processedContent } = useStreaming(content, streaming);
      await nextTick();
      for (let i = 1; i <= text.length; i++) {
        content.value = text.slice(0, i);
        await nextTick();
        outputs.push(processedContent.value);
      }
    });
    scope.stop();
    // Indexed by prefix so each assertion names the state it pins.
    return { outputs, at: (prefix: string) => outputs[prefix.length - 1] };
  }

  it("should hold a table back until its delimiter row is terminated", async () => {
    const text = "| H1 | H2 |\n| --- | --- |\n| a | b |\n\nnext paragraph";
    const { outputs, at } = await streamOutputs(text);

    // Header only, and header plus an unterminated delimiter row, are both
    // still incomplete, so nothing is emitted yet.
    expect(at("| H1 | H2 |")).toBe("");
    expect(at("| H1 | H2 |\n| --- | --- |")).toBe("");
    // Once the delimiter row ends the table has more than two lines and is
    // emitted as-is rather than replaced by a placeholder.
    expect(at("| H1 | H2 |\n| --- | --- |\n")).toBe(
      "| H1 | H2 |\n| --- | --- |\n",
    );
    // The blank line releases the token; the paragraph after it streams normally.
    expect(outputs[outputs.length - 1]).toBe(text);
  });

  it("should start a fresh table after the previous one ended", async () => {
    const text =
      "| H1 | H2 |\n| --- | --- |\n| a | b |\n\n| H3 | H4 |\n| --- | --- |\n| c | d |";
    const { outputs, at } = await streamOutputs(text);
    const firstTable = "| H1 | H2 |\n| --- | --- |\n| a | b |\n\n";

    // The second table's header is held back on its own, which only works if
    // the state was reset when the first table committed.
    expect(at(`${firstTable}| H3 | H4 |`)).toBe(firstTable);
    expect(outputs[outputs.length - 1]).toBe(text);
  });

  it("should not treat a pipe table inside a fenced code block as a table", async () => {
    const text = "```\n| H1 | H2 |\n| --- | --- |\n| a | b |\n```\n";
    const { outputs, at } = await streamOutputs(text);

    // Inside a fence every character is committed as-is, so nothing is held back.
    expect(at("```\n| H1 | H2 |")).toBe("```\n| H1 | H2 |");
    expect(outputs[outputs.length - 1]).toBe(text);
  });

  it("should keep the delimiter verdict frozen once that row is terminated", async () => {
    const text =
      "| H1 | H2 |\n| --- | --- |\n| a-b | c---d |\n| --- | --- |\n\n";
    const { outputs, at } = await streamOutputs(text);
    const upToSecondDelimiter =
      "| H1 | H2 |\n| --- | --- |\n| a-b | c---d |\n| --- | --- |";

    // A later row full of pipes and dashes must not re-open the verdict.
    expect(at(upToSecondDelimiter)).toBe(upToSecondDelimiter);
    expect(outputs[outputs.length - 1]).toBe(text);
  });

  it("should commit immediately once the delimiter row is known to be invalid", async () => {
    const text = "| H1 | H2 |\n| xx | yy |\n";
    const { outputs, at } = await streamOutputs(text);

    expect(at("| H1 | H2 |")).toBe("");
    // `| x` cannot be a delimiter row, so the table token is given up and the
    // text flows through from that character on.
    expect(at("| H1 | H2 |\n| x")).toBe("| H1 | H2 |\n| x");
    // The trailing `| yy |` opens a new pending table, so it is still held
    // back while the stream is open.
    expect(outputs[outputs.length - 1]).toBe("| H1 | H2 |\n| xx ");
  });

  it("should stay linear on a long table", async () => {
    // The table token is held until its terminating blank line, so a full
    // re-scan of the pending buffer per character would be O(N²) here — the
    // same trap the fenced-code-block state already avoids.
    const rows = Array.from(
      { length: 2000 },
      (_, i) => `| key${i} | value${i} |`,
    ).join("\n");
    const full = `| H1 | H2 |\n| --- | --- |\n${rows}\n\ntail`;

    let result = "";
    const scope = effectScope();
    await scope.run(async () => {
      const content = ref(full.slice(0, 100));
      const streaming = ref({ hasNextChunk: true });
      const { processedContent } = useStreaming(content, streaming);
      await nextTick();
      content.value = full;
      await nextTick();
      result = processedContent.value;
    });
    scope.stop();
    expect(result).toBe(full);
  });
});

describe("useStreaming indented fences", () => {
  it("treats a fence indented by up to three spaces as code", async () => {
    // Inside a fence nothing is held back, so an incomplete link streams
    // through as-is; a four-space indent is indented code, not a fence, and
    // the link on the next line is recognised again.
    const run = async (text: string) => {
      let result = "";
      const scope = effectScope();
      await scope.run(async () => {
        const content = ref(text);
        const streaming = ref({ hasNextChunk: true });
        const { processedContent } = useStreaming(content, streaming);
        await nextTick();
        result = processedContent.value;
      });
      scope.stop();
      return result;
    };

    expect(await run("  ```\n[link](https://x")).toBe(
      "  ```\n[link](https://x",
    );
    expect(await run("   ~~~\ncode\n   ~~~\n[link](https://x")).toBe(
      "   ~~~\ncode\n   ~~~\n",
    );
    expect(await run("    ```\n[link](https://x")).toBe("    ```\n");
  });
});

describe("useStreaming incompleteMarkdown: 'complete'", () => {
  async function streamWith(
    text: string,
    streaming: Record<string, unknown>,
    components?: Record<string, Component>,
  ) {
    const outputs: string[] = [];
    const scope = effectScope();
    await scope.run(async () => {
      const content = ref("");
      const streamingRef = ref({ hasNextChunk: true, ...streaming });
      const componentsRef = ref(components);
      const { processedContent } = useStreaming(
        content,
        streamingRef,
        componentsRef,
      );
      await nextTick();
      for (let i = 1; i <= text.length; i++) {
        content.value = text.slice(0, i);
        await nextTick();
        outputs.push(processedContent.value);
      }
    });
    scope.stop();
    return { outputs, at: (prefix: string) => outputs[prefix.length - 1] };
  }

  const complete = (text: string, components?: Record<string, Component>) =>
    streamWith(text, { incompleteMarkdown: "complete" }, components);

  it("closes emphasis that is still open, keeping trailing whitespace outside", async () => {
    const { at } = await complete("see **bold and more** end");
    expect(at("see **bold")).toBe("see **bold**");
    expect(at("see **bold and ")).toBe("see **bold and** ");
    expect(at("see **bold and more**")).toBe("see **bold and more**");
    expect(at("see **")).toBe("see ");
    expect((await complete("a *em")).at("a *em")).toBe("a *em*");
    expect((await complete("a ___x")).at("a ___x")).toBe("a ___x___");
  });

  it("closes inline code that is still open", async () => {
    const { at } = await complete("run `npm i` now");
    expect(at("run `npm")).toBe("run `npm`");
    expect(at("run `")).toBe("run ");
    expect(at("run `npm i`")).toBe("run `npm i`");
  });

  it("shows the text of a link that is still open", async () => {
    const { at } = await complete("see [docs](https://x.ant.design) now");
    expect(at("see [do")).toBe("see do");
    expect(at("see [docs](https://x")).toBe("see docs");
    expect(at("see [")).toBe("see ");
    expect(at("see [docs](https://x.ant.design)")).toBe(
      "see [docs](https://x.ant.design)",
    );
  });

  it("completes emphasis inside a list item that is still open", async () => {
    const { at } = await complete("- **bo");
    expect(at("- ")).toBe("");
    expect(at("- **bo")).toBe("- **bo**");
  });

  it("still holds back images, html and single-row tables", async () => {
    expect((await complete("![alt](https://x")).at("![alt](https://x")).toBe(
      "",
    );
    expect((await complete('<div class="a')).at('<div class="a')).toBe("");
    expect((await complete("| a | b |")).at("| a | b |")).toBe("");
    // …while a table with a terminated delimiter row flows through as before.
    expect(
      (await complete("| a |\n| - |\n| 1 ")).at("| a |\n| - |\n| 1 "),
    ).toBe("| a |\n| - |\n| 1 ");
  });

  it("lets an explicit incompleteMarkdownComponentMap entry win over completion", async () => {
    const components = { "my-emphasis": defineComponent(() => () => null) };
    const { at } = await streamWith(
      "see **bold",
      {
        incompleteMarkdown: "complete",
        incompleteMarkdownComponentMap: { emphasis: "my-emphasis" },
      },
      components,
    );
    expect(at("see **bold")).toBe('see <my-emphasis data-raw="**bold" />');
    // A token without an entry is still completed.
    expect((await complete("run `npm", components)).at("run `npm")).toBe(
      "run `npm`",
    );
  });

  it("leaves placeholder mode untouched by default", async () => {
    expect((await streamWith("see **bold", {})).at("see **bold")).toBe("see ");
    expect(
      (
        await streamWith("see **bold", { incompleteMarkdown: "placeholder" })
      ).at("see **bold"),
    ).toBe("see ");
  });
});
