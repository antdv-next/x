import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";

import { useChunkedStream } from "../use-chunked-stream";

describe("useChunkedStream", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(text = "x".repeat(100), chunk = 10, interval = 100) {
    const scope = effectScope();
    const intervalMs = ref(interval);
    let stream!: ReturnType<typeof useChunkedStream>;
    scope.run(() => {
      stream = useChunkedStream(text, chunk, intervalMs);
    });
    return { scope, intervalMs, stream };
  }

  /** Advance the clock, then flush the watcher that schedules the next step. */
  async function advance(ms: number) {
    vi.advanceTimersByTime(ms);
    await nextTick();
  }

  it("advances chunk by chunk and stops at the end", async () => {
    const { scope, stream } = setup("x".repeat(25));
    for (let i = 0; i < 3; i++) await advance(100);
    expect(stream.content.value).toBe("x".repeat(25));
    expect(stream.isStreaming.value).toBe(false);
    // No timer is left pending once the stream is done.
    expect(vi.getTimerCount()).toBe(0);
    scope.stop();
  });

  it("keeps the pending step alive when restart fires while already at the start", async () => {
    const { scope, stream } = setup();
    // The reported stall: clicking Run Stream twice quickly (index is still
    // 0, so the assignment is a no-op) must not leave the stream without a
    // scheduled timer.
    stream.restart();
    stream.restart();
    await advance(100);
    expect(stream.content.value.length).toBe(10);
    await advance(100);
    expect(stream.content.value.length).toBe(20);
    scope.stop();
  });

  it("still streams when restart fires during the first interval after mount", async () => {
    const { scope, stream } = setup();
    stream.restart();
    await advance(100);
    expect(stream.content.value.length).toBe(10);
    scope.stop();
  });

  it("restarts from the beginning mid-stream", async () => {
    const { scope, stream } = setup();
    await advance(100);
    await advance(100);
    await advance(100);
    expect(stream.content.value.length).toBe(30);

    stream.restart();
    expect(stream.content.value).toBe("");
    expect(stream.isStreaming.value).toBe(true);
    await nextTick(); // let the watcher replace the pending step

    await advance(100);
    expect(stream.content.value.length).toBe(10);
    scope.stop();
  });

  it("replays from the start after completion", async () => {
    const { scope, stream } = setup("x".repeat(25));
    for (let i = 0; i < 3; i++) await advance(100);
    expect(stream.isStreaming.value).toBe(false);

    stream.restart();
    expect(stream.content.value).toBe("");
    await nextTick();

    await advance(100);
    expect(stream.content.value.length).toBe(10);
    expect(stream.isStreaming.value).toBe(true);
    scope.stop();
  });

  it("follows interval changes", async () => {
    const { scope, intervalMs, stream } = setup();
    intervalMs.value = 500;
    await nextTick();
    await advance(300);
    expect(stream.content.value.length).toBe(0);
    await advance(200);
    expect(stream.content.value.length).toBe(10);
    scope.stop();
  });

  it("clears the pending step when the scope is disposed", async () => {
    const { scope } = setup();
    expect(vi.getTimerCount()).toBe(1);
    scope.stop();
    expect(vi.getTimerCount()).toBe(0);
  });
});
