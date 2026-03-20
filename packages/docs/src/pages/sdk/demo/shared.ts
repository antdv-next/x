export type DemoChunk = {
  id?: string;
  event?: string;
  data?: string;
  [key: string]: unknown;
};

type MockFetch = (
  baseURL: Parameters<typeof fetch>[0],
  options?: Record<string, unknown>,
) => Promise<Response>;

function splitText(text: string, step: number) {
  const result: string[] = [];
  for (let index = 0; index < text.length; index += step) {
    result.push(text.slice(index, Math.min(index + step, text.length)));
  }
  return result;
}

function buildSSEFrame(
  content: string,
  id: number,
  streamSeparator: string,
  partSeparator: string,
  kvSeparator: string,
) {
  return (
    [
      `id${kvSeparator} ${id}`,
      `event${kvSeparator} delta`,
      `data${kvSeparator} ${JSON.stringify({ content })}`,
    ].join(partSeparator) + streamSeparator
  );
}

export function createTimedStream(
  parts: string[],
  interval: number,
  signal?: AbortSignal,
) {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    start(controller) {
      let index = 0;
      let timer: ReturnType<typeof setInterval> | null = null;

      const stop = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };

      const abort = () => {
        stop();
        controller.error(new DOMException("Aborted", "AbortError"));
      };

      if (signal?.aborted) {
        abort();
        return;
      }

      signal?.addEventListener("abort", abort, { once: true });

      timer = setInterval(() => {
        if (signal?.aborted) {
          abort();
          return;
        }

        if (index >= parts.length) {
          stop();
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(parts[index]));
        index += 1;
      }, interval);
    },
  });
}

export function createMockSSEFetch(config?: {
  defaultText?: string;
  step?: number;
  interval?: number;
  streamSeparator?: string;
  partSeparator?: string;
  kvSeparator?: string;
}): MockFetch {
  return async (_baseURL, options = {}) => {
    const params = (options.params ?? {}) as Record<string, unknown>;
    const text = String(
      (params.message as string | undefined) ??
        config?.defaultText ??
        "Hello X SDK",
    );
    const step = Number(params.step ?? config?.step ?? 6);
    const interval = Number(params.interval ?? config?.interval ?? 180);
    const streamSeparator = String(
      (params.streamSeparator as string | undefined) ??
        config?.streamSeparator ??
        "\n\n",
    );
    const partSeparator = String(
      (params.partSeparator as string | undefined) ??
        config?.partSeparator ??
        "\n",
    );
    const kvSeparator = String(
      (params.kvSeparator as string | undefined) ?? config?.kvSeparator ?? ":",
    );

    const chunks = splitText(text, step).map((piece, index) =>
      buildSSEFrame(
        piece,
        index + 1,
        streamSeparator,
        partSeparator,
        kvSeparator,
      ),
    );

    return new Response(
      createTimedStream(chunks, interval, options.signal as AbortSignal),
      {
        headers: {
          "Content-Type": "text/event-stream",
        },
      },
    );
  };
}

export function createPipeProtocolFetch(config?: {
  defaultText?: string;
  step?: number;
  interval?: number;
  separator?: string;
}): MockFetch {
  return async (_baseURL, options = {}) => {
    const params = (options.params ?? {}) as Record<string, unknown>;
    const text = String(
      (params.message as string | undefined) ??
        config?.defaultText ??
        "custom transform stream demo",
    );
    const step = Number(params.step ?? config?.step ?? 5);
    const interval = Number(params.interval ?? config?.interval ?? 160);
    const separator = String(
      (params.separator as string | undefined) ?? config?.separator ?? "|",
    );

    const chunks = splitText(text, step).map(part => `${part}${separator}`);

    return new Response(
      createTimedStream(chunks, interval, options.signal as AbortSignal),
      {
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
  };
}

export function createPipeTransform(separator = "|") {
  let buffer = "";

  return new TransformStream<string, { text: string }>({
    transform(chunk, controller) {
      buffer += chunk;
      const parts = buffer.split(separator);
      const completed = parts.slice(0, -1);
      buffer = parts[parts.length - 1] || "";

      completed.forEach(part => {
        const text = part.trim();
        if (text) controller.enqueue({ text });
      });
    },
    flush(controller) {
      const text = buffer.trim();
      if (text) controller.enqueue({ text });
    },
  });
}

export function parseChunkContent(chunk: DemoChunk) {
  if (typeof chunk.data !== "string") return "";

  try {
    const parsed = JSON.parse(chunk.data) as {
      content?: string;
      text?: string;
    };
    if (typeof parsed.content === "string") return parsed.content;
    if (typeof parsed.text === "string") return parsed.text;
    return chunk.data;
  } catch {
    return chunk.data;
  }
}
