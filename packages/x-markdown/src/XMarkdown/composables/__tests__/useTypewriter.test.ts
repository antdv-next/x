import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, watchEffect, type Ref } from "vue";

import type { TypewriterConfig } from "../../interface";

import {
  alignToClusterFallback,
  alignToGrapheme,
  useTypewriter,
} from "../useTypewriter";

interface SetupOptions {
  input: string;
  typewriter?: boolean | TypewriterConfig;
  active: boolean;
}

function setup(initial: SetupOptions) {
  const scope = effectScope();
  const input = ref(initial.input);
  const typewriter = ref<boolean | TypewriterConfig | undefined>(
    initial.typewriter,
  );
  const active = ref(initial.active);
  let output!: Ref<string>;
  scope.run(() => {
    output = useTypewriter(input, typewriter, active);
  });
  return {
    scope,
    input,
    typewriter,
    active,
    get current() {
      return output.value;
    },
  };
}

/** Advance one animation frame (16ms). */
function frame(ms = 16) {
  vi.advanceTimersByTime(ms);
}

/**
 * Run frames until the output has not changed for a while; returns every
 * distinct output. The floor speed is 24 chars/s, so in sentence mode a long
 * final sentence can take a couple of seconds of frames to be reached.
 */
function drain(getCurrent: () => string, maxFrames = 1500): string[] {
  const seen: string[] = [getCurrent()];
  let stableFrames = 0;
  for (let i = 0; i < maxFrames; i++) {
    frame();
    const next = getCurrent();
    if (next === seen[seen.length - 1]) {
      stableFrames += 1;
      if (stableFrames >= 250) break;
      continue;
    }
    stableFrames = 0;
    seen.push(next);
  }
  return seen;
}

describe("useTypewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "Date",
        "performance",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ],
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("costs no extra evaluation per chunk while disabled, and shows everything present when enabled later", async () => {
    const scope = effectScope();
    const input = ref("a");
    const typewriter = ref<boolean | TypewriterConfig | undefined>(true);
    const active = ref(false);
    let evaluations = 0;
    let current = "";
    scope.run(() => {
      const output = useTypewriter(input, typewriter, active);
      watchEffect(() => {
        current = output.value;
        evaluations += 1;
      });
    });
    for (const text of ["ab", "abc", "abcd"]) {
      input.value = text;
      await nextTick();
    }
    frame(1000);
    await nextTick();
    // One evaluation per change: the disabled composable must not schedule
    // state updates of its own.
    expect(evaluations).toBe(4);
    expect(current).toBe("abcd");

    // Switching on later shows what is present at that moment at once…
    active.value = true;
    input.value = "abcd efgh";
    await nextTick();
    expect(current).toBe("abcd efgh");
    // …and only types out what arrives afterwards.
    input.value = "abcd efgh and a longer sentence follows here";
    await nextTick();
    frame();
    await nextTick();
    expect(current.length).toBeLessThan(
      "abcd efgh and a longer sentence follows here".length,
    );
    scope.stop();
  });

  it("passes the input through when disabled or inactive", async () => {
    const off = setup({ input: "Hello", typewriter: undefined, active: true });
    expect(off.current).toBe("Hello");
    off.scope.stop();

    const inactive = setup({ input: "Hello", typewriter: true, active: false });
    expect(inactive.current).toBe("Hello");
    inactive.input.value = "Hello world";
    await nextTick();
    expect(inactive.current).toBe("Hello world");
    inactive.scope.stop();
  });

  it("shows what is present at mount immediately and types out what arrives later", async () => {
    const tw = setup({ input: "Hello", typewriter: true, active: true });
    expect(tw.current).toBe("Hello");

    const text =
      "Hello, this is a fairly long sentence that should be revealed over several frames.";
    tw.input.value = text;
    await nextTick();
    const outputs = drain(() => tw.current);

    // Strictly growing prefixes of the input, ending with the full input.
    expect(outputs.length).toBeGreaterThan(3);
    for (let i = 1; i < outputs.length; i++) {
      expect(outputs[i].length).toBeGreaterThan(outputs[i - 1].length);
      expect(text.startsWith(outputs[i])).toBe(true);
    }
    expect(outputs[outputs.length - 1]).toBe(text);
    tw.scope.stop();
  });

  it("reveals everything at once when the stream ends", async () => {
    const tw = setup({ input: "", typewriter: true, active: true });
    const text = "A sentence that has not finished typing yet.";
    tw.input.value = text;
    await nextTick();
    frame();
    expect(tw.current.length).toBeLessThan(text.length);
    tw.active.value = false;
    await nextTick();
    expect(tw.current).toBe(text);
    tw.scope.stop();
  });

  it("shows replaced content at once instead of typing it", async () => {
    const tw = setup({ input: "", typewriter: true, active: true });
    tw.input.value = "first answer being typed";
    await nextTick();
    frame();
    tw.input.value = "a completely different answer";
    await nextTick();
    expect(tw.current).toBe("a completely different answer");
    tw.scope.stop();
  });

  describe("never cuts inside an emoji or another grapheme cluster", () => {
    // Surrogate pairs, ZWJ families, flags (regional-indicator pairs), skin
    // tones, variation selectors, keycaps and combining accents, mixed with
    // plain text so cuts land everywhere.
    const text =
      "😀 family 👨‍👩‍👧‍👦 flags 🇨🇳🇯🇵 tone 👍🏽 heart ❤️ key 1️⃣ accent é (é) " +
      "🧑‍💻🧑🏿‍🚀 end 😀😁😂🤣😃😄😅😆😉😊😋😎😍😘🥰😗😙😚☺️🙂🤗🤩🤔🤨😐😑😶🙄😏😣😥😮🤐😯😪😫🥱😴😌😛";
    // Intl.Segmenter is not in the package's TS lib target, but Node has it.
    type SegmenterCtor = new (
      locales?: string,
      options?: { granularity: "grapheme" },
    ) => { segment(input: string): Iterable<{ segment: string }> };
    const intl = Intl as typeof Intl & { Segmenter?: SegmenterCtor };
    const boundaries = new Set<number>([0]);
    let pos = 0;
    for (const { segment } of new (intl.Segmenter as SegmenterCtor)(undefined, {
      granularity: "grapheme",
    }).segment(text)) {
      pos += segment.length;
      boundaries.add(pos);
    }

    it("with Intl.Segmenter", async () => {
      const tw = setup({ input: "", typewriter: true, active: true });
      tw.input.value = text;
      await nextTick();
      const outputs = drain(() => tw.current);
      for (const output of outputs) {
        expect(text.startsWith(output)).toBe(true);
        expect(boundaries.has(output.length)).toBe(true);
      }
      expect(outputs.length).toBeGreaterThan(5);
      expect(tw.current).toBe(text);
      tw.scope.stop();
    });

    // Exhaustive: every possible cut position must be moved forward to a
    // cluster boundary, by the Intl.Segmenter path and by the fallback used
    // where Intl.Segmenter is missing.
    it("alignToGrapheme (Intl.Segmenter) lands on a boundary for every cut", () => {
      for (let len = 0; len <= text.length; len++) {
        const aligned = alignToGrapheme(text, len);
        expect(aligned).toBeGreaterThanOrEqual(len);
        expect(boundaries.has(aligned)).toBe(true);
      }
    });

    it("alignToClusterFallback lands on a boundary for every cut", () => {
      const wrong: string[] = [];
      for (let len = 0; len <= text.length; len++) {
        const aligned = alignToClusterFallback(text, len);
        if (aligned < len || !boundaries.has(aligned))
          wrong.push(
            `${len}→${aligned} …${text.slice(Math.max(0, aligned - 6), aligned)}|`,
          );
      }
      expect(wrong).toEqual([]);
    });
  });

  describe("unit: 'sentence'", () => {
    it("reveals up to a delimiter at a time", async () => {
      const config: TypewriterConfig = {
        unit: "sentence",
        delimiters: [".", "!"],
      };
      const tw = setup({ input: "", typewriter: config, active: true });
      const text =
        "First one. Second one! Third one which is much longer than the others.";
      tw.input.value = text;
      await nextTick();
      const outputs = drain(() => tw.current);
      expect(outputs).toEqual([
        "",
        "First one.",
        "First one. Second one!",
        "First one. Second one! Third one which is much longer than the others.",
      ]);
      tw.scope.stop();
    });

    it("ignores delimiters inside fenced and inline code", async () => {
      const config: TypewriterConfig = { unit: "sentence", delimiters: ["."] };
      const tw = setup({ input: "", typewriter: config, active: true });
      const text =
        "Run `a.b.c` now.\n```\nx.y();\nz.w();\n```\nDone. `d.e` end.";
      tw.input.value = text;
      await nextTick();
      const outputs = drain(() => tw.current);
      expect(outputs[outputs.length - 1]).toBe(text);
      // Every intermediate reveal stops at a sentence end or a line end,
      // never at a `.` that sits inside inline or fenced code.
      for (const output of outputs.slice(1, -1)) {
        expect(output.endsWith(".") || output.endsWith("\n")).toBe(true);
        expect(
          ["`a.", "`a.b.", "\nx.", "\nz.", "`d."].some(s => output.endsWith(s)),
        ).toBe(false);
      }
      // The first sentence is revealed on its own (with or without its line end).
      expect(
        outputs.some(
          o => o === "Run `a.b.c` now." || o === "Run `a.b.c` now.\n",
        ),
      ).toBe(true);
      tw.scope.stop();
    });

    it("treats a newline as a boundary even inside code and even if not listed as a delimiter", async () => {
      const config: TypewriterConfig = { unit: "sentence", delimiters: ["."] };
      const tw = setup({ input: "", typewriter: config, active: true });
      const text = "```\nx.y();\nz.w();\n```\n";
      tw.input.value = text;
      await nextTick();
      const outputs = drain(() => tw.current);
      expect(outputs).toEqual([
        "",
        "```\n",
        "```\nx.y();\n",
        "```\nx.y();\nz.w();\n",
        text,
      ]);
      tw.scope.stop();
    });
  });

  it("falls back to character reveal after maxSentenceChars without a delimiter", async () => {
    const config: TypewriterConfig = {
      unit: "sentence",
      delimiters: ["."],
      maxSentenceChars: 40,
    };
    const tw = setup({ input: "", typewriter: config, active: true });
    // No '.' anywhere in the run (a '.' in a URL is a delimiter like any other).
    const longRun =
      "https://example-com/a-very-long-path-without-any-punctuation-" +
      "x".repeat(120);
    const text = `${longRun} and then a sentence. done`;
    tw.input.value = text;
    await nextTick();
    const outputs = drain(() => tw.current);
    // Something shows before the delimiter arrives (not just '' and the whole run)…
    const beforeDelimiter = outputs.filter(
      o => o.length > 0 && o.length < longRun.length,
    );
    expect(beforeDelimiter.length).toBeGreaterThan(3);
    // …and none of it before the cap was reached.
    expect(beforeDelimiter.every(o => o.length > 40)).toBe(true);
    // Once a delimiter shows up, sentence mode takes over again.
    expect(outputs).toContain(`${longRun} and then a sentence.`);
    expect(outputs[outputs.length - 1]).toBe(text);
    tw.scope.stop();
  });

  it("treats one or two backticks at a line start as inline code, not a fence", async () => {
    const config: TypewriterConfig = { unit: "sentence", delimiters: ["."] };
    const tw = setup({ input: "", typewriter: config, active: true });
    const text = "`a.b` first. second.";
    tw.input.value = text;
    await nextTick();
    const outputs = drain(() => tw.current);
    for (const output of outputs.slice(1, -1)) {
      expect(output.endsWith("`a.")).toBe(false);
    }
    expect(outputs).toContain("`a.b` first.");
    expect(outputs[outputs.length - 1]).toBe(text);
    tw.scope.stop();
  });

  it("rescans boundaries when the not-yet-shown tail is rewritten", async () => {
    const config: TypewriterConfig = { unit: "sentence", delimiters: ["."] };
    const tw = setup({ input: "A. B.", typewriter: config, active: true });
    expect(tw.current).toBe("A. B.");
    // An unfinished fence arrives and is scanned (but not yet shown)…
    tw.input.value = "A. B. ```\nx.y";
    await nextTick();
    // …then the caller rewrites that tail while the shown prefix survives.
    tw.input.value = "A. B. done. And a longer tail after it";
    await nextTick();
    const outputs = drain(() => tw.current);
    // Stale "inside a fence" state would have hidden the boundary after "done.".
    expect(outputs).toContain("A. B. done.");
    expect(outputs[outputs.length - 1]).toBe(
      "A. B. done. And a longer tail after it",
    );
    tw.scope.stop();
  });

  it("pauses after a delimiter in char mode when pauseMs is set", async () => {
    const config: TypewriterConfig = { pauseMs: 200, delimiters: ["."] };
    const tw = setup({ input: "", typewriter: config, active: true });
    const text = "Ab. Cd";
    tw.input.value = text;
    await nextTick();
    const outputs = drain(() => tw.current);
    // The pause shows up as repeated frames on 'Ab.'; drain collapses them,
    // but the reveal must have stopped exactly at the delimiter.
    expect(outputs).toContain("Ab.");
    expect(outputs[outputs.length - 1]).toBe(text);
    tw.scope.stop();
  });
});
