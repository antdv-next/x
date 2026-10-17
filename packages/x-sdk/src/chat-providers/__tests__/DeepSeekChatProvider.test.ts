import { describe, expect, it } from "vitest";

import XRequest from "../../x-request";
import DeepSeekChatProvider from "../DeepSeekChatProvider";

const jsonHeaders = new Headers({ "content-type": "application/json" });
const sseHeaders = new Headers({ "content-type": "text/event-stream" });

function createProvider() {
  return new DeepSeekChatProvider({
    request: XRequest("https://api.deepseek.com/chat/completions", {
      manual: true,
    }),
  });
}

/** A non-streaming JSON chunk, shaped like DeepSeek's `choices[].message`. */
function jsonChunk(delta: Record<string, unknown>) {
  return {
    choices: [{ message: { role: "assistant", ...delta } }],
  } as any;
}

/** A streaming chunk, shaped like DeepSeek's `choices[].delta`. */
function sseChunk(delta: Record<string, unknown>) {
  return {
    data: JSON.stringify({
      choices: [{ delta: { role: "assistant", ...delta } }],
    }),
  } as any;
}

/**
 * Fold a list of deltas through `transformMessage` the way `useXChat` does:
 * every chunk sees the message produced by the previous one as `originMessage`.
 */
function foldDeltas(
  provider: ReturnType<typeof createProvider>,
  headers: Headers,
  chunks: any[],
) {
  let originMessage: any;
  for (const chunk of chunks) {
    originMessage = provider.transformMessage({
      originMessage,
      chunk,
      chunks: [chunk],
      status: "updating",
      responseHeaders: headers,
    });
  }
  return originMessage;
}

describe("DeepSeekChatProvider mixed reasoning and content", () => {
  it("keeps both parts of a non-streaming message that carries reasoning and content", () => {
    const provider = createProvider();

    const result = provider.transformMessage({
      chunk: jsonChunk({
        reasoning_content: "Reasoning.",
        content: "Answer.",
      }),
      chunks: [],
      status: "success",
      responseHeaders: jsonHeaders,
    });

    expect(result).toEqual({
      role: "assistant",
      content: '\n\n<think status="done">\n\nReasoning.\n\n</think>\n\nAnswer.',
    });
  });

  it("keeps both parts when reasoning and content arrive in the same SSE delta", () => {
    const provider = createProvider();

    const result = foldDeltas(provider, sseHeaders, [
      sseChunk({ reasoning_content: "Reasoning.", content: "Answer." }),
    ]);

    expect(result.content).toBe(
      '\n\n<think status="done">\n\nReasoning.\n\n</think>\n\nAnswer.',
    );
  });

  it("keeps reasoning that arrives after content in separate SSE deltas", () => {
    const provider = createProvider();

    const result = foldDeltas(provider, sseHeaders, [
      sseChunk({ reasoning_content: "Reasoning." }),
      sseChunk({ content: "Answer." }),
    ]);

    expect(result.content).toBe(
      '\n\n<think status="done">\n\nReasoning.\n\n</think>\n\nAnswer.',
    );
  });

  it("retains the reasoning tail when a later SSE delta also starts the answer", () => {
    const provider = createProvider();

    const result = foldDeltas(provider, sseHeaders, [
      sseChunk({ reasoning_content: "Reasoning." }),
      sseChunk({ reasoning_content: " More reasoning.", content: "Answer." }),
    ]);

    expect(result.content).toBe(
      '\n\n<think status="done">\n\nReasoning. More reasoning.\n\n</think>\n\nAnswer.',
    );
  });

  it("does not drop the reasoning written before the answer in the same delta", () => {
    const provider = createProvider();

    const result = foldDeltas(provider, sseHeaders, [
      sseChunk({
        reasoning_content: "Step by step analysis",
        content: "Final conclusion",
      }),
    ]);

    expect(result.content).toBe(
      '\n\n<think status="done">\n\nStep by step analysis\n\n</think>\n\nFinal conclusion',
    );
  });

  it("keeps extending the answer across later SSE deltas", () => {
    const provider = createProvider();

    const result = foldDeltas(provider, sseHeaders, [
      sseChunk({ reasoning_content: "Reasoning.", content: "Answer" }),
      sseChunk({ content: " continues." }),
    ]);

    expect(result.content).toBe(
      '\n\n<think status="done">\n\nReasoning.\n\n</think>\n\nAnswer continues.',
    );
  });

  it.each(["JSON", "SSE"])(
    "does not replay %s content once the answer is complete",
    format => {
      const provider = createProvider();

      const result =
        format === "JSON"
          ? provider.transformMessage({
              chunk: jsonChunk({ content: "Answer exactly once." }),
              chunks: [],
              status: "success",
              responseHeaders: jsonHeaders,
            })
          : foldDeltas(provider, sseHeaders, [
              sseChunk({ content: "Answer exactly once." }),
            ]);

      expect(result.content).toBe("Answer exactly once.");
    },
  );

  it("keeps the open think block streaming when only reasoning has arrived", () => {
    const provider = createProvider();

    const result = foldDeltas(provider, sseHeaders, [
      sseChunk({ reasoning_content: "Deep reasoning" }),
    ]);

    expect(result.content).toBe("\n\n<think>\n\nDeep reasoning");
  });

  it("closes an open think block carried in originMessage", () => {
    const provider = createProvider();

    const result = provider.transformMessage({
      originMessage: {
        role: "assistant",
        content: "\n\n<think>\n\nDeep reasoning",
      } as any,
      chunk: sseChunk({ content: "Answer" }),
      chunks: [],
      status: "updating",
      responseHeaders: sseHeaders,
    });

    expect(result.content).toBe(
      '\n\n<think status="done">\n\nDeep reasoning\n\n</think>\n\nAnswer',
    );
  });
});
