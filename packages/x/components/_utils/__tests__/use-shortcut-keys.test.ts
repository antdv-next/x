import { KeyCode } from "@v-c/util";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import type { ShortcutKeyActionType } from "../hooks/use-shortcut-keys";

import useShortcutKeys from "../hooks/use-shortcut-keys";

function fireKeydown(opts: Partial<KeyboardEvent> & { keyCode?: number } = {}) {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ...opts,
  });
  Object.defineProperty(event, "keyCode", { value: opts.keyCode ?? 0 });
  document.dispatchEvent(event);
  return event;
}

function fireKeyup() {
  document.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
}

function mountWithShortcutKeys(
  shortcutKeys: Record<string, any>,
  options?: { shouldIgnore?: (event: KeyboardEvent) => boolean },
) {
  let result: any;
  const Comp = defineComponent({
    setup() {
      result = useShortcutKeys("conversations", shortcutKeys, options);
      return () => h("div");
    },
  });
  const wrapper = mount(Comp);
  return { wrapper, getResult: () => result };
}

describe("useShortcutKeys", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not register listeners when no shortcut keys", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    mountWithShortcutKeys({});
    const keydownCalls = addSpy.mock.calls.filter(
      ([type]) => type === "keydown",
    );
    expect(keydownCalls.length).toBe(0);
  });

  it("should detect Ctrl+A shortcut", async () => {
    const { getResult } = mountWithShortcutKeys({
      send: ["Ctrl", KeyCode.A],
    });
    const [shortcutAction] = getResult();

    fireKeydown({ keyCode: KeyCode.A, ctrlKey: true });
    await nextTick();

    expect(shortcutAction.value).not.toBeNull();
    expect(shortcutAction.value!.name).toBe("send");
    expect(shortcutAction.value!.actionKeyCode).toBe(KeyCode.A);
  });

  it("should not trigger when modifier key is not pressed", async () => {
    const { getResult } = mountWithShortcutKeys({
      send: ["Ctrl", KeyCode.A],
    });
    const [shortcutAction] = getResult();

    fireKeydown({ keyCode: KeyCode.A, ctrlKey: false });
    await nextTick();

    expect(shortcutAction.value).toBeNull();
  });

  it("should detect Ctrl+Shift combo", async () => {
    const { getResult } = mountWithShortcutKeys({
      save: ["Ctrl", "Shift", KeyCode.A],
    });
    const [shortcutAction] = getResult();

    fireKeydown({ keyCode: KeyCode.A, ctrlKey: true, shiftKey: true });
    await nextTick();

    expect(shortcutAction.value).not.toBeNull();
    expect(shortcutAction.value!.name).toBe("save");
  });

  it("should not trigger Ctrl+Shift when only Ctrl is pressed", async () => {
    const { getResult } = mountWithShortcutKeys({
      save: ["Ctrl", "Shift", KeyCode.A],
    });
    const [shortcutAction] = getResult();

    fireKeydown({ keyCode: KeyCode.A, ctrlKey: true, shiftKey: false });
    await nextTick();

    expect(shortcutAction.value).toBeNull();
  });

  it("should handle multiple shortcut key bindings", async () => {
    const { getResult } = mountWithShortcutKeys({
      send: ["Ctrl", KeyCode.A],
      cancel: ["Ctrl", KeyCode.B],
    });
    const [shortcutAction] = getResult();

    fireKeydown({ keyCode: KeyCode.B, ctrlKey: true });
    await nextTick();

    expect(shortcutAction.value!.name).toBe("cancel");
    expect(shortcutAction.value!.actionKeyCode).toBe(KeyCode.B);
  });

  it("should handle multi-binding array format", async () => {
    const { getResult } = mountWithShortcutKeys({
      action: [
        ["Ctrl", KeyCode.A],
        ["Ctrl", KeyCode.B],
      ],
    });
    const [shortcutAction] = getResult();

    fireKeydown({ keyCode: KeyCode.B, ctrlKey: true });
    await nextTick();

    expect(shortcutAction.value!.name).toBe("action");
    expect(shortcutAction.value!.index).toBe(1);
  });

  it("should lock on keydown and unlock on keyup", async () => {
    const { getResult } = mountWithShortcutKeys({
      send: ["Ctrl", KeyCode.A],
    });
    const [, , subscribe] = getResult();
    const calls: ShortcutKeyActionType[] = [];
    subscribe((action: ShortcutKeyActionType) => calls.push(action));

    fireKeydown({ keyCode: KeyCode.A, ctrlKey: true });
    await nextTick();
    expect(calls.length).toBe(1);

    // Second keydown without keyup should be locked
    fireKeydown({ keyCode: KeyCode.A, ctrlKey: true });
    await nextTick();
    expect(calls.length).toBe(1);

    // After keyup, should trigger again
    fireKeyup();
    fireKeydown({ keyCode: KeyCode.A, ctrlKey: true });
    await nextTick();
    expect(calls.length).toBe(2);
  });

  it("should call subscribe observer", async () => {
    const { getResult } = mountWithShortcutKeys({
      send: ["Ctrl", KeyCode.A],
    });
    const [, , subscribe] = getResult();

    const observed: ShortcutKeyActionType[] = [];
    subscribe((action: ShortcutKeyActionType) => observed.push(action));

    fireKeydown({ keyCode: KeyCode.A, ctrlKey: true });
    await nextTick();

    expect(observed.length).toBe(1);
    expect(observed[0]!.name).toBe("send");
  });

  it("should return shortcutKeysInfo with icons", () => {
    const { getResult } = mountWithShortcutKeys({
      send: ["Ctrl", KeyCode.A],
    });
    const [, shortcutKeysInfo] = getResult();

    expect(shortcutKeysInfo.value.send).toBeDefined();
    expect(shortcutKeysInfo.value.send.shortcutKeysIcon.length).toBe(2);
  });

  it("should handle number shortcut keys", () => {
    const { getResult } = mountWithShortcutKeys({
      select: ["Ctrl", "number"],
    });
    const [, shortcutKeysInfo] = getResult();

    expect(shortcutKeysInfo.value.select).toBeDefined();
  });

  it("should detect number key and return actionKeyCodeNumber", async () => {
    const { getResult } = mountWithShortcutKeys({
      select: ["Ctrl", "number"],
    });
    const [shortcutAction] = getResult();

    fireKeydown({ keyCode: KeyCode.ONE, ctrlKey: true });
    await nextTick();

    expect(shortcutAction.value!.actionKeyCodeNumber).toBe(0);
  });

  it("should remove event listeners on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { wrapper } = mountWithShortcutKeys({
      send: ["Ctrl", KeyCode.A],
    });

    wrapper.unmount();

    const keydownCalls = removeSpy.mock.calls.filter(
      ([type]) => type === "keydown",
    );
    const keyupCalls = removeSpy.mock.calls.filter(
      ([type]) => type === "keyup",
    );
    expect(keydownCalls.length).toBeGreaterThanOrEqual(1);
    expect(keyupCalls.length).toBeGreaterThanOrEqual(1);
  });

  it("should respect shouldIgnore option", async () => {
    const { getResult } = mountWithShortcutKeys(
      { send: ["Ctrl", KeyCode.A] },
      { shouldIgnore: () => true },
    );
    const [shortcutAction] = getResult();

    fireKeydown({ keyCode: KeyCode.A, ctrlKey: true });
    await nextTick();

    expect(shortcutAction.value).toBeNull();
  });

  it("should reactively respond to shortcutKeys changes", async () => {
    let result: any;
    const keys = ref<Record<string, any>>({
      send: ["Ctrl", KeyCode.A],
    });
    const Comp = defineComponent({
      setup() {
        result = useShortcutKeys("conversations", keys);
        return () => h("div");
      },
    });
    mount(Comp);

    fireKeydown({ keyCode: KeyCode.A, ctrlKey: true });
    await nextTick();
    expect(result[0].value!.name).toBe("send");

    // Change shortcut keys
    fireKeyup();
    result[0].value = null;
    keys.value = { cancel: ["Ctrl", KeyCode.B] };
    await nextTick();

    fireKeydown({ keyCode: KeyCode.B, ctrlKey: true });
    await nextTick();
    expect(result[0].value!.name).toBe("cancel");
  });
});
