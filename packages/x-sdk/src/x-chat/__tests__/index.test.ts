import { describe, expect, it, vi } from "vitest";
import { computed, effectScope, nextTick, reactive, readonly, ref } from "vue";

import AbstractChatProvider from "../../chat-providers/AbstractChatProvider";
import {
  AbstractXRequestClass,
  type XRequestCallbacks,
  type XRequestReactiveState,
} from "../../x-request";
import useXChat from "../index";
import { chatMessagesStoreHelper } from "../store";

type ChatInput = {
  input: string;
};

class MockManualRequest extends AbstractXRequestClass<
  ChatInput,
  string,
  string
> {
  private _asyncHandler: Promise<void> = Promise.resolve();
  private _state = reactive<XRequestReactiveState>({
    isTimeout: false,
    isStreamTimeout: false,
    isRequesting: false,
  });

  constructor(private readonly shouldFail: { value: boolean }) {
    super("https://mock.request", { manual: true });
  }

  get asyncHandler() {
    return this._asyncHandler;
  }

  get isTimeout() {
    return this._state.isTimeout;
  }

  get isStreamTimeout() {
    return this._state.isStreamTimeout;
  }

  get isRequesting() {
    return this._state.isRequesting;
  }

  get manual() {
    return true;
  }

  get state() {
    return readonly(this._state);
  }

  run(params?: ChatInput): void {
    const callbacks = this.options.callbacks as
      | XRequestCallbacks<string, string>
      | undefined;

    this._state.isRequesting = true;

    this._asyncHandler = new Promise(resolve => {
      setTimeout(() => {
        const headers = new Headers({
          "content-type": "application/json",
        });

        if (this.shouldFail.value) {
          callbacks?.onError?.(
            new Error("MockError"),
            { error: { message: "mock failed" } },
            headers,
          );
        } else {
          const chunk = `echo:${params?.input || ""}`;
          callbacks?.onUpdate?.(chunk, headers);
          callbacks?.onSuccess?.([chunk], headers);
        }

        this._state.isRequesting = false;
        resolve();
      }, 0);
    });
  }

  abort(): void {
    this._state.isRequesting = false;
  }
}

class MockProvider extends AbstractChatProvider<string, ChatInput, string> {
  transformParams(requestParams: Partial<ChatInput>): ChatInput {
    return {
      input: requestParams.input || "",
    };
  }

  transformLocalMessage(requestParams: Partial<ChatInput>) {
    return requestParams.input || "";
  }

  transformMessage(info: {
    originMessage?: string;
    chunk: string;
    chunks: string[];
  }): string {
    if (info.chunk) {
      return info.chunk;
    }

    if (Array.isArray(info.chunks) && info.chunks.length > 0) {
      return info.chunks[info.chunks.length - 1];
    }

    return info.originMessage || "";
  }
}

class DeferredManualRequest extends AbstractXRequestClass<
  ChatInput,
  string,
  string
> {
  private _state = reactive<XRequestReactiveState>({
    isTimeout: false,
    isStreamTimeout: false,
    isRequesting: false,
  });
  private callbacks?: XRequestCallbacks<string, string>;
  private params?: ChatInput;

  constructor() {
    super("https://mock.request", { manual: true });
  }

  get asyncHandler() {
    return Promise.resolve();
  }

  get isTimeout() {
    return this._state.isTimeout;
  }

  get isStreamTimeout() {
    return this._state.isStreamTimeout;
  }

  get isRequesting() {
    return this._state.isRequesting;
  }

  get manual() {
    return true;
  }

  get state() {
    return readonly(this._state);
  }

  run(params?: ChatInput): void {
    this.params = params;
    this.callbacks = this.options.callbacks as
      | XRequestCallbacks<string, string>
      | undefined;
    this._state.isRequesting = true;
  }

  resolve() {
    const headers = new Headers({
      "content-type": "application/json",
    });
    const chunk = `echo:${this.params?.input || ""}`;
    this.callbacks?.onUpdate?.(chunk, headers);
    this.callbacks?.onSuccess?.([chunk], headers);
    this._state.isRequesting = false;
  }

  abort(): void {
    this._state.isRequesting = false;
  }
}

describe("useXChat", () => {
  it("uses reactive requestPlaceholder and requestFallback refs", async () => {
    vi.useFakeTimers();

    const shouldFail = ref(false);
    const request = new MockManualRequest(shouldFail);
    const provider = new MockProvider({ request });
    const requestPlaceholder = ref("Thinking #1");
    const requestFallback = ref("Fallback #1");

    const scope = effectScope();
    const chat = scope.run(() =>
      useXChat<string, string, ChatInput, string>({
        provider,
        requestPlaceholder,
        requestFallback,
      }),
    );

    expect(chat).toBeTruthy();
    if (!chat) return;

    chat.onRequest({ input: "hello" });

    expect(chat.messages.value.at(-1)?.status).toBe("loading");
    expect(chat.messages.value.at(-1)?.message).toBe("Thinking #1");

    await vi.runAllTimersAsync();
    await request.asyncHandler;

    requestPlaceholder.value = "Thinking #2";
    chat.onRequest({ input: "again" });
    expect(chat.messages.value.at(-1)?.status).toBe("loading");
    expect(chat.messages.value.at(-1)?.message).toBe("Thinking #2");

    await vi.runAllTimersAsync();
    await request.asyncHandler;

    shouldFail.value = true;
    chat.onRequest({ input: "error" });
    await vi.runAllTimersAsync();
    await request.asyncHandler;

    expect(chat.messages.value.at(-1)?.status).toBe("error");
    expect(chat.messages.value.at(-1)?.message).toBe("Fallback #1");

    requestFallback.value = "Fallback #2";
    chat.onRequest({ input: "error-again" });
    await vi.runAllTimersAsync();
    await request.asyncHandler;

    expect(chat.messages.value.at(-1)?.status).toBe("error");
    expect(chat.messages.value.at(-1)?.message).toBe("Fallback #2");

    scope.stop();
    vi.useRealTimers();
  });

  it("refreshes default messages when defaultMessages ref changes", async () => {
    const defaultMessages = ref([{ message: "history-1" }]);

    const scope = effectScope();
    const chat = scope.run(() =>
      useXChat({
        defaultMessages,
      }),
    );

    expect(chat).toBeTruthy();
    if (!chat) return;

    await Promise.resolve();
    await nextTick();

    expect(chat.messages.value.map(item => item.message)).toEqual([
      "history-1",
    ]);

    defaultMessages.value = [{ message: "history-2" }];

    await nextTick();
    await Promise.resolve();

    expect(chat.messages.value.map(item => item.message)).toEqual([
      "history-2",
    ]);

    scope.stop();
  });

  it("accepts computed provider refs", async () => {
    vi.useFakeTimers();

    const shouldFail = ref(false);
    const provider = computed(
      () =>
        new MockProvider({
          request: new MockManualRequest(shouldFail),
        }),
    );

    const scope = effectScope();
    const chat = scope.run(() =>
      useXChat<string, string, ChatInput, string>({
        provider,
      }),
    );

    expect(chat).toBeTruthy();
    if (!chat) return;

    chat.onRequest({ input: "provider" });
    await vi.runAllTimersAsync();

    expect(chat.messages.value.at(-1)?.status).toBe("success");

    scope.stop();
    vi.useRealTimers();
  });

  it("derives parsedMessages from parser output", async () => {
    vi.useFakeTimers();

    const scope = effectScope();
    const chat = scope.run(() =>
      useXChat<string, string>({
        parser: message => [message.toUpperCase(), `${message}!`],
      }),
    );

    expect(chat).toBeTruthy();
    if (!chat) return;

    await Promise.resolve();
    await nextTick();

    chat.setMessages([
      {
        id: "msg_1",
        message: "hello",
        status: "success",
      },
    ]);

    await vi.advanceTimersByTimeAsync(60);
    await nextTick();

    expect(chat.parsedMessages.value).toEqual([
      {
        id: "msg_1_0",
        message: "HELLO",
        status: "success",
      },
      {
        id: "msg_1_1",
        message: "hello!",
        status: "success",
      },
    ]);

    scope.stop();
    vi.useRealTimers();
  });

  it("keeps streaming updates isolated to the request conversation after switching", async () => {
    const activeConversationKey = ref("a");
    const requestA = new DeferredManualRequest();
    const requestB = new DeferredManualRequest();
    const providers = {
      a: new MockProvider({ request: requestA }),
      b: new MockProvider({ request: requestB }),
    };

    const scope = effectScope();
    const chat = scope.run(() =>
      useXChat<string, string, ChatInput, string>({
        provider: computed(
          () => providers[activeConversationKey.value as "a" | "b"],
        ),
        conversationKey: activeConversationKey,
      }),
    );

    expect(chat).toBeTruthy();
    if (!chat) return;

    await Promise.resolve();
    await nextTick();

    chat.onRequest({ input: "from-a" });
    expect(chat.messages.value.map(item => item.message)).toEqual(["from-a"]);

    activeConversationKey.value = "b";
    await nextTick();

    expect(chat.messages.value).toEqual([]);

    requestA.resolve();
    await nextTick();

    expect(chat.messages.value).toEqual([]);
    expect(
      chatMessagesStoreHelper
        .getMessages("a")
        ?.map(item => ({ message: item.message, status: item.status })),
    ).toEqual([
      { message: "from-a", status: "local" },
      { message: "echo:from-a", status: "success" },
    ]);
    expect(chatMessagesStoreHelper.getMessages("b")).toEqual([]);

    activeConversationKey.value = "a";
    await nextTick();

    expect(chat.messages.value.map(item => item.message)).toEqual([
      "from-a",
      "echo:from-a",
    ]);

    scope.stop();
  });
});
