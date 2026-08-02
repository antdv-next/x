import { describe, expect, it } from "vitest";
import { effectScope, nextTick, ref } from "vue";

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
    expect(elapsed).toBeLessThan(3000);
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
