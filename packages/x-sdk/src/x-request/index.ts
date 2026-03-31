import type { MaybeRef } from "vue";

import { reactive, readonly } from "vue";

import type { AnyObject } from "../_util/types";
import type { MessageInfo, SimpleType } from "../x-chat";
import type {
  JSONOutPut,
  SSEOutput,
  XReadableStream,
  XStreamOptions,
} from "../x-stream";
import type { XFetchMiddlewares } from "./x-fetch";

import resolveMaybeRef from "../_util/resolveMaybeRef";
import XStream from "../x-stream";
import xFetch from "./x-fetch";

export interface XRequestCallbacks<
  Output,
  ChatMessage extends SimpleType = any,
> {
  onSuccess: (
    chunks: Output[],
    responseHeaders: Headers,
    chatMessage?: MessageInfo<ChatMessage>,
  ) => void;

  onError: (
    error: Error,
    errorInfo?: any,
    responseHeaders?: Headers,
    fallbackMsg?: MessageInfo<ChatMessage>,
  ) => void;

  onUpdate?: (
    chunk: Output,
    responseHeaders: Headers,
    chatMessage?: MessageInfo<ChatMessage>,
  ) => void;
}

export interface XRequestOptions<
  Input = AnyObject,
  Output = SSEOutput,
  ChatMessage extends SimpleType = any,
> extends RequestInit {
  callbacks?: XRequestCallbacks<Output, ChatMessage>;
  params?: Partial<Input>;
  headers?: Record<string, string>;
  timeout?: number;
  streamTimeout?: number;
  fetch?: (
    baseURL: Parameters<typeof fetch>[0],
    options: XRequestOptions<Input, Output>,
  ) => Promise<Response>;
  middlewares?: XFetchMiddlewares<Input, Output>;
  transformStream?:
    | XStreamOptions<Output>["transformStream"]
    | ((
        baseURL: string,
        responseHeaders: Headers,
      ) => XStreamOptions<Output>["transformStream"]);
  streamSeparator?: string;
  partSeparator?: string;
  kvSeparator?: string;
  manual?: boolean;
  retryInterval?: number;
  retryTimes?: number;
}

export type XRequestConfigOptions<
  Input = AnyObject,
  Output = SSEOutput,
  ChatMessage extends SimpleType = any,
> = Omit<
  XRequestOptions<Input, Output, ChatMessage>,
  | "callbacks"
  | "params"
  | "headers"
  | "timeout"
  | "streamTimeout"
  | "fetch"
  | "middlewares"
  | "transformStream"
  | "streamSeparator"
  | "partSeparator"
  | "kvSeparator"
  | "manual"
  | "retryInterval"
  | "retryTimes"
> & {
  callbacks?: XRequestCallbacks<Output, ChatMessage>;
  params?: MaybeRef<Partial<Input>>;
  headers?: MaybeRef<Record<string, string>>;
  timeout?: MaybeRef<number>;
  streamTimeout?: MaybeRef<number>;
  fetch?: (
    baseURL: Parameters<typeof fetch>[0],
    options: XRequestOptions<Input, Output>,
  ) => Promise<Response>;
  middlewares?: XFetchMiddlewares<Input, Output>;
  transformStream?:
    | XStreamOptions<Output>["transformStream"]
    | ((
        baseURL: string,
        responseHeaders: Headers,
      ) => XStreamOptions<Output>["transformStream"]);
  streamSeparator?: MaybeRef<string>;
  partSeparator?: MaybeRef<string>;
  kvSeparator?: MaybeRef<string>;
  manual?: MaybeRef<boolean>;
  retryInterval?: MaybeRef<number>;
  retryTimes?: MaybeRef<number>;
};

export type XRequestGlobalOptions<Input, Output> = Pick<
  XRequestConfigOptions<Input, Output>,
  | "headers"
  | "timeout"
  | "streamTimeout"
  | "middlewares"
  | "fetch"
  | "transformStream"
  | "manual"
>;

export type XRequestFunction<Input = AnyObject, Output = SSEOutput> = (
  baseURL: MaybeRef<string>,
  options?: XRequestConfigOptions<Input, Output>,
) => XRequestClass<Input, Output>;

export interface XRequestReactiveState {
  isTimeout: boolean;
  isStreamTimeout: boolean;
  isRequesting: boolean;
}

const globalOptions: XRequestGlobalOptions<AnyObject, AnyObject> = {
  manual: false,
  headers: {
    "Content-Type": "application/json",
  },
};

export function setXRequestGlobalOptions<Input, Output>(
  options: XRequestGlobalOptions<Input, Output>,
) {
  Object.assign(globalOptions, options);
}

const LastEventId = "Last-Event-ID";

export abstract class AbstractXRequestClass<
  Input,
  Output,
  ChatMessage extends SimpleType = any,
> {
  baseURL!: MaybeRef<string>;
  options!: XRequestConfigOptions<Input, Output, ChatMessage>;

  constructor(
    baseURL: MaybeRef<string>,
    options?: XRequestConfigOptions<Input, Output, ChatMessage>,
  ) {
    const resolvedBaseURL = resolveMaybeRef(baseURL);
    if (!resolvedBaseURL || typeof resolvedBaseURL !== "string")
      throw new Error("The baseURL is not valid!");
    this.baseURL = baseURL;
    this.options = options || {};
  }

  abstract get asyncHandler(): Promise<any>;
  abstract get isTimeout(): boolean;
  abstract get isStreamTimeout(): boolean;
  abstract get isRequesting(): boolean;
  abstract get manual(): boolean;
  abstract get state(): Readonly<XRequestReactiveState>;

  abstract run(params?: Input): void;
  abstract abort(): void;
}

export class XRequestClass<
  Input = AnyObject,
  Output = SSEOutput,
  ChatMessage extends SimpleType = any,
> extends AbstractXRequestClass<Input, Output, ChatMessage> {
  private _asyncHandler!: Promise<any>;

  private timeoutHandler!: number;
  private streamTimeoutHandler!: number;
  private abortController!: AbortController;
  private _state = reactive<XRequestReactiveState>({
    isTimeout: false,
    isStreamTimeout: false,
    isRequesting: false,
  });
  private lastManualParams?: Partial<Input>;
  private retryTimes = 0;
  private retryTimer!: ReturnType<typeof setTimeout>;
  private lastEventId = undefined;

  public get asyncHandler() {
    return this._asyncHandler;
  }

  public get isTimeout() {
    return this._state.isTimeout;
  }

  private set isTimeout(value: boolean) {
    this._state.isTimeout = value;
  }

  public get isStreamTimeout() {
    return this._state.isStreamTimeout;
  }

  private set isStreamTimeout(value: boolean) {
    this._state.isStreamTimeout = value;
  }

  public get isRequesting() {
    return this._state.isRequesting;
  }

  public get manual() {
    const localManual = resolveMaybeRef(this.options.manual);
    if (typeof localManual === "boolean") {
      return localManual;
    }

    const globalManual = resolveMaybeRef(globalOptions.manual);
    if (typeof globalManual === "boolean") {
      return globalManual;
    }

    return false;
  }

  public get state() {
    return readonly(this._state);
  }

  constructor(
    baseURL: MaybeRef<string>,
    options?: XRequestConfigOptions<Input, Output, ChatMessage>,
  ) {
    super(baseURL, options);
    if (!this.manual) {
      this.init();
    }
  }

  public run(params?: Input) {
    if (this.manual) {
      this.resetRetry();
      this.lastManualParams = params;
      this.init(params);
      return true;
    }
    console.warn("The request is not manual, so it cannot be run!");
    return false;
  }

  public abort() {
    clearTimeout(this.timeoutHandler);
    clearTimeout(this.streamTimeoutHandler);
    this.abortController.abort();
  }

  private init(
    extraParams?: Partial<Input>,
    extraHeaders?: Record<string, string>,
  ) {
    const currentBaseURL = resolveMaybeRef(this.baseURL);
    if (!currentBaseURL || typeof currentBaseURL !== "string") {
      throw new Error("The baseURL is not valid!");
    }

    this.abortController = new AbortController();
    this.isTimeout = false;
    this.isStreamTimeout = false;
    const {
      callbacks: sourceCallbacks,
      params: sourceParams,
      headers: sourceHeaders,
      transformStream: sourceTransformStream,
      fetch: sourceFetch,
      timeout: sourceTimeout,
      streamTimeout: sourceStreamTimeout,
      middlewares: sourceMiddlewares,
      streamSeparator: sourceStreamSeparator,
      partSeparator: sourcePartSeparator,
      kvSeparator: sourceKvSeparator,
      manual: _sourceManual,
      retryInterval: sourceRetryInterval,
      retryTimes: sourceRetryTimes,
      ...otherOptions
    } = this.options;

    const callbacks = sourceCallbacks;
    const params = resolveMaybeRef(sourceParams);
    const headers = resolveMaybeRef(sourceHeaders) || {};
    const transformStream = sourceTransformStream;
    const fetch = sourceFetch;
    const timeout = resolveMaybeRef(sourceTimeout);
    const streamTimeout = resolveMaybeRef(sourceStreamTimeout);
    const middlewares = sourceMiddlewares;
    const streamSeparator = resolveMaybeRef(sourceStreamSeparator);
    const partSeparator = resolveMaybeRef(sourcePartSeparator);
    const kvSeparator = resolveMaybeRef(sourceKvSeparator);
    const retryInterval = resolveMaybeRef(sourceRetryInterval);
    const retryTimes = resolveMaybeRef(sourceRetryTimes);
    const globalHeaders = resolveMaybeRef(globalOptions.headers) || {};

    const margeHeaders = Object.assign(
      {},
      globalHeaders,
      headers,
      extraHeaders || {},
    );
    const requestInit: XRequestOptions<Input, Output> = {
      ...otherOptions,
      method: "POST",
      body: JSON.stringify({
        ...params,
        ...extraParams,
      }),
      params: {
        ...params,
        ...extraParams,
      } as Input,
      headers: margeHeaders,
      signal: this.abortController.signal,
      middlewares,
    };

    if (timeout && timeout > 0) {
      this.timeoutHandler = window.setTimeout(() => {
        this.isTimeout = true;
        this.finishRequest();
        callbacks?.onError?.(new Error("TimeoutError"));
      }, timeout);
    }

    this.startRequest();
    this._asyncHandler = xFetch<Input, Output>(currentBaseURL, {
      fetch,
      ...requestInit,
    })
      .then(async response => {
        clearTimeout(this.timeoutHandler);

        if (this.isTimeout) return;

        if (transformStream) {
          let transformer =
            transformStream as XStreamOptions<Output>["transformStream"];
          if (typeof transformStream === "function") {
            transformer = transformStream(currentBaseURL, response.headers);
          }
          await this.customResponseHandler<Output, ChatMessage>(
            response,
            callbacks,
            transformer,
            streamTimeout,
            streamSeparator,
            partSeparator,
            kvSeparator,
          );
          return;
        }
        const contentType = response.headers.get("content-type") || "";
        const mimeType = contentType.split(";")[0].trim();
        switch (mimeType) {
          case "text/event-stream":
            await this.sseResponseHandler<Output, ChatMessage>(
              response,
              callbacks,
              streamTimeout,
              streamSeparator,
              partSeparator,
              kvSeparator,
            );
            break;
          case "application/json":
            await this.jsonResponseHandler<Output, ChatMessage>(
              response,
              callbacks,
            );
            break;
          default:
            throw new Error(
              `The response content-type: ${contentType} is not support!`,
            );
        }
      })
      .catch(error => {
        clearTimeout(this.timeoutHandler);
        this.finishRequest();
        const err =
          error instanceof Error || error instanceof DOMException
            ? error
            : new Error("Unknown error!");
        const returnOfOnError = callbacks?.onError?.(err);
        if (err.name !== "AbortError") {
          const actualRetryInterval =
            typeof returnOfOnError === "number"
              ? returnOfOnError
              : retryInterval;
          if (actualRetryInterval && actualRetryInterval > 0) {
            if (
              typeof retryTimes === "number" &&
              this.retryTimes >= retryTimes
            ) {
              return;
            }
            clearTimeout(this.retryTimer);
            this.retryTimer = setTimeout(() => {
              const extraHeaders: Record<string, string> = {};
              if (typeof this.lastEventId !== "undefined") {
                extraHeaders[LastEventId] = this.lastEventId;
              }
              this.init(this.lastManualParams, extraHeaders);
            }, actualRetryInterval);
            this.retryTimes = this.retryTimes + 1;
          }
        }
      });
  }

  private startRequest() {
    this._state.isRequesting = true;
  }

  private finishRequest() {
    this._state.isRequesting = false;
  }

  private customResponseHandler = async <
    Output = SSEOutput,
    ChatMessage extends SimpleType = any,
  >(
    response: Response,
    callbacks?: XRequestCallbacks<Output, ChatMessage>,
    transformStream?: XStreamOptions<Output>["transformStream"],
    streamTimeout?: number,
    streamSeparator?: string,
    partSeparator?: string,
    kvSeparator?: string,
  ) => {
    const stream = XStream<Output>({
      readableStream: response.body!,
      transformStream,
      streamSeparator,
      partSeparator,
      kvSeparator,
    });
    await this.processStream<Output, ChatMessage>(
      stream,
      response,
      callbacks,
      streamTimeout,
    );
  };

  private sseResponseHandler = async <
    Output = SSEOutput,
    ChatMessage extends SimpleType = string,
  >(
    response: Response,
    callbacks?: XRequestCallbacks<Output, ChatMessage>,
    streamTimeout?: number,
    streamSeparator?: string,
    partSeparator?: string,
    kvSeparator?: string,
  ) => {
    const stream = XStream<Output>({
      readableStream: response.body!,
      streamSeparator,
      partSeparator,
      kvSeparator,
    });
    await this.processStream<Output, ChatMessage>(
      stream,
      response,
      callbacks,
      streamTimeout,
    );
  };

  private async processStream<Output, ChatMessage extends SimpleType = string>(
    stream: XReadableStream<Output>,
    response: Response,
    callbacks?: XRequestCallbacks<Output, ChatMessage>,
    streamTimeout?: number,
  ) {
    const chunks: Output[] = [];
    const iterator = stream[Symbol.asyncIterator]();
    let result: IteratorResult<Output, any>;
    do {
      if (streamTimeout) {
        this.streamTimeoutHandler = window.setTimeout(() => {
          this.isStreamTimeout = true;
          this.finishRequest();
          callbacks?.onError?.(
            new Error("StreamTimeoutError"),
            undefined,
            response.headers,
          );
        }, streamTimeout);
      }

      result = await iterator.next();
      clearTimeout(this.streamTimeoutHandler);
      if (this.isStreamTimeout) {
        break;
      }

      if (result.value) {
        chunks.push(result.value);
        callbacks?.onUpdate?.(result.value, response.headers);
        if (typeof result?.value?.id !== "undefined") {
          this.lastEventId = result.value.id;
        }
      }
    } while (!result.done);
    if (streamTimeout) {
      clearTimeout(this.streamTimeoutHandler);
      if (this.isStreamTimeout) {
        this.finishRequest();
        return;
      }
    }
    this.finishRequest();
    callbacks?.onSuccess?.(chunks, response.headers);
  }

  private jsonResponseHandler = async <
    Output = JSONOutPut,
    ChatMessage extends SimpleType = string,
  >(
    response: Response,
    callbacks?: XRequestCallbacks<Output, ChatMessage>,
  ) => {
    const chunk: Output = await response.json();

    if ((chunk as JSONOutPut)?.success === false) {
      this.finishRequest();
      const error = new Error((chunk as JSONOutPut).message || "System error");
      error.name = (chunk as JSONOutPut).name || "SystemError";
      callbacks?.onError?.(error, chunk, response.headers);
    } else {
      callbacks?.onUpdate?.(chunk, response.headers);
      this.finishRequest();
      callbacks?.onSuccess?.([chunk], response.headers);
    }
  };

  private resetRetry() {
    clearTimeout(this.retryTimer);
    this.retryTimes = 0;
    this.lastEventId = undefined;
  }
}

function XRequest<
  Input = AnyObject,
  Output = SSEOutput,
  ChatMessage extends SimpleType = any,
>(
  baseURL: MaybeRef<string>,
  options?: XRequestConfigOptions<Input, Output, ChatMessage>,
): AbstractXRequestClass<Input, Output, ChatMessage> {
  return new XRequestClass<Input, Output, ChatMessage>(baseURL, options);
}

export default XRequest;
