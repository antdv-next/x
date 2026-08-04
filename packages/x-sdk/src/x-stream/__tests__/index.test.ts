import { describe, expect, it, vi } from "vite-plus/test";

import XStream from "../index";

const encoder = new TextEncoder();

describe("XStream", () => {
  it("cancels the source and releases the reader lock on early exit", async () => {
    const cancel = vi.fn();
    const stream = XStream({
      readableStream: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode("data: first\n\n"));
        },
        cancel,
      }),
    });

    for await (const value of stream) {
      expect(value).toEqual({ data: "first" });
      break;
    }

    expect(stream.locked).toBe(false);
    await vi.waitFor(() => expect(cancel).toHaveBeenCalledOnce());

    const reader = stream.getReader();
    await expect(reader.read()).resolves.toEqual({
      done: true,
      value: undefined,
    });
    reader.releaseLock();
  });

  it("preserves the consumer error when cancellation fails", async () => {
    const consumerError = new Error("consumer failed");
    const cancelError = new Error("cancel failed");
    const cancel = vi.fn(() => Promise.reject(cancelError));
    const stream = XStream({
      readableStream: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode("data: first\n\n"));
        },
        cancel,
      }),
    });

    const consume = async () => {
      for await (const _value of stream) {
        throw consumerError;
      }
    };

    await expect(consume()).rejects.toBe(consumerError);
    expect(cancel).toHaveBeenCalledOnce();
    expect(stream.locked).toBe(false);
  });

  it("releases the reader lock without cancellation after normal completion", async () => {
    const cancel = vi.fn();
    const stream = XStream({
      readableStream: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode("data: first\n\n"));
          controller.enqueue(encoder.encode("data: second\n\n"));
          controller.close();
        },
        cancel,
      }),
    });
    const values = [];

    for await (const value of stream) {
      values.push(value);
    }

    expect(values).toEqual([{ data: "first" }, { data: "second" }]);
    expect(cancel).not.toHaveBeenCalled();
    expect(stream.locked).toBe(false);
  });
});
